import { promises as fs } from "fs";
import path from "path";
import { PERSONAS, COURSE_URLS } from "./personas";
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
}

const FILE = path.join(process.cwd(), "data", "settings.json");

export function defaultSettings(): SiteSettings {
  return {
    content: {
      heroTitle:
        "Bạn đang bỏ phí *bao nhiêu giờ* mỗi tháng vì chưa dùng AI đúng cách?",
      heroSubtitle:
        "Quét công việc của bạn trong 2 phút. Nhận AI Score, bản đồ cơ hội AI hóa và lộ trình 30 ngày cá nhân hóa. Kèm 1 AI Agent chạy thử ngay, miễn phí.",
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
  };
}

export async function getSettings(): Promise<SiteSettings> {
  const def = defaultSettings();
  try {
    const raw = JSON.parse(await fs.readFile(FILE, "utf8"));
    return {
      content: { ...def.content, ...(raw.content ?? {}) },
      personaHooks: { ...def.personaHooks, ...(raw.personaHooks ?? {}) },
      courseUrls: { ...def.courseUrls, ...(raw.courseUrls ?? {}) },
      hourlyRate: Number(raw.hourlyRate) > 0 ? Number(raw.hourlyRate) : def.hourlyRate,
      pixels: { ...def.pixels, ...(raw.pixels ?? {}) },
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
