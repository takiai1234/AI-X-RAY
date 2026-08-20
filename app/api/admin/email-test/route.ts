import { isAuthed } from "@/lib/adminAuth";
import { getSettings } from "@/lib/settings";
import { renderTemplate, sendEmail, readEmailState } from "@/lib/email";

// Gửi email test (dùng cấu hình SMTP đã LƯU) + trả thống kê chuỗi
export async function GET(req: Request) {
  if (!(await isAuthed(req))) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const state = await readEmailState();
  const entries = Object.values(state);
  return Response.json({
    subscribers: entries.filter((s) => !s.unsubscribed).length,
    unsubscribed: entries.filter((s) => s.unsubscribed).length,
    totalSent: entries.reduce((n, s) => n + s.sent.length, 0),
    lastErrors: Object.entries(state)
      .filter(([, s]) => s.lastError)
      .slice(0, 5)
      .map(([e, s]) => ({ email: e, error: s.lastError })),
    cronConfigured: !!process.env.CRON_SECRET,
  });
}

export async function POST(req: Request) {
  if (!(await isAuthed(req))) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const { to } = (await req.json().catch(() => ({}))) as { to?: string };
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return Response.json({ error: "Email nhận không hợp lệ" }, { status: 400 });
  }

  const { email: cfg } = await getSettings();
  if (!cfg.smtpHost || !cfg.fromEmail) {
    return Response.json(
      { error: "Chưa cấu hình SMTP (nhớ bấm Lưu thay đổi trước khi test)" },
      { status: 400 },
    );
  }

  const tpl = cfg.sequence[0];
  const sampleLead = {
    lead: { name: "Anh Kiểm (test)", email: to },
    answers: { persona: "ceo", painPoint: "Mọi việc quan trọng đều phải qua tay mình" },
    ai_score: 34,
    ai_level: 3,
    ai_level_name: "AI Creator",
    gaps: ["Chưa có workflow AI lặp lại được: mỗi lần dùng vẫn là một lần mò."],
    saved_hours_per_month: 74,
    opportunity_vnd_per_month: 22200000,
  };

  try {
    await sendEmail(
      cfg,
      to,
      "[TEST] " + renderTemplate(tpl.subject, sampleLead),
      renderTemplate(tpl.body, sampleLead),
    );
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json(
      { error: "Gửi thất bại: " + String(e).slice(0, 300) },
      { status: 500 },
    );
  }
}
