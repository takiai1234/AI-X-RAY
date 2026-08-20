import Anthropic from "@anthropic-ai/sdk";
import { PERSONAS } from "@/lib/personas";
import { AI_LEVELS } from "@/lib/scoring";

export const maxDuration = 60;

interface AgentContext {
  score?: number;
  level?: number;
  levelName?: string;
  topTaskLabels?: string[];
  painPoint?: string;
  scale?: string;
  hoursPerWeek?: number;
}

// Khối phân tích cá nhân hóa dựng từ kết quả quét — dùng cho cả prompt Claude
// lẫn phần mở đầu của fallback (để bản mẫu cũng bám theo người dùng thật).
function buildContextBlock(ctx: AgentContext | undefined): string {
  if (!ctx?.score) return "";
  const lines: string[] = [];
  lines.push(`- AI Score: ${ctx.score}/100, Level ${ctx.level}/10 (${ctx.levelName}).`);
  if (ctx.topTaskLabels?.length) {
    lines.push(`- Các việc đang tốn giờ nhất: ${ctx.topTaskLabels.join(", ")}.`);
  }
  if (ctx.hoursPerWeek) {
    lines.push(`- Thời gian cho việc lặp lại: khoảng ${ctx.hoursPerWeek} giờ/tuần.`);
  }
  if (ctx.scale) lines.push(`- Quy mô: ${ctx.scale}.`);
  if (ctx.painPoint) lines.push(`- Vấn đề đang ưu tiên giải quyết: ${ctx.painPoint}.`);
  return lines.join("\n");
}

function fallbackIntro(ctx: AgentContext | undefined): string {
  if (!ctx?.score) return "";
  const levelDesc = ctx.level ? AI_LEVELS[ctx.level - 1]?.desc ?? "" : "";
  const parts: string[] = ["**PHÂN TÍCH TỪ KẾT QUẢ QUÉT CỦA BẠN**"];
  parts.push(
    `- AI Score của bạn là ${ctx.score}/100 (Level ${ctx.level} - ${ctx.levelName}: ${levelDesc.toLowerCase()}). ` +
      (ctx.score! < 40
        ? "Điểm thấp không phải điều xấu: nghĩa là phần lớn cơ hội tối ưu vẫn còn nguyên, làm đúng thứ tự sẽ thấy khác biệt nhanh."
        : ctx.score! < 65
          ? "Bạn đã có nền, thứ thiếu là biến thói quen dùng AI thành quy trình lặp lại được."
          : "Bạn đang ở nhóm dẫn đầu, bước tiếp theo là chuyển từ dùng AI sang xây hệ thống Agent chạy thay mình."),
  );
  if (ctx.topTaskLabels?.length) {
    parts.push(
      `- Ba việc ngốn giờ nhất bạn khai báo (${ctx.topTaskLabels.join(", ").toLowerCase()}) đều thuộc nhóm AI xử lý tốt — kế hoạch bên dưới bám thẳng vào các việc này.`,
    );
  }
  if (ctx.hoursPerWeek) {
    parts.push(
      `- Với khoảng ${ctx.hoursPerWeek} giờ/tuần cho việc lặp lại, mỗi 10% tự động hóa được là lấy lại gần ${Math.round(ctx.hoursPerWeek * 0.1 * 4.33)} giờ/tháng (ước tính).`,
    );
  }
  if (ctx.painPoint) {
    parts.push(`- Vấn đề bạn ưu tiên — "${ctx.painPoint.toLowerCase()}" — được xử lý trực tiếp trong phần kế hoạch bên dưới.`);
  }
  return parts.join("\n") + "\n\n";
}

export async function POST(req: Request) {
  const { personaId, input, context } = (await req.json()) as {
    personaId: string;
    input: string;
    context?: AgentContext;
  };

  const persona = PERSONAS[personaId];
  if (!persona) {
    return Response.json({ error: "persona không hợp lệ" }, { status: 400 });
  }
  const userInput = (input || "").slice(0, 1500).trim();
  if (!userInput) {
    return Response.json({ error: "thiếu input" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Fallback: bản mẫu + khối phân tích cá nhân hóa từ kết quả quét thật
    const text = fallbackIntro(context) + persona.agent.fallbackOutput;
    const encoder = new TextEncoder();
    const chunks = text.match(/[\s\S]{1,80}/g) ?? [text];
    const stream = new ReadableStream({
      async start(controller) {
        for (const chunk of chunks) {
          controller.enqueue(encoder.encode(chunk));
          await new Promise((r) => setTimeout(r, 24));
        }
        controller.close();
      },
    });
    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const client = new Anthropic({ apiKey });

  const ctxBlock = buildContextBlock(context);
  const userMessage = ctxBlock
    ? `KẾT QUẢ QUÉT CỦA NGƯỜI DÙNG:\n${ctxBlock}\n\nNGƯỜI DÙNG NHẬP:\n${userInput}`
    : userInput;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const messageStream = client.messages.stream({
          model: "claude-opus-4-8",
          max_tokens: 8000,
          system: persona.agent.systemPrompt,
          messages: [{ role: "user", content: userMessage }],
        });
        for await (const event of messageStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        console.error("[agent] Claude API error:", err);
        // Lỗi API giữa chừng: chuyển sang fallback để không vỡ WOW moment
        controller.enqueue(
          encoder.encode("\n\n" + fallbackIntro(context) + persona.agent.fallbackOutput),
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
