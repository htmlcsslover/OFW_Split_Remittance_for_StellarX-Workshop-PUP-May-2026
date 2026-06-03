import { NextRequest, NextResponse } from "next/server";
import { updateFund } from "@/lib/db/store";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const fund = await updateFund(id, body);
    return NextResponse.json({ fund });
  } catch (error) {
    console.error("Update Fund Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update fund" },
      { status: 400 },
    );
  }
}
