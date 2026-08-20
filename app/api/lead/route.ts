import { promises as fs } from "fs";
import path from "path";
import { getSettings } from "@/lib/settings";

export const maxDuration = 30;

async function forward(url: string, record: unknown, label: string) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
      signal: AbortSignal.timeout(10000),
      redirect: "follow", // Apps Script trả 302 sau khi xử lý
    });
    if (!res.ok) console.error(`[lead] ${label} trả về`, res.status);
  } catch (e) {
    console.error(`[lead] ${label} lỗi:`, e);
  }
}

// Lead capture + CRM webhook (P1 bắt buộc theo mục 17).
// Payload chứa toàn bộ dữ liệu mục 13: hồ sơ, assessment, score, behavior, lead score.
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "JSON không hợp lệ" }, { status: 400 });
  }

  const lead = body.lead as { name?: string; phone?: string; email?: string } | undefined;
  if (!lead || (!lead.phone && !lead.email)) {
    return Response.json(
      { error: "Cần ít nhất SĐT hoặc email" },
      { status: 400 },
    );
  }

  const record = {
    ...body,
    received_at: new Date().toISOString(),
    source: "ai-xray",
  };

  // Log local (backup khi chưa nối CRM)
  try {
    const dir = path.join(process.cwd(), "data", "leads");
    await fs.mkdir(dir, { recursive: true });
    await fs.appendFile(
      path.join(dir, `${new Date().toISOString().slice(0, 10)}.jsonl`),
      JSON.stringify(record) + "\n",
    );
  } catch (e) {
    console.error("[lead] không ghi được file local:", e);
  }

  // Forward song song: Google Sheet + CRM (cấu hình trong /admin, fallback env)
  const settings = await getSettings();
  const targets: [string, string][] = [];
  if (settings.integrations.sheetWebhookUrl) {
    targets.push([settings.integrations.sheetWebhookUrl, "Google Sheet"]);
  }
  const crm = settings.integrations.crmWebhookUrl || process.env.CRM_WEBHOOK_URL;
  if (crm) targets.push([crm, "CRM webhook"]);
  await Promise.all(targets.map(([url, label]) => forward(url, record, label)));

  console.log("[lead] nhận lead:", lead.phone || lead.email);
  return Response.json({ ok: true });
}
