import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/authz";

export async function GET() {
  const tracks = await db.musicTrack.findMany({ where: { isEnabled: true }, orderBy: { order: "asc" } });
  return NextResponse.json(tracks);
}

const schema = z.object({
  title: z.string().min(1),
  artist: z.string().default(""),
  url: z.string().min(1),
  order: z.number().default(0),
  isEnabled: z.boolean().default(true)
});

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const track = await db.musicTrack.create({ data: parsed.data });
  return NextResponse.json(track, { status: 201 });
}
