import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";

export async function listFunds(status?: string) {
  return prisma.fund.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
  });
}

export async function getFund(id: string) {
  return prisma.fund.findUnique({
    where: { id },
    include: {
      organization: true,
      activityLogs: { orderBy: { createdAt: "desc" } },
      supportRequests: { orderBy: { createdAt: "desc" } },
    }
  });
}

export async function createFund(input: { 
  name: string; 
  category: string; 
  description: string;
  targetAmount: number;
  organizationId?: string;
}) {
  // Resolve a valid organizationId
  let organizationId = input.organizationId;
  let organization = null;

  if (organizationId) {
    organization = await prisma.user.findUnique({ where: { id: organizationId } });
  }

  if (!organization) {
    organization = await prisma.user.findFirst({ where: { role: "ORGANIZATION" } });
  }

  if (!organization) {
    throw new Error("No organization found. Run npx prisma db seed.");
  }

  console.log("Resolved organizationId:", organization.id);
  organizationId = organization.id;

  const fund = await prisma.fund.create({
    data: {
      name: input.name,
      category: input.category,
      description: input.description,
      targetAmount: new Prisma.Decimal(input.targetAmount),
      organizationId: organizationId,
    },
  });

  await prisma.activityLog.create({
    data: {
      fundId: fund.id,
      action: "FUND_CREATED",
      details: `Fund "${fund.name}" created for ${fund.category}`,
    },
  });

  return fund;
}

export async function contribute(input: {
  fundId: string;
  amount: number;
  walletAddress: string;
  donorId?: string;
  txHash?: string;
  supportRequestId?: string;
}) {
  const fund = await prisma.fund.findUnique({ where: { id: input.fundId } });
  if (!fund) throw new Error("Fund not found");

  const [contribution] = await prisma.$transaction(async (tx) => {
    // 1. Create contribution record
    const contributionData: Prisma.ContributionUncheckedCreateInput = {
      fundId: input.fundId,
      walletAddress: input.walletAddress,
      amount: new Prisma.Decimal(input.amount),
      donorId: input.donorId,
      txHash: input.txHash,
      supportRequestId: input.supportRequestId,
    };

    const contribution = await tx.contribution.create({
      data: contributionData,
    });

    // 2. Update Fund balance
    await tx.fund.update({
      where: { id: input.fundId },
      data: {
        currentBalance: { increment: new Prisma.Decimal(input.amount) },
      },
    });

    // 3. Update specific SupportRequest if provided
    if (input.supportRequestId) {
      const request = await tx.supportRequest.findUnique({
        where: { id: input.supportRequestId }
      });

      if (!request) throw new Error("Support request not found");

      // Validate status: Reject if not in an active funding state
      const allowedStatuses = ["APPROVED", "PUBLISHED", "FUNDING"];
      if (!allowedStatuses.includes(request.status)) {
        throw new Error(`Sponsorship failed: Need is currently ${request.status}. It must be verified first.`);
      }

      const currentRaised = Number(request.amountRaised ?? 0);
      const target = Number(request.amount ?? 0);
      
      if (currentRaised >= target) {
        throw new Error("Sponsorship failed: This need is already fully funded.");
      }

      const additionalAmount = Number(input.amount);
      const newRaised = Math.min(target, currentRaised + additionalAmount);

      await tx.supportRequest.update({
        where: { id: input.supportRequestId },
        data: {
          amountRaised: new Prisma.Decimal(newRaised),
          donorCount: { increment: 1 },
          // If fully funded, we could optionally update status here
          status: newRaised >= target ? "FUNDED" : request.status
        },
      });
    }

    // 4. Create activity log
    await tx.activityLog.create({
      data: {
        fundId: input.fundId,
        userId: input.donorId,
        action: "CONTRIBUTION_RECEIVED",
        details: `Donation of ${input.amount} USDC received from ${input.walletAddress}${input.supportRequestId ? ` for specific need ${input.supportRequestId}` : ''}`,
        txHash: input.txHash,
      },
    });

    return [contribution];
  });

  return contribution;
}

export async function requestSupport(input: {
  fundId: string;
  requesterId: string;
  amount: number;
  purpose: string;
  description: string;
}) {
  const [request] = await prisma.$transaction(async (tx) => {
    const request = await tx.supportRequest.create({
      data: {
        fundId: input.fundId,
        requesterId: input.requesterId,
        amount: new Prisma.Decimal(input.amount),
        purpose: input.purpose,
        description: input.description,
      },
    });

    await tx.fund.update({
      where: { id: input.fundId },
      data: {
        targetAmount: { increment: new Prisma.Decimal(input.amount) },
      },
    });

    await tx.activityLog.create({
      data: {
        fundId: input.fundId,
        userId: input.requesterId,
        action: "SUPPORT_REQUESTED",
        details: `Support request of ${input.amount} USDC for ${input.purpose}`,
      },
    });

    return [request];
  });

  return request;
}

export async function approveFund(id: string) {
  const fund = await prisma.fund.findUnique({ where: { id } });
  if (!fund) throw new Error("Fund not found");

  await prisma.fund.update({
    where: { id },
    data: { status: "ACTIVE" },
  });

  await prisma.activityLog.create({
    data: {
      fundId: id,
      action: "FUND_APPROVED",
      details: `Fund "${fund.name}" approved by admin.`,
    },
  });

  return fund;
}

export async function archiveFund(id: string) {
  const fund = await prisma.fund.findUnique({ where: { id } });
  if (!fund) throw new Error("Fund not found");

  await prisma.fund.update({
    where: { id },
    data: { status: "ARCHIVED" },
  });

  await prisma.activityLog.create({
    data: {
      fundId: id,
      action: "FUND_ARCHIVED",
      details: `Fund "${fund.name}" has been archived by admin.`,
    },
  });

  return fund;
}

export async function rejectFund(id: string, reason: string) {
  const fund = await prisma.fund.findUnique({ where: { id } });
  if (!fund) throw new Error("Fund not found");

  await prisma.fund.update({
    where: { id },
    data: { 
      status: "REJECTED",
      rejectionReason: reason
    },
  });

  await prisma.activityLog.create({
    data: {
      fundId: id,
      action: "FUND_REJECTED",
      details: `Fund "${fund.name}" rejected by admin. Reason: ${reason}`,
    },
  });

  return fund;
}

export async function updateFund(id: string, data: { name?: string; description?: string; targetAmount?: number; category?: string }) {
  const fund = await prisma.fund.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      targetAmount: data.targetAmount ? new Prisma.Decimal(data.targetAmount) : undefined,
      category: data.category
    },
  });

  await prisma.activityLog.create({
    data: {
      fundId: id,
      action: "FUND_UPDATED",
      details: `Fund "${fund.name}" updated by admin.`,
    },
  });

  return fund;
}

export async function archiveSupportRequest(id: string) {
  const request = await prisma.supportRequest.update({
    where: { id },
    data: { status: "ARCHIVED" },
  });

  await prisma.activityLog.create({
    data: {
      fundId: request.fundId,
      action: "SUPPORT_ARCHIVED",
      details: `Support request for "${request.purpose}" archived by admin.`,
    },
  });

  return request;
}

export async function rejectSupportRequest(id: string, reason: string) {
  const request = await prisma.supportRequest.update({
    where: { id },
    data: { 
      status: "REJECTED",
      rejectionReason: reason
    },
  });

  await prisma.activityLog.create({
    data: {
      fundId: request.fundId,
      action: "SUPPORT_REJECTED",
      details: `Support request for "${request.purpose}" rejected by admin. Reason: ${reason}`,
    },
  });

  return request;
}

export async function updateSupportRequest(id: string, data: { purpose?: string; description?: string; amount?: number }) {
  const request = await prisma.supportRequest.update({
    where: { id },
    data: {
      purpose: data.purpose,
      description: data.description,
      amount: data.amount ? new Prisma.Decimal(data.amount) : undefined,
    },
  });

  await prisma.activityLog.create({
    data: {
      fundId: request.fundId,
      action: "SUPPORT_UPDATED",
      details: `Support request for "${request.purpose}" updated by admin.`,
    },
  });

  return request;
}

export async function approveSupport(requestId: string, approverId: string, notes?: string) {
  const request = await prisma.supportRequest.findUnique({ 
    where: { id: requestId },
    include: { requester: true }
  });
  if (!request) throw new Error("Request not found");

  const [approval] = await prisma.$transaction([
    prisma.approval.create({
      data: {
        requestId,
        approverId,
        notes,
      },
    }),
    prisma.payout.create({
      data: {
        requestId,
        amount: request.amount,
        destinationWallet: request.requester.walletAddress || "G... (Pending NGO Wallet)",
      },
    }),
    prisma.supportRequest.update({
      where: { id: requestId },
      data: { status: "APPROVED" },
    }),
    prisma.activityLog.create({
      data: {
        fundId: request.fundId,
        userId: approverId,
        action: "SUPPORT_APPROVED",
        details: `Request for ${request.amount} USDC ("${request.purpose}") approved for disbursement.`,
      },
    }),
  ]);

  return approval;
}

export async function listSupportRequests() {
  return prisma.supportRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { fund: true, requester: true }
  });
}

export async function listActivityLogs() {
  return prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    include: { fund: true, user: true },
  });
}
