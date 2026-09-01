import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/authz";

const schema = z.object({
  slug: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  category: z.enum(["faction", "diplomacy", "national"]).optional(),
  order: z.number().optional(),
  parentPathId: z.string().nullable().optional(),
  isPublished: z.boolean().optional()
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const path = await db.path.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json(path);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await db.path.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
