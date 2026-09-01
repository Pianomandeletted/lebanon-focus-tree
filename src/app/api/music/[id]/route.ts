import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/authz";

const schema = z.object({
  title: z.string().optional(),
  artist: z.string().optional(),
  url: z.string().optional(),
  order: z.number().optional(),
  isEnabled: z.boolean().optional()
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const track = await db.musicTrack.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json(track);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await db.musicTrack.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
