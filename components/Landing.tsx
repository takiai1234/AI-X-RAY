"use client";

import { PERSONA_LIST, PERSONA_ICON, FEATURED_PERSONA } from "@/lib/personas";
import type { PersonaId } from "@/lib/types";

// Render tiêu đề: *chữ* trong dấu sao được tô màu cam
function HeroTitle({ text }: { text: string }) {
  const parts = text.split(/\*([^*]+)\*/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="text-cam">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

export default function Landing({
  onStart,
  heroTitle,
}: {
  onStart: (persona: PersonaId) => void;
  heroTitle: string;
  heroSubtitle: string;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-16">
      {/* Hero gọn: badge + tiêu đề 2 dòng + dòng cam kết ngắn */}
      <header className="pt-8 text-center">
        <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full bg-navy px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
          <span className="h-2 w-2 animate-pulse rounded-full bg-cam" />
          AI X-RAY
        </div>
        <h1 className="text-[1.7rem] font-extrabold leading-[1.2] text-navy-dark sm:text-[2.75rem] sm:leading-[1.15]">
          <HeroTitle text={heroTitle} />
        </h1>
        <p className="mt-3 text-sm font-semibold text-slate-500">
          5 câu · 2 phút · miễn phí — nhận AI Score và lộ trình 30 ngày
        </p>
      </header>

      {/* Lưới chọn nhóm — kéo lên trong màn hình đầu */}
      <div className="mt-6">
        <h2 className="text-center text-base font-bold text-navy-dark">
          Bạn đang thuộc nhóm nào?
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {PERSONA_LIST.map((p) => {
            const featured = p.id === FEATURED_PERSONA;
            return (
              <button
                key={p.id}
                onClick={() => onStart(p.id)}
                aria-label={`Chọn nhóm ${p.label} và bắt đầu quét`}
                className={`flex min-h-[92px] flex-col items-center justify-center gap-1.5 rounded-xl border-2 px-2 py-3 text-center transition hover:shadow-md ${
                  featured
                    ? "border-cam bg-cam/5"
                    : "border-slate-200 bg-white hover:border-navy/50"
                }`}
              >
                <span className="text-2xl">{PERSONA_ICON[p.id]}</span>
                <span className="text-[13px] font-bold leading-tight text-navy-dark">
                  {p.label}
                </span>
              </button>
            );
          })}
        </div>
        {/* Social proof ngay dưới lưới */}
        <p className="mt-4 text-center text-sm font-semibold text-slate-500">
          ⭐ <span className="text-navy-dark">350.000</span> học viên ·{" "}
          <span className="text-navy-dark">400</span> doanh nghiệp đồng hành
        </p>
      </div>

      {/* 3 lợi ích — đẩy xuống dưới cho ai muốn đọc thêm */}
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {[
          ["🔍", "Biết AI làm được gì cho đúng công việc của bạn"],
          ["⏱️", "Thấy rõ số giờ và chi phí cơ hội đang bỏ lỡ"],
          ["🗺️", "Nhận lộ trình AI 30 ngày cá nhân hóa"],
        ].map(([icon, text]) => (
          <div key={text} className="card flex items-start gap-3 !p-4">
            <span className="text-2xl">{icon}</span>
            <p className="text-sm font-medium text-slate-700">{text}</p>
          </div>
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-slate-400">
        Miễn phí, không cần thẻ. Kết quả là ước tính dựa trên thông tin bạn khai
        báo, không phải cam kết. Phát triển bởi TAKI ACADEMY.
      </p>
    </div>
  );
}
