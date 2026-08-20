"use client";

import { useState } from "react";
import { PERSONAS, courseUrl } from "@/lib/personas";
import type { AssessmentAnswers, ScoreResult, SavingsResult } from "@/lib/types";
import { track, getSessionId } from "@/lib/tracking";

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
  const mainCourse = p.courses[0];
  const otherCourses = p.courses.slice(1);
  const [copied, setCopied] = useState(false);

  const share = async () => {
    track("share_click", { persona: answers.persona, score: score.score });
    const text = `AI Score của tôi: ${score.score}/100 (Level ${score.level} - ${score.levelName}). AI có thể hỗ trợ ${savings.aiSupportPct}% khối lượng công việc của tôi. Bạn thử quét xem: `;
    // F-06: gắn nguồn để đo vòng lan truyền — share này đẻ ra bao nhiêu lượt quét
    const url = `${window.location.origin}/?ref=${getSessionId()}&utm_source=share&utm_medium=referral`;
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

  const offerHref = (courseName: string) =>
    courseUrls?.[courseName] || courseUrl(courseName);

  // F-05: dùng thẻ <a> thật (giữ event tracking bằng onClick) để không bị
  // chặn popup trong webview Zalo/Facebook — đây là nút ra tiền.
  const onOfferClickTrack = (courseName: string) => {
    track("offer_click", { course: courseName, persona: answers.persona });
    onOfferClick();
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

      {/* Màn cuối: 1 khoá chính nổi bật + các khoá phụ rút gọn */}
      <div className="mt-5">
        <h3 className="text-base font-bold text-navy-dark">
          🎓 Bước tiếp theo cho Level {score.level} của bạn
        </h3>

        {mainCourse && (
          <div className="mt-3 rounded-2xl border-2 border-cam bg-cam/5 p-5">
            <span className="inline-block rounded-full bg-cam px-3 py-1 text-[11px] font-bold uppercase text-white">
              Khớp kết quả quét của bạn
            </span>
            <p className="mt-3 text-lg font-extrabold text-navy-dark">{mainCourse.name}</p>
            <ul className="mt-2 space-y-1.5">
              <li className="flex gap-2 text-sm text-slate-700">
                <span className="text-cam">✓</span> {mainCourse.reason}
              </li>
              <li className="flex gap-2 text-sm text-slate-700">
                <span className="text-cam">✓</span> Bao trọn các chặng trong lộ trình 30 ngày ở trên
              </li>
              <li className="flex gap-2 text-sm text-slate-700">
                <span className="text-cam">✓</span> Khớp Level {score.level} và khoảng trống vừa chẩn đoán của bạn
              </li>
            </ul>
            <a
              href={offerHref(mainCourse.name)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onOfferClickTrack(mainCourse.name)}
              className="btn-cta mt-4 w-full !py-3"
            >
              Nhận tư vấn lộ trình qua Zalo →
            </a>
            <p className="mt-2 text-center text-[11px] text-slate-400">
              Miễn phí · tư vấn theo đúng kết quả quét · trả lời trong giờ hành chính
            </p>
          </div>
        )}

        {otherCourses.length > 0 && (
          <>
            <p className="mt-4 text-xs font-semibold text-slate-500">
              Hai hướng khác nếu bạn muốn so sánh
            </p>
            <div className="mt-2 space-y-2">
              {otherCourses.map((c) => (
                <a
                  key={c.name}
                  href={offerHref(c.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onOfferClickTrack(c.name)}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 transition hover:border-navy/40"
                >
                  <span>
                    <span className="block text-sm font-bold text-navy-dark">{c.name}</span>
                    <span className="block text-xs text-slate-500">{c.reason}</span>
                  </span>
                  <span className="shrink-0 text-sm font-semibold text-navy">Xem →</span>
                </a>
              ))}
            </div>
          </>
        )}

        <p className="mt-3 text-center text-[11px] text-slate-400">
          Kết quả học tập phụ thuộc vào hành động của người học, chúng tôi không
          cam kết mức thu nhập cụ thể.
        </p>
      </div>

      {/* CTA ghim đáy khi cuộn */}
      {mainCourse && (
        <div className="sticky bottom-4 z-10 mt-6">
          <a
            href={offerHref(mainCourse.name)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onOfferClickTrack(mainCourse.name)}
            className="btn-cta w-full !py-3"
          >
            Nhận tư vấn lộ trình qua Zalo →
          </a>
        </div>
      )}

      <p className="mt-5 text-center text-[11px] text-slate-400">
        * Các con số là ước tính cơ hội dựa trên khai báo, không phải cam kết.
        <br />
        AI X-RAY — một sản phẩm của TAKI ACADEMY · taki.vn
      </p>
    </div>
  );
}
