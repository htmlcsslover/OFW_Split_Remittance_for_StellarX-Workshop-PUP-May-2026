import { NextRequest, NextResponse } from "next/server";
import { archiveSupportRequest, rejectSupportRequest, updateSupportRequest } from "@/lib/db/store";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const result = await updateSupportRequest(id, body);
    return NextResponse.json({ request: result });
  } catch (error) {
    console.error("Update Request Error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 400 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { action, reason } = await request.json();

    if (action === "archive") {
      const result = await archiveSupportRequest(id);
      return NextResponse.json({ request: result });
    }

    if (action === "reject") {
      const result = await rejectSupportRequest(id, reason);
      return NextResponse.json({ request: result });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Request Action Error:", error);
    return NextResponse.json({ error: "Action failed" }, { status: 400 });
  }
}
