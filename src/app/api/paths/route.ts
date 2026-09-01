import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/authz";

export async function GET() {
  const paths = await db.path.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(paths);
}

const schema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().default(""),
  color: z.string().default("#C9A24B"),
  category: z.enum(["faction", "diplomacy", "national"]),
  order: z.number().default(0),
  parentPathId: z.string().nullable().optional()
});

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const path = await db.path.create({ data: parsed.data });
  return NextResponse.json(path, { status: 201 });
}
