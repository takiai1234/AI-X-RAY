import { promises as fs } from "fs";
import path from "path";
import { isAuthed } from "@/lib/adminAuth";

// Xem lead từ backup local (data/leads/*.jsonl) — nguồn dữ liệu độc lập với
// Google Sheet/CRM, đề phòng lỗi kết nối vẫn không mất lead.
// ?days=30 (mặc định 90) | ?format=csv để tải file

interface LeadRecord {
  session_id?: string;
  stage?: string;
  received_at?: string;
  lead?: { name?: string; phone?: string; email?: string };
  answers?: {
    persona?: string;
    goal?: string;
    painPoint?: string;
    scale?: string;
    aiUsageLevel?: string;
  };
  ai_score?: number;
  ai_level?: number;
  ai_level_name?: string;
  lead_score?: number;
  saved_hours_per_month?: number;
  opportunity_vnd_per_month?: number;
  behavior?: { demoDone?: boolean; roadmapViewed?: boolean; offerClicked?: boolean };
  landing?: string;
  utm?: Record<string, string>;
}

const PERSONA_LABEL: Record<string, string> = {
  ceo: "CEO / Chủ DN",
  seller: "Nhà bán hàng",
  office: "Dân văn phòng",
  affiliate: "Affiliate",
  marketing: "Marketing",
  sales: "Sales",
  hr: "HR",
  creator: "Creator",
};

async function readLeads(days: number): Promise<LeadRecord[]> {
  const dir = path.join(process.cwd(), "data", "leads");
  let files: string[] = [];
  try {
    files = await fs.readdir(dir);
  } catch {
    return [];
  }
  const cutoff = Date.now() - days * 24 * 3600 * 1000;
  const wanted = files
    .filter((f) => f.endsWith(".jsonl"))
    .filter((f) => new Date(f.replace(".jsonl", "")).getTime() >= cutoff - 24 * 3600 * 1000)
    .sort();

  const records: LeadRecord[] = [];
  for (const f of wanted) {
    const raw = await fs.readFile(path.join(dir, f), "utf8").catch(() => "");
    for (const line of raw.split("\n")) {
      if (!line.trim()) continue;
      try {
        records.push(JSON.parse(line));
      } catch {
        /* bỏ dòng hỏng */
      }
    }
  }

  // Gộp theo session_id: giữ bản ghi mới nhất (stage xa nhất trong phễu)
  const bySession = new Map<string, LeadRecord>();
  for (const r of records) {
    const key = r.session_id || `noid_${Math.random()}`;
    bySession.set(key, r); // records đã theo thứ tự thời gian, bản sau đè bản trước
  }
  return [...bySession.values()].sort((a, b) =>
    (b.received_at ?? "").localeCompare(a.received_at ?? ""),
  );
}

function toCsv(leads: LeadRecord[]): string {
  const headers = [
    "Thời gian", "Giai đoạn", "Tên", "SĐT", "Email", "Nhóm khách", "Landing",
    "AI Score", "AI Level", "Lead Score", "Mục tiêu", "Vấn đề", "Quy mô",
    "Giờ tiết kiệm/tháng", "Cơ hội VND/tháng", "Đã demo", "Đã bấm khóa học",
    "UTM Source", "UTM Campaign", "Session ID",
  ];
  const esc = (v: unknown) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = leads.map((r) =>
    [
      r.received_at ?? "",
      r.stage ?? "",
      r.lead?.name ?? "",
      r.lead?.phone ? `="${r.lead.phone}"` : "", // giữ số 0 đầu khi mở Excel
      r.lead?.email ?? "",
      PERSONA_LABEL[r.answers?.persona ?? ""] ?? r.answers?.persona ?? "",
      r.landing ?? "",
      r.ai_score ?? "",
      r.ai_level ? `${r.ai_level} - ${r.ai_level_name ?? ""}` : "",
      r.lead_score ?? "",
      r.answers?.goal ?? "",
      r.answers?.painPoint ?? "",
      r.answers?.scale ?? "",
      r.saved_hours_per_month ?? "",
      r.opportunity_vnd_per_month ?? "",
      r.behavior?.demoDone ? "x" : "",
      r.behavior?.offerClicked ? "x" : "",
      r.utm?.utm_source ?? "",
      r.utm?.utm_campaign ?? "",
      r.session_id ?? "",
    ]
      .map(esc)
      .join(","),
  );
  // BOM để Excel mở đúng tiếng Việt
  return "﻿" + [headers.join(","), ...rows].join("\n");
}

export async function GET(req: Request) {
  if (!(await isAuthed(req))) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const days = Math.min(365, Number(url.searchParams.get("days")) || 90);
  const leads = await readLeads(days);

  if (url.searchParams.get("format") === "csv") {
    return new Response(toCsv(leads), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="ai-xray-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }
  return Response.json({ total: leads.length, leads });
}
