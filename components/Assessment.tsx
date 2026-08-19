"use client";

import { useState } from "react";
import { PERSONAS, AI_TOOL_OPTIONS } from "@/lib/personas";
import type { AssessmentAnswers, AiUsageLevel, PersonaId } from "@/lib/types";
import { track } from "@/lib/tracking";

const USAGE_OPTIONS: { value: AiUsageLevel; label: string }[] = [
  { value: "chua_dung", label: "Chưa dùng bao giờ" },
  { value: "thinh_thoang", label: "Thỉnh thoảng hỏi ChatGPT" },
  { value: "hang_ngay", label: "Dùng hàng ngày cho công việc" },
  { value: "co_workflow", label: "Có quy trình/prompt chuẩn lặp lại được" },
  { value: "co_agent", label: "Đã có automation hoặc AI Agent" },
];

const HOUR_OPTIONS = [
  { value: 4, label: "Dưới 5 giờ/tuần" },
  { value: 8, label: "5-10 giờ/tuần" },
  { value: 15, label: "10-20 giờ/tuần" },
  { value: 25, label: "Trên 20 giờ/tuần" },
];

const AUTO_OPTIONS = [
  { value: "san_sang", label: "Sẵn sàng, muốn tự động hóa càng nhiều càng tốt" },
  { value: "can_tim_hieu", label: "Muốn nhưng cần được hướng dẫn" },
  { value: "chua", label: "Chưa nghĩ đến" },
];

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
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<AssessmentAnswers>({
    persona,
    goal: "",
    topTasks: [],
    repetitiveHoursPerWeek: 0,
    aiUsageLevel: "chua_dung",
    aiTools: [],
    scale: "",
    painPoint: "",
    automationReady: "",
  });

  const steps = 7;
  const next = (patch: Partial<AssessmentAnswers>) => {
    const merged = { ...answers, ...patch };
    setAnswers(merged);
    const nextStep = step + 1;
    track(`question_step_${nextStep}` as `question_step_${number}`, {
      persona,
    });
    if (nextStep >= steps) {
      onComplete(merged);
    } else {
      setStep(nextStep);
    }
  };

  const toggle = (arr: string[], v: string, max = 99) =>
    arr.includes(v) ? arr.filter((x) => x !== v) : arr.length < max ? [...arr, v] : arr;

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

      {/* Step 0: mục tiêu */}
      {step === 0 && (
        <StepBox title="Mục tiêu lớn nhất của bạn trong 3-6 tháng tới?">
          {p.goals.map((g) => (
            <button key={g} className="chip w-full" onClick={() => next({ goal: g })}>
              {g}
            </button>
          ))}
        </StepBox>
      )}

      {/* Step 1: top tasks */}
      {step === 1 && (
        <StepBox
          title="Bạn đang dành nhiều thời gian nhất cho những việc nào?"
          subtitle="Chọn tối đa 3 việc, ưu tiên việc tốn giờ nhất"
        >
          {p.taskLibrary.map((t) => (
            <button
              key={t.id}
              className={`chip w-full ${answers.topTasks.includes(t.id) ? "chip-active" : ""}`}
              onClick={() =>
                setAnswers({ ...answers, topTasks: toggle(answers.topTasks, t.id, 3) })
              }
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

      {/* Step 2: giờ lặp lại */}
      {step === 2 && (
        <StepBox title="Mỗi tuần bạn mất khoảng bao nhiêu giờ cho các việc lặp lại?">
          {HOUR_OPTIONS.map((o) => (
            <button
              key={o.value}
              className="chip w-full"
              onClick={() => next({ repetitiveHoursPerWeek: o.value })}
            >
              {o.label}
            </button>
          ))}
        </StepBox>
      )}

      {/* Step 3: mức dùng AI */}
      {step === 3 && (
        <StepBox title="Bạn đang sử dụng AI ở mức nào?">
          {USAGE_OPTIONS.map((o) => (
            <button
              key={o.value}
              className="chip w-full"
              onClick={() => next({ aiUsageLevel: o.value })}
            >
              {o.label}
            </button>
          ))}
        </StepBox>
      )}

      {/* Step 4: công cụ */}
      {step === 4 && (
        <StepBox
          title="Bạn đang dùng những công cụ AI nào?"
          subtitle="Chọn tất cả công cụ đã từng dùng, hoặc bỏ qua nếu chưa dùng"
        >
          <div className="grid grid-cols-2 gap-2">
            {AI_TOOL_OPTIONS.map((t) => (
              <button
                key={t}
                className={`chip ${answers.aiTools.includes(t) ? "chip-active" : ""}`}
                onClick={() => setAnswers({ ...answers, aiTools: toggle(answers.aiTools, t) })}
              >
                {t}
              </button>
            ))}
          </div>
          <button className="btn-cta mt-3 w-full" onClick={() => next({})}>
            {answers.aiTools.length ? "Tiếp tục →" : "Chưa dùng công cụ nào →"}
          </button>
        </StepBox>
      )}

      {/* Step 5: quy mô */}
      {step === 5 && (
        <StepBox title={p.scaleQuestion.label}>
          {p.scaleQuestion.options.map((o) => (
            <button key={o} className="chip w-full" onClick={() => next({ scale: o })}>
              {o}
            </button>
          ))}
        </StepBox>
      )}

      {/* Step 6: pain + automation readiness */}
      {step === 6 && (
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
              <button
                key={o.value}
                className={`chip w-full ${answers.automationReady === o.value ? "chip-active" : ""}`}
                onClick={() => setAnswers({ ...answers, automationReady: o.value })}
              >
                {o.label}
              </button>
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
