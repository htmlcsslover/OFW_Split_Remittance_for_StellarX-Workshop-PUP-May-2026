import { NextResponse } from "next/server";
import { listActivityLogs } from "@/lib/db/store";

export async function GET() {
  return NextResponse.json({ activity: await listActivityLogs() });
}
