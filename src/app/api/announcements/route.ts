import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/authz";

export async function GET() {
  const announcements = await db.announcement.findMany({
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }]
  });
  return NextResponse.json(announcements);
}

const schema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  isPinned: z.boolean().default(false)
});

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const announcement = await db.announcement.create({ data: parsed.data });
  return NextResponse.json(announcement, { status: 201 });
}
