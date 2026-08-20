import Anthropic from "@anthropic-ai/sdk";
import { PERSONAS } from "@/lib/personas";
import { AI_LEVELS } from "@/lib/scoring";

export const maxDuration = 120;

// Thứ tự backend cho Agent Demo:
// 1. 9router (LLM_BASE_URL, OpenAI-compatible, chạy local trên VPS) — ưu tiên
// 2. Claude API chính thức (ANTHROPIC_API_KEY)
// 3. Bản mẫu cá nhân hóa (fallback, không bao giờ vỡ trải nghiệm)

interface AgentContext {
  score?: number;
  level?: number;
  levelName?: string;
  topTaskLabels?: string[];
  painPoint?: string;
  scale?: string;
  hoursPerWeek?: number;
}

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

function streamText(text: string): Response {
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

// Gọi 9router (OpenAI-compatible SSE) và stream text thuần về client
async function callNineRouter(
  baseUrl: string,
  model: string,
  systemPrompt: string,
  userMessage: string,
  fallbackText: string,
): Promise<Response> {
  const encoder = new TextEncoder();
  const upstream = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.LLM_API_KEY
        ? { Authorization: `Bearer ${process.env.LLM_API_KEY}` }
        : {}),
    },
    body: JSON.stringify({
      model,
      stream: true,
      max_tokens: 8000,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    }),
    signal: AbortSignal.timeout(110000),
  });

  if (!upstream.ok || !upstream.body) {
    throw new Error(`9router trả về ${upstream.status}`);
  }

  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();

  const stream = new ReadableStream({
    async start(controller) {
      let buffer = "";
      let sentAny = false;

      // Lọc bỏ khối <think>...</think> mà một số model đẩy ra đầu stream.
      // Giữ lại đuôi ngắn trong pending để không cắt đôi thẻ giữa 2 chunk.
      let pending = "";
      let inThink = false;
      const emitFiltered = (text: string, flush = false) => {
        pending += text;
        let out = "";
        for (;;) {
          if (inThink) {
            const close = pending.indexOf("</think>");
            if (close === -1) {
              pending = pending.slice(-8); // giữ đuôi phòng thẻ bị cắt đôi
              break;
            }
            pending = pending.slice(close + 8);
            inThink = false;
          } else {
            const open = pending.indexOf("<think>");
            if (open === -1) {
              const keep = flush ? 0 : 7;
              out += pending.slice(0, pending.length - keep || undefined);
              pending = keep ? pending.slice(-keep) : "";
              if (flush && pending) {
                out += pending;
                pending = "";
              }
              break;
            }
            out += pending.slice(0, open);
            pending = pending.slice(open + 7);
            inThink = true;
          }
        }
        // Bỏ khoảng trắng thừa ở đầu output (sau khi cắt think block)
        if (!sentAny) out = out.replace(/^\s+/, "");
        if (out) {
          sentAny = true;
          controller.enqueue(encoder.encode(out));
        }
      };

      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const payload = trimmed.slice(5).trim();
            if (payload === "[DONE]") continue;
            try {
              const json = JSON.parse(payload);
              const delta: string | undefined =
                json.choices?.[0]?.delta?.content;
              if (delta) emitFiltered(delta);
            } catch {
              /* bỏ chunk hỏng */
            }
          }
        }
        emitFiltered("", true); // xả phần còn giữ lại
        if (!sentAny) {
          controller.enqueue(encoder.encode(fallbackText));
        }
        controller.close();
      } catch (err) {
        console.error("[agent] 9router stream lỗi:", err);
        if (!sentAny) controller.enqueue(encoder.encode(fallbackText));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
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

  const ctxBlock = buildContextBlock(context);
  const userMessage = ctxBlock
    ? `KẾT QUẢ QUÉT CỦA NGƯỜI DÙNG:\n${ctxBlock}\n\nNGƯỜI DÙNG NHẬP:\n${userInput}`
    : userInput;
  const fallbackText = fallbackIntro(context) + persona.agent.fallbackOutput;

  // 1) 9router
  const nineRouterUrl = process.env.LLM_BASE_URL;
  if (nineRouterUrl) {
    const model = process.env.LLM_MODEL || "cc/claude-sonnet-5";
    try {
      return await callNineRouter(
        nineRouterUrl,
        model,
        persona.agent.systemPrompt,
        userMessage,
        fallbackText,
      );
    } catch (err) {
      console.error("[agent] 9router lỗi, thử backend tiếp theo:", err);
    }
  }

  // 2) Claude API chính thức
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey) {
    const client = new Anthropic({ apiKey });
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
          controller.enqueue(encoder.encode("\n\n" + fallbackText));
          controller.close();
        }
      },
    });
    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  // 3) Bản mẫu cá nhân hóa
  return streamText(fallbackText);
}
