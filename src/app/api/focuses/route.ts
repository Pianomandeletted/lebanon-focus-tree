import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/authz";
import type { FocusDTO } from "@/types/focus";

// Public read: the whole tree (paths + focuses + resolved connections).
// This single call is what the canvas hydrates from.
export async function GET() {
  const [paths, focuses, connections] = await Promise.all([
    db.path.findMany({ where: { isPublished: true }, orderBy: { order: "asc" } }),
    db.focus.findMany({ where: { isPublished: true }, orderBy: { order: "asc" } }),
    db.focusConnection.findMany()
  ]);

  const incomingByFocus = new Map<string, string[]>();
  for (const c of connections) {
    const list = incomingByFocus.get(c.toFocusId) ?? [];
    list.push(c.fromFocusId);
    incomingByFocus.set(c.toFocusId, list);
  }

  const focusDTOs: FocusDTO[] = focuses.map((f) => ({
    id: f.id,
    slug: f.slug,
    title: f.title,
    description: f.description,
    status: f.status,
    iconUrl: f.iconUrl,
    x: f.x,
    y: f.y,
    order: f.order,
    isPublished: f.isPublished,
    pathId: f.pathId,
    requirements: f.requirements,
    completionText: f.completionText,
    incoming: incomingByFocus.get(f.id) ?? []
  }));

  return NextResponse.json({ paths, focuses: focusDTOs });
}

const createSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().default(""),
  status: z.enum(["COMPLETE", "COMPLETING", "INCOMPLETE", "IMPOSSIBLE"]).default("INCOMPLETE"),
  iconUrl: z.string().nullable().optional(),
  x: z.number().default(0),
  y: z.number().default(0),
  order: z.number().default(0),
  pathId: z.string().min(1),
  requirements: z.array(z.string()).default([]),
  completionText: z.string().default(""),
  requiresFocusIds: z.array(z.string()).default([])
});

// Admin-only create. requireAdmin() re-checks the server session on every
// call - a client can't forge admin status by editing request payloads.
export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = createSchema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 });

  const { requiresFocusIds, ...data } = body.data;
  const focus = await db.focus.create({ data });

  if (requiresFocusIds.length) {
    await db.focusConnection.createMany({
      data: requiresFocusIds.map((fromFocusId) => ({ fromFocusId, toFocusId: focus.id })),
      skipDuplicates: true
    });
  }

  return NextResponse.json(focus, { status: 201 });
}
