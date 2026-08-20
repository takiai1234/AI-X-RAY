"use client";

import { PERSONA_LIST } from "@/lib/personas";
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
  heroSubtitle,
}: {
  onStart: (persona: PersonaId) => void;
  heroTitle: string;
  heroSubtitle: string;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-16">
      {/* Hero */}
      <header className="pt-10 text-center">
        <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-navy px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
          <span className="h-2 w-2 animate-pulse rounded-full bg-cam" />
          AI X-RAY
        </div>
        <h1 className="text-3xl font-extrabold leading-tight text-navy-dark sm:text-[3.5rem] sm:leading-[1.15]">
          <HeroTitle text={heroTitle} />
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-slate-600">
          {heroSubtitle}
        </p>
      </header>

      {/* 3 lợi ích */}
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

      {/* Chọn persona = câu hỏi 1 của assessment */}
      <div className="mt-10">
        <h2 className="text-center text-lg font-bold text-navy-dark">
          Bạn đang thuộc nhóm nào?
        </h2>
        <p className="mt-1 text-center text-sm text-slate-500">
          Chọn đúng nhóm để AI quét đúng loại công việc của bạn
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {PERSONA_LIST.map((p) => (
            <button
              key={p.id}
              onClick={() => onStart(p.id)}
              aria-label={`Chọn nhóm ${p.label} và bắt đầu quét`}
              className="chip flex min-h-[76px] flex-col items-center justify-center gap-1 text-center hover:shadow-md"
            >
              <span className="text-sm font-bold text-navy-dark">{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Social proof - bộ số CHỐT của TAKI */}
      <div className="mt-10 rounded-2xl bg-navy-dark px-6 py-6 text-center text-white">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-300">
          Phát triển bởi TAKI ACADEMY
        </p>
        <div className="mt-3 grid grid-cols-3 gap-4">
          <div>
            <p className="text-2xl font-extrabold text-cam">350.000</p>
            <p className="text-xs text-slate-300">học viên</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-cam">400</p>
            <p className="text-xs text-slate-300">doanh nghiệp đồng hành</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-cam">11 năm</p>
            <p className="text-xs text-slate-300">kinh nghiệm founder</p>
          </div>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-slate-400">
        Miễn phí, không cần thẻ. Kết quả là ước tính dựa trên thông tin bạn khai
        báo, không phải cam kết.
      </p>
    </div>
  );
}
