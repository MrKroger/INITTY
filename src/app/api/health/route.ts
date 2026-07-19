import { db } from "@/db";
import { sql } from "drizzle-orm";

const dynamic = "force-dynamic";

async function GET() {
  try {
    await db.execute(sql`select 1`);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}

export {
  dynamic,
  GET,
};