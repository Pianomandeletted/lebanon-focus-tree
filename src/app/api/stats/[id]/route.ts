import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/authz";

const schema = z.object({
  label: z.string().optional(),
  value: z.number().optional(),
  maxValue: z.number().nullable().optional(),
  unit: z.string().optional(),
  description: z.string().optional(),
  order: z.number().optional()
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const stat = await db.statistic.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json(stat);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await db.statistic.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
