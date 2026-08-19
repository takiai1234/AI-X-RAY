export type PersonaId =
  | "ceo"
  | "seller"
  | "office"
  | "affiliate"
  | "marketing"
  | "sales"
  | "hr"
  | "creator";

export type AiUsageLevel =
  | "chua_dung"
  | "thinh_thoang"
  | "hang_ngay"
  | "co_workflow"
  | "co_agent";

export interface AssessmentAnswers {
  persona: PersonaId | null;
  goal: string; // mục tiêu 3-6 tháng
  topTasks: string[]; // 3 công việc tốn thời gian nhất (từ task library persona)
  repetitiveHoursPerWeek: number; // giờ/tuần cho việc lặp lại
  aiUsageLevel: AiUsageLevel;
  aiTools: string[]; // công cụ AI đang dùng
  scale: string; // quy mô: nhân sự/doanh thu (DN) hoặc vai trò/thu nhập mục tiêu (cá nhân)
  painPoint: string; // vấn đề muốn AI giải quyết nhất
  automationReady: string; // sẵn sàng kết nối công cụ tự động hóa?
}

export interface TaskDef {
  id: string;
  label: string;
  aiSupportPct: number; // % công việc AI có thể hỗ trợ/tự động hóa (minh họa)
  group: "quick_win" | "chuan_hoa_du_lieu" | "agent_automation";
}

export interface AgentDemoConfig {
  name: string; // ví dụ: AI Business Advisor
  intro: string; // "Tôi đã tạo sẵn ... đầu tiên cho bạn"
  inputLabel: string;
  inputPlaceholder: string;
  systemPrompt: string; // prompt cho Claude
  fallbackOutput: string; // output mẫu khi không có API key
}

export interface CourseDef {
  name: string;
  reason: string; // vì sao khóa này khớp gap
}

export interface PersonaDef {
  id: PersonaId;
  label: string;
  hook: string;
  taskLibrary: TaskDef[];
  goals: string[];
  painPoints: string[];
  scaleQuestion: { label: string; options: string[] };
  agent: AgentDemoConfig;
  courses: CourseDef[];
  roadmapPhases: string[]; // 5 giai đoạn 30 ngày
}

export interface ScoreBreakdownItem {
  label: string;
  points: number;
  max: number;
}

export interface ScoreResult {
  score: number; // 0-100
  level: number; // 1-10
  levelName: string;
  breakdown: ScoreBreakdownItem[];
  strengths: string[];
  gaps: string[];
}

export interface SavingsRow {
  task: string;
  currentHours: number; // giờ/tháng hiện tại
  afterHours: number;
  savedHours: number;
  group: TaskDef["group"];
}

export interface SavingsResult {
  rows: SavingsRow[];
  totalCurrentHours: number;
  totalSavedHours: number;
  moneyPerMonth: number; // quy đổi VND (ước tính cơ hội)
  hourlyRate: number;
  aiSupportPct: number; // % khối lượng công việc AI hỗ trợ được
}

export interface Lead {
  name: string;
  phone: string;
  email: string;
  channel: "zalo" | "email" | "sdt";
}

export type FunnelStep =
  | "landing"
  | "assessment"
  | "analyzing"
  | "lead_gate"
  | "report"
  | "agent_demo"
  | "roadmap";
