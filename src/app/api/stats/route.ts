import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/authz";

export async function GET() {
  const stats = await db.statistic.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(stats);
}

const schema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  value: z.number(),
  maxValue: z.number().nullable().optional(),
  unit: z.string().default(""),
  description: z.string().default(""),
  order: z.number().default(0)
});

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const stat = await db.statistic.create({ data: parsed.data });
  return NextResponse.json(stat, { status: 201 });
}
