import { NextResponse } from "next/server";
import { createFund, listFunds } from "@/lib/db/store";

export async function GET() {
  return NextResponse.json({ funds: await listFunds("ACTIVE") });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Basic server-side validation
    if (!body.name || String(body.name).trim() === "") {
      throw new Error("Program name is required");
    }
    if (isNaN(Number(body.targetAmount)) || Number(body.targetAmount) <= 0) {
      throw new Error("Target amount must be greater than zero");
    }

    const fund = await createFund({
      name: String(body.name),
      category: String(body.category),
      description: String(body.description ?? ""),
      targetAmount: Number(body.targetAmount),
      organizationId: body.organizationId ? String(body.organizationId) : undefined,
    });

    return NextResponse.json({ fund }, { status: 201 });
  } catch (error) {
    console.error("Create Program Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create program" },
      { status: 400 },
    );
  }
}
