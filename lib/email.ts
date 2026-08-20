import { promises as fs } from "fs";
import path from "path";
import { createHash } from "crypto";
import nodemailer from "nodemailer";
import { PERSONAS, courseUrl } from "./personas";
import { AI_LEVELS, formatVnd } from "./scoring";

// ===== Hệ thống email nurture 30 ngày =====
// - Chuỗi email mặc định định nghĩa ở đây, sửa được từ /admin (lưu trong settings)
// - Trạng thái đã gửi: data/emails/state.json (key = email thường hóa)
// - Cron gọi /api/cron/emails mỗi giờ; mỗi lead tối đa 1 email/lượt chạy

export interface EmailTemplate {
  id: string;
  day: number; // gửi sau N ngày kể từ khi có lead
  enabled: boolean;
  subject: string;
  body: string; // plain text, hỗ trợ biến {ten} {ai_score} ...
}

export interface EmailConfig {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  fromName: string;
  fromEmail: string;
  sequence: EmailTemplate[];
}

export const EMAIL_VARIABLES = [
  "{ten}", "{ai_score}", "{ai_level}", "{level_name}", "{nhom}",
  "{gap}", "{gio_tiet_kiem}", "{tien_co_hoi}", "{khoa_hoc}", "{khoa_hoc_url}",
];

export function defaultEmailConfig(): EmailConfig {
  return {
    smtpHost: "",
    smtpPort: 587,
    smtpUser: "",
    smtpPass: "",
    fromName: "TAKI ACADEMY",
    fromEmail: "",
    sequence: DEFAULT_SEQUENCE.map((t) => ({ ...t })),
  };
}

const DEFAULT_SEQUENCE: EmailTemplate[] = [
  {
    id: "d0",
    day: 0,
    enabled: true,
    subject: "Kết quả AI X-RAY của bạn: {ai_score}/100 — và 3 việc nên làm ngay",
    body: `Chào {ten},

Cảm ơn bạn đã hoàn thành bài quét AI X-RAY. Tóm tắt kết quả của bạn:

- AI Score: {ai_score}/100 — Level {ai_level}/10 ({level_name})
- Khoảng trống lớn nhất: {gap}
- Thời gian có thể tối ưu: khoảng {gio_tiet_kiem} giờ/tháng, tương đương {tien_co_hoi}/tháng theo chi phí giờ công bạn khai báo (ước tính minh họa, không phải cam kết).

Ba việc nên làm ngay trong tuần này:
1. Chọn đúng 1 việc lặp lại tốn giờ nhất, dùng AI làm trọn vẹn 1 lần và bấm giờ so sánh.
2. Lưu cách làm đó thành 1 prompt chuẩn để dùng lại.
3. Xem lại lộ trình 30 ngày trong báo cáo — làm đúng thứ tự quan trọng hơn làm nhiều.

Chương trình phù hợp nhất với khoảng trống của bạn là {khoa_hoc}. Xem chi tiết và nhận tư vấn lộ trình tại: {khoa_hoc_url}

TAKI ACADEMY`,
  },
  {
    id: "d2",
    day: 2,
    enabled: true,
    subject: "{ten} ơi, quick-win đầu tiên chỉ mất 15 phút",
    body: `Chào {ten},

Hai ngày trước bạn quét AI X-RAY và thấy mình đang mất khoảng {gio_tiet_kiem} giờ/tháng cho việc lặp lại. Hôm nay thử ngay quick-win này, chỉ mất 15 phút:

Lấy một việc bạn LÀM ĐI LÀM LẠI mỗi tuần (một loại email, một loại báo cáo, một loại nội dung). Mở công cụ AI và gõ theo khung: "Bạn là [vai trò]. Hãy [việc cần làm] cho [người nhận]. Thông tin: [dán thông tin]. Yêu cầu: [giọng, độ dài, định dạng]."

Chạy thử, chỉnh một lần, rồi LƯU LẠI câu lệnh đó. Từ nay việc 30 phút chỉ còn 3 phút.

Người mới thường thất bại vì hỏi AI chung chung. Người làm được là người biến việc quen thuộc thành quy trình. Đó chính là khác biệt giữa Level {ai_level} hiện tại của bạn và Level 7.

TAKI ACADEMY`,
  },
  {
    id: "d5",
    day: 5,
    enabled: true,
    subject: "1 người ra 2-3 bài/ngày. Cũng người đó + AI: 20-30 bài.",
    body: `Chào {ten},

Một con số đáng suy nghĩ: 1 người làm nội dung thủ công chỉ ra được 2-3 bài/ngày. Cùng người đó, khi có AI hỗ trợ đúng cách, có thể ra 20-30 bài chất lượng.

Khác biệt không nằm ở số bài — nằm ở số người tiếp cận được: từ vài trăm, vài nghìn người lên hàng trăm nghìn người mỗi tháng. Chỉ cần 0,1% trong số đó thành khách, doanh thu đang bỏ lỡ có thể tính bằng hàng chục, thậm chí hàng trăm triệu (ước tính minh họa, không phải cam kết).

Đây gọi là CHI PHÍ CƠ HỘI — thứ đắt nhất nhưng không hiện trên báo cáo nào. Với nhóm {nhom} như bạn, khoảng trống "{gap}" chính là nơi chi phí cơ hội đang rò rỉ.

Chương trình {khoa_hoc} được thiết kế để bịt đúng chỗ rò này: {khoa_hoc_url}

TAKI ACADEMY`,
  },
  {
    id: "d8",
    day: 8,
    enabled: true,
    subject: "3 prompt đáng lưu nhất cho nhóm {nhom}",
    body: `Chào {ten},

Tuần đầu dùng AI, đừng học 50 công cụ — hãy lưu 3 prompt dùng đi dùng lại:

1. Prompt phân tích: "Đây là [số liệu/tình huống]. Hãy chỉ ra 3 điểm bất thường và 3 việc nên làm, xếp theo mức độ ưu tiên."
2. Prompt sản xuất: "Viết [loại nội dung] cho [đối tượng] với mục tiêu [kết quả]. Giọng [phong cách]. Cho tôi 3 phương án khác nhau."
3. Prompt cải tiến: "Đây là cách tôi đang làm [việc X]: [mô tả]. Hãy chỉ ra bước nào có thể bỏ, bước nào AI làm thay được, và quy trình mới nên như thế nào."

Prompt thứ 3 chính là tư duy quan trọng nhất: dùng AI để THIẾT KẾ LẠI quy trình, không chỉ làm nhanh quy trình cũ. Đó là nội dung cốt lõi của {khoa_hoc}: {khoa_hoc_url}

TAKI ACADEMY`,
  },
  {
    id: "d12",
    day: 12,
    enabled: true,
    subject: "\"Tôi không rành công nghệ\" — lầm tưởng lớn nhất về AI",
    body: `Chào {ten},

Câu chúng tôi nghe nhiều nhất từ học viên trước khi bắt đầu: "Tôi không rành công nghệ, chắc không học nổi AI."

Sự thật ngược lại: AI là công nghệ ĐẦU TIÊN dùng bằng tiếng Việt tự nhiên. Bạn không cần biết code — bạn cần biết mô tả công việc của mình rõ ràng. Mà người hiểu công việc của bạn nhất chính là bạn, không phải dân IT.

90% học viên TAKI là người kinh doanh và người đi làm không chuyên công nghệ. Thứ họ cần không phải kỹ năng lập trình, mà là đúng thứ tự học: cái gì trước, cái gì sau, áp vào việc của mình thế nào.

Bạn đang ở Level {ai_level}/10. Lộ trình từ đây lên Level 7 (tự xây quy trình AI cho công việc) đã được đóng gói trong {khoa_hoc}: {khoa_hoc_url}

TAKI ACADEMY`,
  },
  {
    id: "d18",
    day: 18,
    enabled: true,
    subject: "{ten} ơi, khoảng trống này không tự biến mất",
    body: `Chào {ten},

18 ngày trước, bài quét chỉ ra khoảng trống lớn nhất của bạn: {gap}.

Kinh nghiệm từ hàng trăm nghìn học viên: khoảng trống kỹ năng không tự biến mất theo thời gian — nó chỉ đắt lên. Mỗi tháng trôi qua là thêm {gio_tiet_kiem} giờ làm thủ công, cộng thêm phần chi phí cơ hội vì sản lượng thấp mà chúng tôi đã tính ở email trước.

Trong khi đó, người bắt đầu từ hôm nay chỉ cần 30 ngày đi đúng thứ tự: tuần 1 làm chủ prompt, tuần 2 chuẩn hóa quy trình, tuần 3 tự động hóa luồng đầu tiên, tuần 4 có trợ lý AI riêng.

Nếu bạn muốn đi cùng người hướng dẫn thay vì tự mò, đây là chương trình khớp đúng khoảng trống của bạn: {khoa_hoc} — {khoa_hoc_url}

TAKI ACADEMY`,
  },
  {
    id: "d25",
    day: 25,
    enabled: true,
    subject: "Vì sao {khoa_hoc} hợp với bạn (dựa trên kết quả quét)",
    body: `Chào {ten},

Email này nói thẳng: chúng tôi nghĩ {khoa_hoc} là chương trình đúng cho bạn, và đây là lý do dựa trên chính kết quả quét của bạn:

- Bạn đang ở Level {ai_level}/10 ({level_name}) — đủ nền để học nhanh, chưa đủ hệ thống để tự đi.
- Khoảng trống "{gap}" là nội dung chương trình xử lý trực tiếp.
- Khoảng {gio_tiet_kiem} giờ/tháng đang làm thủ công là phần hoàn vốn nhìn thấy được ngay khi áp dụng (ước tính minh họa).

Học xong bạn dùng được ngay vào chính công việc đang làm — học viên TAKI học bằng case thật của mình, không học lý thuyết suông. Kết quả phụ thuộc vào hành động của bạn; chúng tôi không hứa làm giàu nhanh.

Xem nội dung chi tiết và đăng ký tư vấn: {khoa_hoc_url}

TAKI ACADEMY`,
  },
  {
    id: "d30",
    day: 30,
    enabled: true,
    subject: "30 ngày kể từ bài quét — bạn đang ở đâu?",
    body: `Chào {ten},

Tròn 30 ngày kể từ khi bạn quét AI X-RAY với kết quả {ai_score}/100. Một câu hỏi thật lòng: 30 ngày qua, cách bạn làm việc đã khác đi chưa?

Nếu CÓ — chúc mừng bạn, hãy tiếp tục nâng cấp: quét lại tại https://testai.taki.vn để xem Level mới của mình.

Nếu CHƯA — không sao, đa số mọi người cần một cú hích. Cú hích hiệu quả nhất là một buổi tư vấn 1-1 miễn phí: chúng tôi xem lại kết quả quét của bạn, chỉ ra 3 việc nên làm đầu tiên và trả lời mọi câu hỏi về lộ trình {khoa_hoc}.

Đặt lịch tư vấn tại: {khoa_hoc_url}

Đây là email cuối trong chuỗi 30 ngày. Cảm ơn bạn đã đồng hành — hẹn gặp ở lớp học.

TAKI ACADEMY`,
  },
];

// ===== Render biến =====

interface LeadRecord {
  lead?: { name?: string; email?: string };
  answers?: { persona?: string; painPoint?: string };
  ai_score?: number;
  ai_level?: number;
  ai_level_name?: string;
  gaps?: string[];
  saved_hours_per_month?: number;
  opportunity_vnd_per_month?: number;
  received_at?: string;
  session_id?: string;
}

export function renderTemplate(text: string, r: LeadRecord): string {
  const persona = PERSONAS[r.answers?.persona ?? "office"];
  const course = persona?.courses[0];
  const vars: Record<string, string> = {
    "{ten}": r.lead?.name?.trim() || "bạn",
    "{ai_score}": String(r.ai_score ?? "—"),
    "{ai_level}": String(r.ai_level ?? "—"),
    "{level_name}": r.ai_level_name || AI_LEVELS[(r.ai_level ?? 1) - 1]?.name || "",
    "{nhom}": persona?.label ?? "",
    "{gap}": r.gaps?.[0] || r.answers?.painPoint || "chưa có quy trình AI lặp lại được",
    "{gio_tiet_kiem}": String(r.saved_hours_per_month ?? "—"),
    "{tien_co_hoi}": r.opportunity_vnd_per_month ? formatVnd(r.opportunity_vnd_per_month) : "—",
    "{khoa_hoc}": course?.name ?? "AI Super Power",
    "{khoa_hoc_url}": course ? courseUrl(course.name) : "https://taki.vn",
  };
  let out = text;
  for (const [k, v] of Object.entries(vars)) out = out.split(k).join(v);
  return out;
}

// ===== Trạng thái gửi =====

export interface EmailState {
  [email: string]: {
    firstSeen: string; // ngày bắt đầu chuỗi
    sent: string[]; // id template đã gửi
    unsubscribed?: boolean;
    lastError?: string;
  };
}

const STATE_FILE = path.join(process.cwd(), "data", "emails", "state.json");

export async function readEmailState(): Promise<EmailState> {
  try {
    return JSON.parse(await fs.readFile(STATE_FILE, "utf8"));
  } catch {
    return {};
  }
}

export async function writeEmailState(s: EmailState): Promise<void> {
  await fs.mkdir(path.dirname(STATE_FILE), { recursive: true });
  await fs.writeFile(STATE_FILE, JSON.stringify(s, null, 2), "utf8");
}

// ===== Unsubscribe token =====

export function unsubToken(email: string): string {
  const salt = process.env.CRON_SECRET || "aixray-default";
  return createHash("sha256")
    .update(`unsub:${email.toLowerCase()}:${salt}`)
    .digest("hex")
    .slice(0, 24);
}

// ===== Gửi mail =====

export async function sendEmail(
  cfg: EmailConfig,
  to: string,
  subject: string,
  bodyText: string,
): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: cfg.smtpHost,
    port: cfg.smtpPort,
    secure: cfg.smtpPort === 465,
    ...(cfg.smtpUser
      ? { auth: { user: cfg.smtpUser, pass: cfg.smtpPass } }
      : {}),
  });

  const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";
  const unsubUrl = `${siteUrl}/api/email/unsubscribe?e=${encodeURIComponent(
    Buffer.from(to.toLowerCase()).toString("base64url"),
  )}&t=${unsubToken(to)}`;

  const textWithFooter = `${bodyText}\n\n---\nBạn nhận email này vì đã làm bài quét AI X-RAY tại ${siteUrl}.\nNgừng nhận email: ${unsubUrl}`;

  const htmlBody = bodyText
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" style="color:#1E40AF">$1</a>')
    .replace(/\n/g, "<br/>");

  await transporter.sendMail({
    from: `"${cfg.fromName}" <${cfg.fromEmail}>`,
    to,
    subject,
    text: textWithFooter,
    html: `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#1E293B;max-width:600px;margin:0 auto;padding:16px">
<div style="background:#1E40AF;color:#fff;padding:10px 16px;border-radius:8px;font-weight:bold;margin-bottom:16px">AI X-RAY · TAKI ACADEMY</div>
${htmlBody}
<hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0"/>
<p style="font-size:12px;color:#94a3b8">Bạn nhận email này vì đã làm bài quét AI X-RAY tại <a href="${siteUrl}" style="color:#94a3b8">${siteUrl}</a>.<br/><a href="${unsubUrl}" style="color:#94a3b8">Ngừng nhận email</a></p>
</div>`,
  });
}
