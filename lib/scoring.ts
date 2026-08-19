import type {
  AssessmentAnswers,
  ScoreResult,
  SavingsResult,
  SavingsRow,
} from "./types";
import { PERSONAS } from "./personas";

// Bảng level theo tài liệu mục 16 (Gamification AI Level 1-10)
export const AI_LEVELS = [
  { level: 1, name: "AI Newbie", desc: "Biết AI/ChatGPT ở mức cơ bản" },
  { level: 2, name: "Prompter", desc: "Biết đặt câu lệnh và tái sử dụng prompt" },
  { level: 3, name: "AI Creator", desc: "Tạo content/ảnh/video bằng AI" },
  { level: 4, name: "AI Productivity", desc: "Dùng AI để tăng năng suất cá nhân" },
  { level: 5, name: "AI Marketer", desc: "Ứng dụng AI vào marketing/sales" },
  { level: 6, name: "AI Automator", desc: "Kết nối workflow tự động" },
  { level: 7, name: "AI Agent Builder", desc: "Tạo Agent theo vai trò/quy trình" },
  { level: 8, name: "AI Manager", desc: "Quản lý team + AI" },
  { level: 9, name: "AI Business", desc: "AI hóa đa phòng ban" },
  { level: 10, name: "AI Native Company", desc: "Vận hành doanh nghiệp AI-first" },
];

const USAGE_POINTS: Record<string, number> = {
  chua_dung: 0,
  thinh_thoang: 12,
  hang_ngay: 24,
  co_workflow: 34,
  co_agent: 45,
};

const USAGE_LABEL: Record<string, string> = {
  chua_dung: "Chưa dùng AI",
  thinh_thoang: "Thỉnh thoảng dùng",
  hang_ngay: "Dùng hàng ngày",
  co_workflow: "Đã có workflow AI",
  co_agent: "Đã có automation/agent",
};

// Logic điểm minh bạch (nguyên tắc triển khai mục 23: score phải có logic rõ, tránh số ảo).
// Tổng 100 = mức sử dụng (45) + độ phủ công cụ (20) + sẵn sàng automation (15)
//           + tỷ lệ task đã được AI hỗ trợ (20)
export function computeScore(a: AssessmentAnswers): ScoreResult {
  const persona = PERSONAS[a.persona ?? "office"];

  const usagePts = USAGE_POINTS[a.aiUsageLevel] ?? 0;

  const realTools = a.aiTools.filter((t) => t !== "Khác");
  const toolPts = Math.min(20, realTools.length * 5);

  const autoPts =
    a.automationReady === "san_sang"
      ? 15
      : a.automationReady === "can_tim_hieu"
        ? 8
        : 0;

  // Task coverage: người chưa dùng AI thì các task chọn coi như 0% được hỗ trợ
  const usageFactor =
    a.aiUsageLevel === "chua_dung"
      ? 0
      : a.aiUsageLevel === "thinh_thoang"
        ? 0.3
        : a.aiUsageLevel === "hang_ngay"
          ? 0.55
          : a.aiUsageLevel === "co_workflow"
            ? 0.75
            : 0.9;
  const taskPts = Math.round(20 * usageFactor);

  const score = Math.max(
    2,
    Math.min(100, usagePts + toolPts + autoPts + taskPts),
  );

  // Map điểm sang level 1-10, có trần theo mức sử dụng thật để level không vượt
  // năng lực đại diện trong bảng level (nguyên tắc: score phải có logic minh bạch)
  const LEVEL_CAP: Record<string, number> = {
    chua_dung: 2,
    thinh_thoang: 3,
    hang_ngay: 5,
    co_workflow: 7,
    co_agent: 10,
  };
  const level = Math.max(
    1,
    Math.min(LEVEL_CAP[a.aiUsageLevel] ?? 5, Math.ceil(score / 10)),
  );
  const levelName = AI_LEVELS[level - 1].name;

  const strengths: string[] = [];
  if (usagePts >= 24) strengths.push(`Đã đưa AI vào nhịp làm việc: ${USAGE_LABEL[a.aiUsageLevel]}.`);
  else if (usagePts > 0) strengths.push("Đã bắt đầu tiếp xúc với AI, có nền để tăng tốc nhanh.");
  else strengths.push("Bắt đầu từ trang trắng: dễ xây thói quen AI đúng ngay từ đầu, không phải sửa thói quen cũ.");
  if (realTools.length >= 2) strengths.push(`Quen với ${realTools.length} công cụ AI (${realTools.slice(0, 3).join(", ")}...).`);
  if (a.automationReady === "san_sang") strengths.push("Sẵn sàng kết nối công cụ để tự động hóa, đây là điều kiện để lên Level 6+.");
  if (a.goal) strengths.push(`Mục tiêu rõ ràng: ${a.goal.toLowerCase()}.`);

  const gaps: string[] = [];
  if (usagePts < 34) gaps.push("Chưa có workflow AI lặp lại được: mỗi lần dùng vẫn là một lần mò.");
  if (a.aiUsageLevel !== "co_agent") gaps.push("Chưa có AI Agent làm việc theo vai trò: AI mới trả lời, chưa chủ động làm thay.");
  if (realTools.length < 2) gaps.push("Độ phủ công cụ hẹp: mới quanh chat, chưa chạm mảng ảnh/video/automation.");
  if (a.automationReady !== "san_sang") gaps.push("Chưa kết nối các công cụ với nhau: dữ liệu và việc vẫn phải chuyển tay.");
  const topTaskLabels = persona.taskLibrary
    .filter((t) => a.topTasks.includes(t.id))
    .map((t) => t.label.toLowerCase());
  if (topTaskLabels.length) {
    gaps.push(`Các việc tốn giờ nhất (${topTaskLabels.join(", ")}) vẫn đang làm thủ công phần lớn.`);
  }

  return {
    score,
    level,
    levelName,
    breakdown: [
      { label: `Mức sử dụng AI (${USAGE_LABEL[a.aiUsageLevel]})`, points: usagePts, max: 45 },
      { label: `Độ phủ công cụ (${realTools.length} công cụ)`, points: toolPts, max: 20 },
      { label: "Mức sẵn sàng tự động hóa", points: autoPts, max: 15 },
      { label: "Tỷ lệ công việc đã được AI hỗ trợ", points: taskPts, max: 20 },
    ],
    strengths: strengths.slice(0, 3),
    gaps: gaps.slice(0, 5),
  };
}

export const DEFAULT_HOURLY_RATE = 80000; // đ/giờ, theo ví dụ trong tài liệu mục 7

// Quy đổi thời gian/tiền. Đây là CON SỐ CƠ HỘI (ước tính), không phải cam kết — theo nguyên tắc mục 7 và 23.
export function computeSavings(
  a: AssessmentAnswers,
  hourlyRate = DEFAULT_HOURLY_RATE,
): SavingsResult {
  const persona = PERSONAS[a.persona ?? "office"];
  const selected = persona.taskLibrary.filter((t) => a.topTasks.includes(t.id));
  const tasks = selected.length ? selected : persona.taskLibrary.slice(0, 3);

  const totalMonthlyHours = Math.max(4, a.repetitiveHoursPerWeek) * 4.33;

  // Chia số giờ khai báo cho các task chọn, task đầu tiên (tốn nhất) chiếm tỷ trọng lớn hơn
  const weights = tasks.map((_, i) => (tasks.length - i) + 1);
  const weightSum = weights.reduce((s, w) => s + w, 0);

  const rows: SavingsRow[] = tasks.map((t, i) => {
    const currentHours = Math.round((totalMonthlyHours * weights[i]) / weightSum);
    const savedHours = Math.round((currentHours * t.aiSupportPct) / 100);
    return {
      task: t.label,
      currentHours,
      afterHours: currentHours - savedHours,
      savedHours,
      group: t.group,
    };
  });

  const totalCurrentHours = rows.reduce((s, r) => s + r.currentHours, 0);
  const totalSavedHours = rows.reduce((s, r) => s + r.savedHours, 0);

  return {
    rows,
    totalCurrentHours,
    totalSavedHours,
    moneyPerMonth: totalSavedHours * hourlyRate,
    hourlyRate,
    aiSupportPct: totalCurrentHours
      ? Math.round((totalSavedHours / totalCurrentHours) * 100)
      : 0,
  };
}

// Lead scoring theo mục 14: hồ sơ + pain + intent + hành vi
export function computeLeadScore(
  a: AssessmentAnswers,
  score: number,
  behavior: { demoDone: boolean; roadmapViewed: boolean; offerClicked: boolean },
): number {
  let s = 0;
  if (a.persona === "ceo") s += 20;
  if (a.scale.includes("Trên 30") || a.scale.includes("11-30") || a.scale.includes("Trên 500")) s += 15;
  if (a.automationReady === "san_sang") s += 15;
  if (score < 40 && a.repetitiveHoursPerWeek >= 10) s += 10; // AI Score thấp nhưng pain cao
  if (a.repetitiveHoursPerWeek >= 15) s += 5;
  if (behavior.demoDone) s += 7;
  if (behavior.roadmapViewed) s += 5;
  if (behavior.offerClicked) s += 8;
  if (a.persona === "seller" || a.persona === "marketing") s += 8;
  return Math.min(100, s + 15); // 15 điểm nền cho lead hoàn thành assessment
}

export function formatVnd(n: number): string {
  return n.toLocaleString("vi-VN") + "đ";
}
