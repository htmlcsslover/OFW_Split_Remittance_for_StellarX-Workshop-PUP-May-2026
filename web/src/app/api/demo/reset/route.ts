import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode") || "empty";

    console.log(`Resetting demo data (mode: ${mode})...`);

    // 1. Wipe all transactional and program data
    await prisma.activityLog.deleteMany();
    await prisma.payout.deleteMany();
    await prisma.approval.deleteMany();
    await prisma.contribution.deleteMany();
    await prisma.supportRequest.deleteMany();
    await prisma.fund.deleteMany();
    await prisma.user.deleteMany();

    // 2. Re-seed Core Infrastructure Users
    // These are required so the judge can actually log into dashboards via demo roles.
    await prisma.user.create({
      data: {
        id: "demo-admin-id", // Stable IDs for demo reliability
        displayName: "System Admin",
        role: "ADMIN",
        verificationStatus: "VERIFIED",
      },
    });

    await prisma.user.create({
      data: {
        id: "demo-ngo-id",
        displayName: "Bayan Health NGO",
        role: "ORGANIZATION",
        verificationStatus: "VERIFIED",
      },
    });

    if (mode === "seed") {
      // Create one sample program if in seed mode
      const healthProgram = await prisma.fund.create({
        data: {
          name: "Bayan Health Community Care",
          category: "HEALTH_MEDICAL",
          description: "Providing essential healthcare and surgical assistance.",
          targetAmount: 5000,
          organizationId: "demo-ngo-id",
        },
      });

      await prisma.supportRequest.create({
        data: {
          fundId: healthProgram.id,
          requesterId: "demo-ngo-id",
          amount: 500,
          purpose: "Dental Surgery for Maria",
          description: "Emergency treatment for a community member.",
          status: "PENDING",
        },
      });
    }

    return NextResponse.json({ message: `Database reset to ${mode} state.` }, { status: 200 });
  } catch (error) {
    console.error("Reset Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to reset database" },
      { status: 500 }
    );
  }
}
