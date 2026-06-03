import { NextRequest, NextResponse } from "next/server";
import { archiveFund } from "@/lib/db/store";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const fund = await archiveFund(id);
    return NextResponse.json({ fund });
  } catch (error) {
    console.error("Archive Fund Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to archive fund" },
      { status: 400 },
    );
  }
}
