"use client";

import { useState } from "react";
import { PERSONAS } from "@/lib/personas";
import type { AssessmentAnswers, AiUsageLevel, PersonaId } from "@/lib/types";
import { track } from "@/lib/tracking";

// Bài test 5 câu (rút gọn theo feedback: ít câu hơn, lựa chọn đầy đủ hơn).
// Mỗi lựa chọn có mô tả phụ để khách chọn đúng tình trạng của mình.

const USAGE_OPTIONS: { value: AiUsageLevel; label: string; desc: string }[] = [
  { value: "chua_dung", label: "Chưa dùng bao giờ", desc: "Nghe nói nhiều nhưng chưa thử, hoặc thử một lần rồi bỏ" },
  { value: "thinh_thoang", label: "Thỉnh thoảng", desc: "Lâu lâu hỏi ChatGPT một câu khi bí" },
  { value: "hang_ngay", label: "Dùng hàng ngày", desc: "Thành thói quen, nhưng mỗi lần dùng vẫn phải nghĩ cách hỏi" },
  { value: "co_workflow", label: "Có prompt / quy trình chuẩn", desc: "Việc quen thuộc đã có prompt lưu sẵn, dùng lại được nhiều lần" },
  { value: "co_agent", label: "Có automation / AI Agent", desc: "Đã kết nối công cụ để AI tự chạy một phần công việc" },
];

const HOUR_OPTIONS: { value: number; label: string; desc: string }[] = [
  { value: 3, label: "Dưới 3 giờ/tuần", desc: "Việc lặp lại ít, chủ yếu việc phát sinh" },
  { value: 6, label: "3-8 giờ/tuần", desc: "Cỡ một buổi làm việc mỗi tuần" },
  { value: 12, label: "8-15 giờ/tuần", desc: "Cỡ 1-2 ngày làm việc mỗi tuần" },
  { value: 20, label: "15-25 giờ/tuần", desc: "Khoảng một nửa thời gian làm việc" },
  { value: 30, label: "Trên 25 giờ/tuần", desc: "Việc lặp lại chiếm gần hết thời gian" },
];

const AUTO_OPTIONS: { value: string; label: string; desc: string }[] = [
  { value: "san_sang", label: "Sẵn sàng", desc: "Muốn tự động hóa càng nhiều càng tốt, chấp nhận học công cụ mới" },
  { value: "can_tim_hieu", label: "Muốn nhưng cần hướng dẫn", desc: "Ngại phần kỹ thuật, cần người chỉ đúng thứ tự" },
  { value: "chua", label: "Chưa nghĩ đến", desc: "Trước mắt chỉ cần AI giúp từng việc một" },
];

// Chi phí giờ công do KHÁCH TỰ CHỌN — đây là con số dùng để quy đổi tiền trong report.
// DN chọn theo chi phí người đang làm các việc đó; cá nhân chọn theo mức thu nhập.
const RATE_OPTIONS_BUSINESS: { value: number; label: string; desc: string }[] = [
  { value: 50000, label: "Khoảng 50.000đ/giờ", desc: "Nhân sự phổ thông (lương ~9 triệu/tháng)" },
  { value: 80000, label: "Khoảng 80.000đ/giờ", desc: "Nhân viên có kinh nghiệm (~14 triệu/tháng)" },
  { value: 150000, label: "Khoảng 150.000đ/giờ", desc: "Quản lý làm, hoặc chính chủ DN phải tự làm (~26 triệu/tháng)" },
  { value: 300000, label: "Trên 300.000đ/giờ", desc: "Phần lớn do chủ DN / cấp cao trực tiếp làm" },
];

const RATE_OPTIONS_PERSONAL: { value: number; label: string; desc: string }[] = [
  { value: 45000, label: "Dưới 10 triệu/tháng", desc: "Tương đương ~45.000đ cho mỗi giờ làm việc" },
  { value: 80000, label: "10 - 18 triệu/tháng", desc: "Tương đương ~80.000đ/giờ" },
  { value: 150000, label: "18 - 35 triệu/tháng", desc: "Tương đương ~150.000đ/giờ" },
  { value: 250000, label: "Trên 35 triệu/tháng", desc: "Tương đương ~250.000đ/giờ trở lên" },
];

const BUSINESS_PERSONAS: PersonaId[] = ["ceo", "seller"];

export default function Assessment({
  persona,
  onComplete,
  onBack,
}: {
  persona: PersonaId;
  onComplete: (answers: AssessmentAnswers) => void;
  onBack: () => void;
}) {
  const p = PERSONAS[persona];
  const isBusiness = BUSINESS_PERSONAS.includes(persona);
  const rateOptions = isBusiness ? RATE_OPTIONS_BUSINESS : RATE_OPTIONS_PERSONAL;

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<AssessmentAnswers>({
    persona,
    goal: "",
    topTasks: [],
    repetitiveHoursPerWeek: 0,
    aiUsageLevel: "chua_dung",
    aiTools: [],
    scale: "",
    hourlyRateSelf: 0,
    painPoint: "",
    automationReady: "",
  });

  const steps = 5;
  const next = (patch: Partial<AssessmentAnswers>) => {
    const merged = { ...answers, ...patch };
    setAnswers(merged);
    const nextStep = step + 1;
    track(`question_step_${nextStep}` as `question_step_${number}`, { persona });
    if (nextStep >= steps) {
      onComplete(merged);
    } else {
      setStep(nextStep);
    }
  };

  const toggleTask = (v: string) =>
    answers.topTasks.includes(v)
      ? answers.topTasks.filter((x) => x !== v)
      : answers.topTasks.length < 3
        ? [...answers.topTasks, v]
        : answers.topTasks;

  return (
    <div className="mx-auto max-w-xl px-4 pb-16 pt-8">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
          <button onClick={step === 0 ? onBack : () => setStep(step - 1)} className="hover:text-navy">
            ← Quay lại
          </button>
          <span>
            Câu {step + 1}/{steps} · {p.label}
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="progress-bar h-full rounded-full bg-cam"
            style={{ width: `${((step + 1) / steps) * 100}%` }}
          />
        </div>
      </div>

      {/* Câu 1: top tasks */}
      {step === 0 && (
        <StepBox
          title="Bạn đang dành nhiều thời gian nhất cho những việc nào?"
          subtitle="Chọn tối đa 3 việc, ưu tiên việc tốn giờ nhất"
        >
          {p.taskLibrary.map((t) => (
            <button
              key={t.id}
              className={`chip w-full ${answers.topTasks.includes(t.id) ? "chip-active" : ""}`}
              onClick={() => setAnswers({ ...answers, topTasks: toggleTask(t.id) })}
            >
              {t.label}
            </button>
          ))}
          <button
            className="btn-cta mt-3 w-full disabled:opacity-40"
            disabled={answers.topTasks.length === 0}
            onClick={() => next({})}
          >
            Tiếp tục →
          </button>
        </StepBox>
      )}

      {/* Câu 2: giờ lặp lại */}
      {step === 1 && (
        <StepBox title="Mỗi tuần bạn mất khoảng bao nhiêu giờ cho các việc lặp lại?">
          {HOUR_OPTIONS.map((o) => (
            <OptionButton
              key={o.value}
              label={o.label}
              desc={o.desc}
              onClick={() => next({ repetitiveHoursPerWeek: o.value })}
            />
          ))}
        </StepBox>
      )}

      {/* Câu 3: mức dùng AI */}
      {step === 2 && (
        <StepBox title="Bạn đang sử dụng AI ở mức nào?">
          {USAGE_OPTIONS.map((o) => (
            <OptionButton
              key={o.value}
              label={o.label}
              desc={o.desc}
              onClick={() => next({ aiUsageLevel: o.value })}
            />
          ))}
        </StepBox>
      )}

      {/* Câu 4: quy mô + chi phí giờ công tự khai */}
      {step === 3 && (
        <StepBox title={p.scaleQuestion.label}>
          <div className="flex flex-col gap-2">
            {p.scaleQuestion.options.map((o) => (
              <button
                key={o}
                className={`chip w-full ${answers.scale === o ? "chip-active" : ""}`}
                onClick={() => setAnswers({ ...answers, scale: o })}
              >
                {o}
              </button>
            ))}
          </div>

          <p className="mt-5 text-sm font-bold text-navy-dark">
            {isBusiness
              ? "Chi phí giờ công của người đang làm các việc trên khoảng bao nhiêu?"
              : "Thu nhập hiện tại của bạn ở khoảng nào?"}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Dùng để quy đổi thời gian lãng phí thành tiền theo đúng con số của bạn.
          </p>
          <div className="mt-2 flex flex-col gap-2">
            {rateOptions.map((o) => (
              <OptionButton
                key={o.value}
                label={o.label}
                desc={o.desc}
                active={answers.hourlyRateSelf === o.value}
                onClick={() => setAnswers({ ...answers, hourlyRateSelf: o.value })}
              />
            ))}
          </div>
          <button
            className="btn-cta mt-4 w-full disabled:opacity-40"
            disabled={!answers.scale || !answers.hourlyRateSelf}
            onClick={() => next({})}
          >
            Tiếp tục →
          </button>
        </StepBox>
      )}

      {/* Câu 5: pain + automation readiness */}
      {step === 4 && (
        <StepBox title="Bạn muốn AI giúp giải quyết vấn đề nào nhất ngay bây giờ?">
          {p.painPoints.map((o) => (
            <button
              key={o}
              className={`chip w-full ${answers.painPoint === o ? "chip-active" : ""}`}
              onClick={() => setAnswers({ ...answers, painPoint: o })}
            >
              {o}
            </button>
          ))}
          <p className="mt-5 text-sm font-bold text-navy-dark">
            Bạn có sẵn sàng kết nối các công cụ để tự động hóa quy trình không?
          </p>
          <div className="mt-2 flex flex-col gap-2">
            {AUTO_OPTIONS.map((o) => (
              <OptionButton
                key={o.value}
                label={o.label}
                desc={o.desc}
                active={answers.automationReady === o.value}
                onClick={() => setAnswers({ ...answers, automationReady: o.value })}
              />
            ))}
          </div>
          <button
            className="btn-cta mt-4 w-full disabled:opacity-40"
            disabled={!answers.painPoint || !answers.automationReady}
            onClick={() => next({})}
          >
            Xem kết quả quét →
          </button>
        </StepBox>
      )}
    </div>
  );
}

function OptionButton({
  label,
  desc,
  active,
  onClick,
}: {
  label: string;
  desc: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button className={`chip w-full ${active ? "chip-active" : ""}`} onClick={onClick}>
      <span className="block font-semibold">{label}</span>
      <span className="mt-0.5 block text-xs font-normal text-slate-400">{desc}</span>
    </button>
  );
}

function StepBox({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-navy-dark">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      <div className="mt-4 flex flex-col gap-2">{children}</div>
    </div>
  );
}
