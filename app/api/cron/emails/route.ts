import { promises as fs } from "fs";
import path from "path";
import { getSettings } from "@/lib/settings";
import {
  readEmailState,
  writeEmailState,
  renderTemplate,
  sendEmail,
} from "@/lib/email";

export const maxDuration = 300;

const MAX_SENDS_PER_RUN = 50; // tránh burst, chạy mỗi giờ nên vẫn kịp

interface LeadRecord {
  session_id?: string;
  received_at?: string;
  lead?: { name?: string; email?: string };
  answers?: { persona?: string; painPoint?: string };
  ai_score?: number;
  ai_level?: number;
  ai_level_name?: string;
  gaps?: string[];
  saved_hours_per_month?: number;
  opportunity_vnd_per_month?: number;
}

// Đọc toàn bộ lead có email, gộp theo email (giữ bản ghi mới nhất)
async function leadsByEmail(): Promise<Map<string, LeadRecord>> {
  const dir = path.join(process.cwd(), "data", "leads");
  const out = new Map<string, LeadRecord>();
  let files: string[] = [];
  try {
    files = (await fs.readdir(dir)).filter((f) => f.endsWith(".jsonl")).sort();
  } catch {
    return out;
  }
  for (const f of files) {
    const raw = await fs.readFile(path.join(dir, f), "utf8").catch(() => "");
    for (const line of raw.split("\n")) {
      if (!line.trim()) continue;
      try {
        const r = JSON.parse(line) as LeadRecord;
        const email = r.lead?.email?.trim().toLowerCase();
        if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          out.set(email, r); // bản sau (mới hơn) đè bản trước
        }
      } catch {
        /* bỏ dòng hỏng */
      }
    }
  }
  return out;
}

// Cron gọi mỗi giờ: gửi tối đa 1 email/lead/lượt, theo ngày trong chuỗi
export async function GET(req: Request) {
  const url = new URL(req.url);
  const secret = process.env.CRON_SECRET;
  if (!secret || url.searchParams.get("secret") !== secret) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const settings = await getSettings();
  const cfg = settings.email;
  if (!cfg.smtpHost || !cfg.fromEmail) {
    return Response.json({
      ok: false,
      reason: "Chưa cấu hình SMTP trong /admin → tab Email",
    });
  }

  const sequence = cfg.sequence
    .filter((t) => t.enabled)
    .sort((a, b) => a.day - b.day);
  if (!sequence.length) {
    return Response.json({ ok: false, reason: "Chuỗi email đang tắt hết" });
  }

  const leads = await leadsByEmail();
  const state = await readEmailState();
  const now = Date.now();
  let sent = 0;
  let errors = 0;

  for (const [email, record] of leads) {
    if (sent >= MAX_SENDS_PER_RUN) break;

    if (!state[email]) {
      state[email] = {
        firstSeen: record.received_at ?? new Date().toISOString(),
        sent: [],
      };
    }
    const st = state[email];
    if (st.unsubscribed) continue;

    const daysElapsed = Math.floor(
      (now - new Date(st.firstSeen).getTime()) / 86400000,
    );

    // Email đến hạn sớm nhất chưa gửi (mỗi lượt chạy gửi tối đa 1 cái/lead)
    const due = sequence.find(
      (t) => t.day <= daysElapsed && !st.sent.includes(t.id),
    );
    if (!due) continue;

    try {
      await sendEmail(
        cfg,
        email,
        renderTemplate(due.subject, record),
        renderTemplate(due.body, record),
      );
      st.sent.push(due.id);
      delete st.lastError;
      sent++;
    } catch (e) {
      st.lastError = String(e).slice(0, 300);
      errors++;
      console.error(`[cron-email] lỗi gửi ${email}:`, e);
    }
  }

  await writeEmailState(state);
  return Response.json({
    ok: true,
    leads_with_email: leads.size,
    sent,
    errors,
  });
}
