import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding simplified MVP database...");

  // 1. Cleanup
  await prisma.activityLog.deleteMany();
  await prisma.payout.deleteMany();
  await prisma.approval.deleteMany();
  await prisma.contribution.deleteMany();
  await prisma.supportRequest.deleteMany();
  await prisma.fund.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Users
  const admin = await prisma.user.create({
    data: {
      displayName: "System Admin",
      role: "ADMIN",
      verificationStatus: "VERIFIED",
    },
  });

  const ngo = await prisma.user.create({
    data: {
      displayName: "Bayan Health NGO",
      role: "ORGANIZATION",
      verificationStatus: "VERIFIED",
    },
  });

  const donor = await prisma.user.create({
    data: {
      displayName: "Generic Donor",
      role: "DONOR",
      walletAddress: "GDOR...123",
    },
  });

  // Keep a dummy user for 'requesterId' mapping since the schema requires it, 
  // but conceptually this is the NGO submitting it on behalf of the program.
  // Alternatively, we use the NGO's user ID as the requester. Let's use the NGO's ID.

  // 3. Create Impact Programs (Funds)
  const healthProgram = await prisma.fund.create({
    data: {
      name: "Bayan Health Community Care",
      category: "HEALTH_MEDICAL",
      description: "Providing essential healthcare, medicines, and surgical assistance for underserved communities.",
      targetAmount: 5000,
      organizationId: ngo.id,
    },
  });

  const solarProgram = await prisma.fund.create({
    data: {
      name: "Bicol Rural Electrification",
      category: "COMMUNITY_DEVELOPMENT",
      description: "Sustainable solar energy infrastructure for off-grid communities and rural schools.",
      targetAmount: 15000,
      organizationId: ngo.id,
    },
  });

  // 4. Create Funding Needs (Support Requests)
  const need1 = await prisma.supportRequest.create({
    data: {
      fundId: healthProgram.id,
      requesterId: ngo.id,
      amount: 500,
      amountRaised: 0,
      donorCount: 0,
      purpose: "Dental Treatment for Maria",
      description: "Emergency dental extraction and infection treatment for a 12-year old.",
      status: "PENDING",
    },
  });
  
  const need2 = await prisma.supportRequest.create({
    data: {
      fundId: healthProgram.id,
      requesterId: ngo.id,
      amount: 150,
      amountRaised: 0,
      donorCount: 0,
      purpose: "Medicine Support for 5 Seniors",
      description: "One month supply of maintenance medications for hypertension.",
      status: "PENDING",
    },
  });

  const need3 = await prisma.supportRequest.create({
    data: {
      fundId: solarProgram.id,
      requesterId: ngo.id,
      amount: 1000,
      amountRaised: 0,
      donorCount: 0,
      purpose: "Inverter Replacement for Malaya School",
      description: "The primary 5kW inverter was damaged in the last storm and needs immediate replacement to restore power.",
      status: "PENDING",
    },
  });

  // 5. Create dummy contribution to the overall fund (unallocated to a specific need)
  await prisma.contribution.create({
    data: {
      fundId: healthProgram.id,
      donorId: donor.id,
      walletAddress: "GDOR...123",
      amount: 100,
      txHash: "mock_tx_123",
    },
  });

  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
