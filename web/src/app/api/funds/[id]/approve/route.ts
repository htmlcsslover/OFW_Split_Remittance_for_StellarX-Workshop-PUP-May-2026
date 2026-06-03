import { NextRequest, NextResponse } from "next/server";
import { approveFund } from "@/lib/db/store";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const fund = await approveFund(id);

    return NextResponse.json({ fund });
  } catch (error) {
    console.error("Failed to approve fund:", error);

    return NextResponse.json(
      { error: "Failed to approve fund" },
      { status: 500 }
    );
  }
}
