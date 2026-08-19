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
