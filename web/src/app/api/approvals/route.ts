import { NextResponse } from "next/server";
import { approveSupport } from "@/lib/db/store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.requestId) {
      return NextResponse.json({ error: "requestId is required" }, { status: 400 });
    }

    let approverId = String(body.approverId);

    if (approverId === "demo-admin") {
      const { prisma } = await import("@/lib/db/prisma");
      const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
      if (admin) approverId = admin.id;
    }

    const approval = await approveSupport(
      String(body.requestId), 
      approverId, 
      body.notes ? String(body.notes) : undefined
    );
    return NextResponse.json({ approval });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not approve request" },
      { status: 400 },
    );
  }
}
