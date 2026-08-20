import { promises as fs } from "fs";
import path from "path";
import { PERSONAS, COURSE_URLS } from "./personas";
import { DEFAULT_COLORS, sanitizeColors, type ThemeColors } from "./colors";
import { defaultEmailConfig, type EmailConfig } from "./email";
import type { PublicSettings } from "./types";

// Cấu hình site chỉnh được từ trang /admin, lưu tại data/settings.json.
// Giá trị chưa chỉnh thì dùng mặc định trong code.

export interface SiteSettings extends PublicSettings {
  pixels: {
    googleId: string; // GA4 (G-xxx) hoặc Google Ads (AW-xxx)
    facebookPixelId: string;
    tiktokPixelId: string;
    customHead: string; // HTML/script tùy ý (GTM, pixel khác...)
  };
  integrations: {
    sheetWebhookUrl: string; // Google Apps Script Web App URL — lead đổ vào Google Sheet
    crmWebhookUrl: string; // webhook CRM/n8n/Lark (ưu tiên hơn env CRM_WEBHOOK_URL)
  };
  colors: ThemeColors; // bộ màu giao diện, đổi từ /admin
  email: EmailConfig; // SMTP + chuỗi email nurture 30 ngày
}

const FILE = path.join(process.cwd(), "data", "settings.json");

export function defaultSettings(): SiteSettings {
  return {
    content: {
      heroTitle:
        "Bạn đang bỏ phí *bao nhiêu giờ* mỗi tháng vì chưa dùng AI đúng cách?",
      heroSubtitle:
        "Quét công việc của bạn trong 2 phút. Nhận AI Score, bản đồ cơ hội AI hóa và lộ trình 30 ngày cá nhân hóa. Kèm 1 AI Agent chạy thử ngay, miễn phí.",
      metaTitle: "AI X-RAY | Quét công việc. Tìm cơ hội AI.",
      metaDescription:
        "Bạn đang bỏ phí bao nhiêu tiền và bao nhiêu giờ mỗi tháng vì chưa dùng AI đúng cách? Quét miễn phí trong 2 phút, nhận AI Score và lộ trình AI cá nhân hóa.",
    },
    personaHooks: Object.fromEntries(
      Object.values(PERSONAS).map((p) => [p.id, p.hook]),
    ),
    courseUrls: { ...COURSE_URLS },
    hourlyRate: 80000,
    pixels: {
      googleId: "",
      facebookPixelId: "",
      tiktokPixelId: "",
      customHead: "",
    },
    integrations: {
      sheetWebhookUrl: "",
      crmWebhookUrl: "",
    },
    colors: { ...DEFAULT_COLORS },
    email: defaultEmailConfig(),
  };
}

// Chỉ giữ link của các khóa còn trong danh mục hiện hành — khóa đã bỏ thì
// link cũ trong settings không được đè lên danh mục mới.
function mergeCourseUrls(
  def: Record<string, string>,
  raw: Record<string, string> | undefined,
): Record<string, string> {
  const out = { ...def };
  if (!raw) return out;
  for (const k of Object.keys(def)) {
    if (typeof raw[k] === "string" && raw[k].startsWith("http")) out[k] = raw[k];
  }
  return out;
}

// Chuỗi email: template đã lưu (theo id) đè lên mặc định; template mặc định mới
// thêm trong code vẫn xuất hiện cho bản cài cũ.
function mergeEmailConfig(
  def: EmailConfig,
  raw: Partial<EmailConfig> | undefined,
): EmailConfig {
  if (!raw) return def;
  const savedSeq = Array.isArray(raw.sequence) ? raw.sequence : [];
  const sequence = def.sequence.map((t) => {
    const saved = savedSeq.find((s) => s?.id === t.id);
    return saved
      ? {
          ...t,
          day: Number(saved.day) >= 0 ? Number(saved.day) : t.day,
          enabled: saved.enabled !== false,
          subject: saved.subject || t.subject,
          body: saved.body || t.body,
        }
      : t;
  });
  return {
    smtpHost: raw.smtpHost ?? def.smtpHost,
    smtpPort: Number(raw.smtpPort) > 0 ? Number(raw.smtpPort) : def.smtpPort,
    smtpUser: raw.smtpUser ?? def.smtpUser,
    smtpPass: raw.smtpPass ?? def.smtpPass,
    fromName: raw.fromName || def.fromName,
    fromEmail: raw.fromEmail ?? def.fromEmail,
    sequence,
  };
}

export async function getSettings(): Promise<SiteSettings> {
  const def = defaultSettings();
  try {
    const raw = JSON.parse(await fs.readFile(FILE, "utf8"));
    return {
      content: { ...def.content, ...(raw.content ?? {}) },
      personaHooks: { ...def.personaHooks, ...(raw.personaHooks ?? {}) },
      courseUrls: mergeCourseUrls(def.courseUrls, raw.courseUrls),
      hourlyRate: Number(raw.hourlyRate) > 0 ? Number(raw.hourlyRate) : def.hourlyRate,
      pixels: { ...def.pixels, ...(raw.pixels ?? {}) },
      integrations: { ...def.integrations, ...(raw.integrations ?? {}) },
      colors: sanitizeColors(raw.colors),
      email: mergeEmailConfig(def.email, raw.email),
    };
  } catch {
    return def;
  }
}

export async function saveSettings(s: SiteSettings): Promise<void> {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(s, null, 2), "utf8");
}

export function toPublic(s: SiteSettings): PublicSettings {
  return {
    content: s.content,
    personaHooks: s.personaHooks,
    courseUrls: s.courseUrls,
    hourlyRate: s.hourlyRate,
  };
}
