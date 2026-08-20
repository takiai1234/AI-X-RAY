"use client";

import { useState } from "react";
import { PERSONAS, courseUrl } from "@/lib/personas";
import type { AssessmentAnswers, ScoreResult, SavingsResult } from "@/lib/types";
import { track } from "@/lib/tracking";

// Personalized AI Learning Roadmap (mục 11) + mapping khóa học + share card (mục 16)
export default function Roadmap({
  answers,
  score,
  savings,
  leadName,
  courseUrls,
  onOfferClick,
}: {
  answers: AssessmentAnswers;
  score: ScoreResult;
  savings: SavingsResult;
  leadName: string;
  courseUrls?: Record<string, string>;
  onOfferClick: () => void;
}) {
  const p = PERSONAS[answers.persona ?? "office"];
  const targetLevel = Math.min(10, Math.max(score.level + 3, 7));
  const [copied, setCopied] = useState(false);

  const share = async () => {
    track("share_click", { persona: answers.persona, score: score.score });
    const text = `AI Score của tôi: ${score.score}/100 (Level ${score.level} - ${score.levelName}). AI có thể hỗ trợ ${savings.aiSupportPct}% khối lượng công việc của tôi. Bạn thử quét xem: `;
    const url = window.location.origin;
    if (navigator.share) {
      try {
        await navigator.share({ title: "AI X-RAY", text, url });
        return;
      } catch {
        /* người dùng hủy */
      }
    }
    await navigator.clipboard.writeText(text + url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openOffer = (courseName: string) => {
    track("offer_click", { course: courseName, persona: answers.persona });
    onOfferClick();
    window.open(courseUrls?.[courseName] || courseUrl(courseName), "_blank");
  };

  return (
    <div className="mx-auto max-w-2xl px-4 pb-16 pt-8">
      {/* Share card */}
      <div className="overflow-hidden rounded-2xl bg-navy-dark text-white shadow-xl">
        <div className="bg-navy px-5 py-3 text-xs font-bold uppercase tracking-widest">
          AI X-RAY · Kết quả quét
        </div>
        <div className="px-5 py-5 text-center">
          <p className="text-sm text-slate-300">
            {leadName ? `${leadName} · ` : ""}
            {p.label}
          </p>
          <p className="mt-2 text-5xl font-extrabold text-cam">
            {score.score}
            <span className="text-xl text-slate-400">/100</span>
          </p>
          <p className="mt-1 font-bold">
            Level {score.level}/10 — {score.levelName}
          </p>
          <p className="mt-2 text-sm text-slate-300">
            AI có thể hỗ trợ ~{savings.aiSupportPct}% khối lượng công việc ·{" "}
            {savings.totalSavedHours} giờ/tháng cơ hội tối ưu*
          </p>
          <button
            onClick={share}
            className="mt-4 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/20"
          >
            {copied ? "✓ Đã copy link chia sẻ" : "📤 Chia sẻ kết quả / thách bạn bè test"}
          </button>
        </div>
      </div>

      {/* Roadmap */}
      <div className="card mt-5">
        <h3 className="text-base font-bold text-navy-dark">
          🗺️ Lộ trình 30 ngày: Level {score.level} → Level {targetLevel}
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Thứ tự học được xếp theo đúng khoảng trống vừa chẩn đoán của bạn.
        </p>
        <ol className="mt-4 space-y-3">
          {p.roadmapPhases.map((phase, i) => (
            <li key={phase} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-semibold text-navy-dark">{phase}</p>
                <p className="text-xs text-slate-400">
                  Ngày {i * 6 + 1}–{Math.min(30, (i + 1) * 6)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Course mapping — offer khớp gap (mục 19: khóa học là giải pháp cho khoảng trống vừa chẩn đoán) */}
      <div className="card mt-5">
        <h3 className="text-base font-bold text-navy-dark">
          🎓 Chương trình phù hợp để đi hết lộ trình này
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Được chọn theo nhóm {p.label.toLowerCase()} và khoảng trống của bạn.
        </p>
        <div className="mt-4 space-y-3">
          {p.courses.map((c, i) => (
            <div
              key={c.name}
              className={`rounded-xl border-2 p-4 ${i === 0 ? "border-cam bg-cam/5" : "border-slate-200"}`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-bold text-navy-dark">{c.name}</p>
                {i === 0 && (
                  <span className="rounded-full bg-cam px-2.5 py-0.5 text-[10px] font-bold uppercase text-white">
                    Phù hợp nhất
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-slate-600">{c.reason}</p>
              <button
                onClick={() => openOffer(c.name)}
                className={i === 0 ? "btn-cta mt-3 w-full !py-2.5 text-sm" : "btn-ghost mt-3 w-full !py-2.5"}
              >
                Xem chương trình & nhận tư vấn lộ trình →
              </button>
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-[11px] text-slate-400">
          Tư vấn miễn phí theo đúng kết quả quét của bạn. Kết quả học tập phụ
          thuộc vào hành động của người học, chúng tôi không cam kết mức thu
          nhập cụ thể.
        </p>
      </div>

      <p className="mt-5 text-center text-[11px] text-slate-400">
        * Các con số là ước tính cơ hội dựa trên khai báo, không phải cam kết.
        <br />
        AI X-RAY — một sản phẩm của TAKI ACADEMY · taki.vn
      </p>
    </div>
  );
}
