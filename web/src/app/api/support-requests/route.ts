import { NextResponse } from "next/server";
import { listSupportRequests, requestSupport } from "@/lib/db/store";

export async function GET() {
  return NextResponse.json({ requests: await listSupportRequests() });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let requesterId = String(body.requesterId);

    // If placeholder or missing, resolve to a valid NGO/Organization
    if (!requesterId || requesterId === "demo-requester-id" || requesterId === "demo-beneficiary") {
      const { prisma } = await import("@/lib/db/prisma");
      // Find the first verified organization to act as the owner of this need
      const org = await prisma.user.findFirst({ 
        where: { role: "ORGANIZATION" },
        orderBy: { createdAt: "asc" }
      });
      if (org) {
        requesterId = org.id;
      } else {
        throw new Error("No Organization found in database to assign as requester. Please seed.");
      }
    }

    const supportRequest = await requestSupport({
      fundId: String(body.fundId),
      requesterId,
      amount: Number(body.amount),
      purpose: String(body.purpose ?? "Support request"),
      description: String(body.description ?? ""),
    });
    return NextResponse.json({ request: supportRequest }, { status: 201 });
  } catch (error) {
    console.error("Support Request Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not create request" },
      { status: 400 },
    );
  }
}
