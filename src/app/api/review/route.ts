// POST /api/review — saves Tsega's Amharic edits and approvals into /content.
// Only works on her own computer (npm run dev). The live site refuses it.
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FILES = {
  question: path.join(process.cwd(), "content", "amharic-questions.json"),
  ui: path.join(process.cwd(), "content", "ui.json"),
};

export async function POST(req: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Reviewing only works on your own computer (npm run dev)." }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  const kind = body?.kind as "question" | "ui";
  const key = String(body?.key ?? "");
  if (!body || !(kind in FILES) || !key) return NextResponse.json({ error: "Bad request" }, { status: 400 });

  const file = FILES[kind];
  const data = JSON.parse(await fs.readFile(file, "utf8"));
  const item = data.items[key];
  if (!item) return NextResponse.json({ error: "Unknown item" }, { status: 404 });

  if (kind === "question") {
    if (typeof body.q === "string") item.q = body.q.trim();
    if (typeof body.help === "string") item.help = body.help.trim();
  } else if (typeof body.am === "string") {
    item.am = body.am.trim();
  }
  if (typeof body.reviewed === "boolean") item.reviewed = body.reviewed;

  // Back up once per day before writing, in case something goes wrong.
  const backup = `${file}.${new Date().toISOString().slice(0, 10)}.bak`;
  try {
    await fs.access(backup);
  } catch {
    await fs.copyFile(file, backup);
  }
  await fs.writeFile(file, JSON.stringify(data, null, 1) + "\n", "utf8");
  return NextResponse.json({ ok: true, item });
}
