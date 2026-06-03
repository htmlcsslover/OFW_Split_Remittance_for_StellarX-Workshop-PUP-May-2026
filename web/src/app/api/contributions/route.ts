import { NextResponse } from "next/server";
import { contribute } from "@/lib/db/store";

// Basic in-memory rate limiting map for MVP. In production, use Redis.
const rateLimit = new Map<string, number>();

export async function POST(request: Request) {
  try {
    // 1. Rate Limiting Check
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    const lastRequest = rateLimit.get(ip) || 0;
    if (now - lastRequest < 5000) { // 5 seconds
      return NextResponse.json({ error: "Too many requests. Please wait." }, { status: 429 });
    }
    rateLimit.set(ip, now);

    const body = await request.json();

    // 2. Strict Input Validation & Sanitization
    if (!body.fundId || typeof body.fundId !== "string" || body.fundId.length > 100) {
      return NextResponse.json({ error: "Invalid fundId" }, { status: 400 });
    }
    
    const amount = Number(body.amount);
    if (isNaN(amount) || amount <= 0 || amount > 1_000_000_000) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // 3. Transaction Verification Placeholder
    if (body.txHash && (typeof body.txHash !== "string" || body.txHash.length !== 64)) {
       return NextResponse.json({ error: "Invalid txHash format" }, { status: 400 });
    }

    const contribution = await contribute({
      fundId: body.fundId,
      amount,
      walletAddress: String(body.walletAddress),
      donorId: body.donorId ? String(body.donorId) : undefined,
      txHash: body.txHash ? String(body.txHash) : undefined,
      supportRequestId: body.supportRequestId ? String(body.supportRequestId) : undefined,
    });

    return NextResponse.json({ contribution }, { status: 201 });
  } catch (error) {
    console.error("Contribution API Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not record contribution" },
      { status: 500 },
    );
  }
}
