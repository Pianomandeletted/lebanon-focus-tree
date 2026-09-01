import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/authz";

const updateSchema = z.object({
  slug: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(["COMPLETE", "COMPLETING", "INCOMPLETE", "IMPOSSIBLE"]).optional(),
  iconUrl: z.string().nullable().optional(),
  x: z.number().optional(),
  y: z.number().optional(),
  order: z.number().optional(),
  pathId: z.string().optional(),
  isPublished: z.boolean().optional(),
  requirements: z.array(z.string()).optional(),
  completionText: z.string().optional(),
  requiresFocusIds: z.array(z.string()).optional() // if present, REPLACES all incoming connections
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { requiresFocusIds, ...data } = parsed.data;

  const focus = await db.focus.update({ where: { id: params.id }, data });

  if (requiresFocusIds) {
    await db.focusConnection.deleteMany({ where: { toFocusId: params.id } });
    if (requiresFocusIds.length) {
      await db.focusConnection.createMany({
        data: requiresFocusIds.map((fromFocusId) => ({ fromFocusId, toFocusId: params.id })),
        skipDuplicates: true
      });
    }
  }

  return NextResponse.json(focus);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await db.focus.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
