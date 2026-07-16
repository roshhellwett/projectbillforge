import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const start = Date.now();
  let dbOk = false;
  try {
    await db.execute(sql`SELECT 1`);
    dbOk = true;
  } catch {
    dbOk = false;
  }
  const elapsed = Date.now() - start;
  return NextResponse.json(
    {
      status: dbOk ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      database: dbOk ? "connected" : "disconnected",
      latency_ms: elapsed,
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
    },
    { status: dbOk ? 200 : 503 }
  );
}
