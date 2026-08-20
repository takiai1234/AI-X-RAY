"use client";

import { useState } from "react";
import type { Lead } from "@/lib/types";

// Màn xin thông tin (mục 12): cho khách một phát hiện thật + gauge điểm + danh
// sách phần thưởng đang khoá (ghi rõ tên) trước khi đòi thông tin.
export default function LeadGate({
  score,
  level,
  levelName,
  savedHours,
  personaLabel,
  topTaskLabel,
  topTaskAiPct,
  onSubmit,
}: {
  score: number;
  level: number;
  levelName: string;
  savedHours: number;
  personaLabel: string;
  topTaskLabel: string;
  topTaskAiPct: number;
  onSubmit: (lead: Lead) => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");

  // % "cao hơn ... người cùng nhóm" suy từ điểm (ước lượng minh họa)
  const comparePct = Math.min(92, Math.max(8, Math.round(score * 0.88)));

  const submit = () => {
    if (!name.trim()) {
      setErr("Nhập tên của bạn để nhận báo cáo cá nhân hóa");
      return;
    }
    if (!phone.trim() && !email.trim()) {
      setErr("Nhập SĐT/Zalo để nhận lộ trình");
      return;
    }
    if (phone && !/^0\d{8,10}$/.test(phone.replace(/[\s.]/g, ""))) {
      setErr("SĐT chưa đúng định dạng (bắt đầu bằng 0, 9-11 số)");
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErr("Email chưa đúng định dạng");
      return;
    }
    onSubmit({ name, phone, email, channel: phone ? "zalo" : "email" });
  };

  // Gauge nửa vòng
  const R = 60;
  const CX = 70;
  const CY = 70;
  const len = Math.PI * R;
  const offset = len * (1 - score / 100);

  return (
    <div className="mx-auto max-w-md px-4 pb-16 pt-8">
      <div className="card text-center">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Kết quả quét của bạn
        </p>

        {/* Gauge nửa vòng có mốc */}
        <div className="mx-auto mt-2 w-[140px]">
          <svg viewBox="0 0 140 80" className="w-full">
            <path
              d="M 10 70 A 60 60 0 0 1 130 70"
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <path
              d="M 10 70 A 60 60 0 0 1 130 70"
              fill="none"
              stroke="#F97316"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={len}
              strokeDashoffset={offset}
            />
            <text x={CX} y={CY - 8} textAnchor="middle" className="fill-navy" fontSize="30" fontWeight="800">
              {score}
            </text>
            <text x={CX} y={CY + 8} textAnchor="middle" className="fill-slate-400" fontSize="11">
              /100
            </text>
          </svg>
        </div>
        <p className="mt-1 text-lg font-bold text-navy-dark">
          Level {level}/10 — {levelName}
        </p>
        <p className="text-xs text-slate-500">
          Cao hơn {comparePct}% {personaLabel} cùng quy mô đã quét (ước tính)
        </p>

        {/* Cho không 1 phát hiện thật */}
        {topTaskLabel && (
          <div className="mt-4 rounded-xl bg-navy/5 p-3 text-left text-sm text-slate-700">
            <span className="font-bold text-navy">✓ Xem trước:</span> việc tốn giờ
            nhất của bạn là <b>{topTaskLabel.toLowerCase()}</b> — AI gánh được
            khoảng <b className="text-cam-dark">{topTaskAiPct}%</b>.
          </div>
        )}

        {/* Danh sách phần thưởng đang khoá, ghi rõ tên */}
        <div className="mt-3 space-y-2 text-left text-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Trong báo cáo đầy đủ còn có
          </p>
          {[
            "Bảng 3 nhóm việc AI hóa được, kèm số giờ",
            "Chi phí cơ hội quy ra tiền mỗi tháng",
            "1 AI Agent tạo sẵn, chạy thử ngay",
            "Lộ trình 30 ngày chia theo tuần",
          ].map((t) => (
            <div key={t} className="flex items-center gap-2 text-slate-600">
              <span>🔒</span> {t}
            </div>
          ))}
        </div>
      </div>

      {/* Form gọn: tên + SĐT bắt buộc, email là tùy chọn ẩn */}
      <div className="mt-5 flex flex-col gap-3">
        <input
          className="rounded-xl border-2 border-slate-200 px-4 py-3 text-sm outline-none focus:border-navy"
          placeholder="Tên của bạn"
          aria-label="Tên của bạn (bắt buộc)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="rounded-xl border-2 border-slate-200 px-4 py-3 text-sm outline-none focus:border-navy"
          placeholder="Số Zalo để nhận lộ trình"
          inputMode="tel"
          aria-label="Số điện thoại / Zalo (bắt buộc)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <input
          className="rounded-xl border-2 border-slate-200 px-4 py-3 text-sm outline-none focus:border-navy"
          placeholder="Email để nhận báo cáo & lộ trình (tùy chọn)"
          inputMode="email"
          aria-label="Email (tùy chọn)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {err && <p className="text-sm font-medium text-red-600">{err}</p>}
        <button className="btn-cta w-full" onClick={submit}>
          🔓 Xem báo cáo {savedHours} giờ/tháng của tôi →
        </button>
        <p className="text-center text-xs text-slate-400">
          🔒 Không gọi làm phiền · 350.000 học viên đã quét
        </p>
      </div>
    </div>
  );
}
