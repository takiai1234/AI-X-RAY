"use client";

import { useState } from "react";
import type { Lead } from "@/lib/types";

// Lead capture trước khi mở full report (mục 12: Lead Capture trước AI Score + Report)
export default function LeadGate({
  score,
  onSubmit,
}: {
  score: number;
  onSubmit: (lead: Lead) => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");

  const submit = () => {
    if (!name.trim()) {
      setErr("Nhập tên của bạn để nhận báo cáo cá nhân hóa");
      return;
    }
    if (!phone.trim() && !email.trim()) {
      setErr("Nhập ít nhất SĐT/Zalo hoặc email để nhận báo cáo");
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

  return (
    <div className="mx-auto max-w-md px-4 pb-16 pt-10">
      {/* Preview bị che một phần để tăng động lực (mục 22.2) */}
      <div className="card relative overflow-hidden text-center">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Kết quả quét của bạn
        </p>
        <p className="mt-2 text-5xl font-extrabold text-navy">
          {score}
          <span className="text-2xl text-slate-400">/100</span>
        </p>
        <p className="mt-1 text-sm font-semibold text-cam">AI READINESS SCORE</p>
        <div className="mt-4 space-y-2 blur-sm select-none" aria-hidden>
          <div className="h-3 rounded bg-slate-200" />
          <div className="h-3 w-4/5 rounded bg-slate-200" />
          <div className="h-3 w-3/5 rounded bg-slate-200" />
          <div className="h-16 rounded bg-slate-100" />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white to-transparent" />
      </div>

      <h2 className="mt-6 text-center text-xl font-bold text-navy-dark">
        Nhận báo cáo đầy đủ + lộ trình AI 30 ngày
      </h2>
      <p className="mt-1 text-center text-sm text-slate-500">
        Báo cáo gồm: bản đồ cơ hội AI hóa, số giờ có thể tối ưu, AI Agent chạy
        thử và lộ trình học cá nhân hóa.
      </p>

      <div className="mt-5 flex flex-col gap-3">
        <input
          className="rounded-xl border-2 border-slate-200 px-4 py-3 text-sm outline-none focus:border-navy"
          placeholder="Tên của bạn *"
          aria-label="Tên của bạn (bắt buộc)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="rounded-xl border-2 border-slate-200 px-4 py-3 text-sm outline-none focus:border-navy"
          placeholder="SĐT / Zalo (nhận lộ trình qua Zalo)"
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <input
          className="rounded-xl border-2 border-slate-200 px-4 py-3 text-sm outline-none focus:border-navy"
          placeholder="Email (tùy chọn)"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {err && <p className="text-sm font-medium text-red-600">{err}</p>}
        <button className="btn-cta w-full" onClick={submit}>
          🔓 Mở báo cáo đầy đủ
        </button>
        <p className="text-center text-xs text-slate-400">
          Bấm để mở báo cáo đầy đủ ngay. Thông tin của bạn được đội ngũ TAKI dùng
          để tư vấn lộ trình phù hợp.
        </p>
      </div>
    </div>
  );
}
