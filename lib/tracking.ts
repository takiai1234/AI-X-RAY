"use client";

// Event tracking theo Phụ lục C của tài liệu triển khai
export type FunnelEvent =
  | "landing_view"
  | "assessment_start"
  | `question_step_${number}`
  | "assessment_complete"
  | "lead_submit"
  | "report_view"
  | "agent_demo_start"
  | "agent_demo_complete"
  | "roadmap_view"
  | "share_click"
  | "offer_click"
  | "booking_submit"
  | "purchase";

function sessionId(): string {
  if (typeof window === "undefined") return "server";
  let id = window.localStorage.getItem("aixray_session");
  if (!id) {
    id = `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    window.localStorage.setItem("aixray_session", id);
  }
  return id;
}

export function track(event: FunnelEvent, data: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const payload = {
    event,
    session_id: sessionId(),
    ts: new Date().toISOString(),
    url: window.location.href,
    utm: Object.fromEntries(
      new URLSearchParams(window.location.search).entries(),
    ),
    ...data,
  };
  // Đẩy vào dataLayer cho GTM/pixel nếu có
  (window as unknown as { dataLayer?: unknown[] }).dataLayer?.push(payload);
  // Bắn event vào pixel (nếu admin đã gắn ID)
  fireToPixels(event, data);
  // Gửi về server để log + forward webhook
  navigator.sendBeacon?.(
    "/api/track",
    new Blob([JSON.stringify(payload)], { type: "application/json" }),
  ) ||
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
}

export function getSessionId() {
  return sessionId();
}

type PixelWindow = {
  gtag?: (...args: unknown[]) => void;
  fbq?: (...args: unknown[]) => void;
  ttq?: { track?: (event: string, data?: Record<string, unknown>) => void };
};

// Map event phễu sang event chuẩn của từng nền tảng quảng cáo
function fireToPixels(event: string, data: Record<string, unknown>) {
  const w = window as unknown as PixelWindow;
  try {
    // Google: mọi event đều bắn (GA4/Ads dùng làm conversion tùy chọn)
    w.gtag?.("event", event, data);

    // Facebook: event chuẩn cho các mốc quan trọng, còn lại trackCustom
    if (w.fbq) {
      if (event === "lead_submit") w.fbq("track", "Lead");
      else if (event === "assessment_start") w.fbq("track", "InitiateCheckout");
      else if (event === "report_view") w.fbq("track", "ViewContent");
      else if (event === "offer_click") w.fbq("trackCustom", "OfferClick", data);
      else if (event === "purchase") w.fbq("track", "Purchase");
      else if (!event.startsWith("question_step")) w.fbq("trackCustom", event, data);
    }

    // TikTok: chỉ bắn event chuẩn
    if (w.ttq?.track) {
      if (event === "lead_submit") w.ttq.track("SubmitForm");
      else if (event === "offer_click") w.ttq.track("ClickButton");
      else if (event === "purchase") w.ttq.track("CompletePayment");
    }
  } catch {
    // pixel không được phép làm vỡ luồng chính
  }
}
