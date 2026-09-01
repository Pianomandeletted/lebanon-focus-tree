import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import path from "path";
import { writeFile } from "fs/promises";
import { requireAdmin } from "@/lib/authz";

const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
const MAX_BYTES = 4 * 1024 * 1024; // 4MB

// Admin-only file upload for focus icons. Stores under /public/uploads/icons
// for local/dev use. On a serverless host with a read-only or ephemeral
// filesystem (Vercel, most PaaS), swap the write below for a call to a
// blob store (Vercel Blob, S3, Supabase Storage) - the request-validation
// and authorization logic here stays the same either way.
export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 4MB)" }, { status: 400 });
  }

  const ext = file.type.split("/")[1];
  const filename = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(process.cwd(), "public", "uploads", "icons", filename), buffer);

  return NextResponse.json({ url: `/uploads/icons/${filename}` }, { status: 201 });
}
