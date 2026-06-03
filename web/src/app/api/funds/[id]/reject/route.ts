import { NextRequest, NextResponse } from "next/server";
import { rejectFund } from "@/lib/db/store";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { reason } = await request.json();
    const fund = await rejectFund(id, reason);
    return NextResponse.json({ fund });
  } catch (error) {
    console.error("Reject Fund Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to reject fund" },
      { status: 400 },
    );
  }
}
