import { promises as fs } from "fs";
import path from "path";

// Event tracking (Phụ lục C): log local + forward webhook tùy chọn.
export async function POST(req: Request) {
  let event: Record<string, unknown>;
  try {
    event = await req.json();
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }

  try {
    const dir = path.join(process.cwd(), "data", "events");
    await fs.mkdir(dir, { recursive: true });
    await fs.appendFile(
      path.join(dir, `${new Date().toISOString().slice(0, 10)}.jsonl`),
      JSON.stringify(event) + "\n",
    );
  } catch {
    // tracking không được phép làm vỡ luồng chính
  }

  const webhook = process.env.TRACK_WEBHOOK_URL;
  if (webhook) {
    fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
      signal: AbortSignal.timeout(5000),
    }).catch(() => {});
  }

  return Response.json({ ok: true });
}
