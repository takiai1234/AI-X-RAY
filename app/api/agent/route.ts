import Anthropic from "@anthropic-ai/sdk";
import { PERSONAS } from "@/lib/personas";

export const maxDuration = 60;

// AI Agent Demo (WOW moment). Stream text về client.
// Không có ANTHROPIC_API_KEY thì trả fallback output để phễu vẫn chạy đủ.
export async function POST(req: Request) {
  const { personaId, input } = (await req.json()) as {
    personaId: string;
    input: string;
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
    // Fallback: giả lập streaming để giữ trải nghiệm 20-60 giây tạo kết quả
    const text = persona.agent.fallbackOutput;
    const encoder = new TextEncoder();
    const chunks = text.match(/[\s\S]{1,60}/g) ?? [text];
    const stream = new ReadableStream({
      async start(controller) {
        for (const chunk of chunks) {
          controller.enqueue(encoder.encode(chunk));
          await new Promise((r) => setTimeout(r, 35));
        }
        controller.close();
      },
    });
    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const client = new Anthropic({ apiKey });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const messageStream = client.messages.stream({
          model: "claude-opus-4-8",
          max_tokens: 4096,
          system: persona.agent.systemPrompt,
          messages: [{ role: "user", content: userInput }],
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
        controller.enqueue(encoder.encode("\n\n" + persona.agent.fallbackOutput));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
