// Helper màu cho theme đổi được từ admin

export interface ThemeColors {
  navy: string; // màu chính (tin cậy)
  cam: string; // màu nhấn / CTA
  nen: string; // nền sáng
  navyDark: string; // chữ đậm / nền tối
}

export const DEFAULT_COLORS: ThemeColors = {
  navy: "#1E40AF",
  cam: "#F97316",
  nen: "#F8FAFC",
  navyDark: "#1E293B",
};

const HEX_RE = /^#([0-9a-fA-F]{6})$/;

export function isValidHex(v: string): boolean {
  return HEX_RE.test(v);
}

// "#1E40AF" → "30 64 175" (định dạng cho rgb(var(--x) / alpha) của Tailwind)
export function hexToTriplet(hex: string): string {
  const m = HEX_RE.exec(hex);
  if (!m) return "0 0 0";
  const n = parseInt(m[1], 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

// Làm tối màu ~12% để tạo shade hover (thay cho cam-dark cố định)
export function darken(hex: string, amount = 0.12): string {
  const m = HEX_RE.exec(hex);
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const f = (c: number) => Math.max(0, Math.round(c * (1 - amount)));
  const r = f((n >> 16) & 255);
  const g = f((n >> 8) & 255);
  const b = f(n & 255);
  return (
    "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")
  );
}

export function sanitizeColors(
  raw: Partial<ThemeColors> | undefined,
  base: ThemeColors = DEFAULT_COLORS,
): ThemeColors {
  const out = { ...base };
  if (!raw) return out;
  for (const k of Object.keys(DEFAULT_COLORS) as (keyof ThemeColors)[]) {
    const v = raw[k];
    if (typeof v === "string" && isValidHex(v.trim())) out[k] = v.trim().toUpperCase();
  }
  return out;
}

// Khối CSS :root ghi đè biến màu — chèn vào layout
export function themeCss(c: ThemeColors): string {
  return `:root{--c-navy:${hexToTriplet(c.navy)};--c-navy-dark:${hexToTriplet(c.navyDark)};--c-cam:${hexToTriplet(c.cam)};--c-cam-dark:${hexToTriplet(darken(c.cam))};--c-nen:${hexToTriplet(c.nen)};}`;
}
