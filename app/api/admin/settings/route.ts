import { isAuthed } from "@/lib/adminAuth";
import { getSettings, saveSettings, defaultSettings } from "@/lib/settings";
import { sanitizeColors } from "@/lib/colors";

export async function GET(req: Request) {
  if (!(await isAuthed(req))) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  return Response.json(await getSettings());
}

export async function POST(req: Request) {
  if (!(await isAuthed(req))) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "JSON không hợp lệ" }, { status: 400 });
  }

  // Merge với default để không bao giờ lưu thiếu trường
  const def = defaultSettings();
  const cur = await getSettings();
  const b = body as Partial<typeof def>;
  const next = {
    content: { ...cur.content, ...(b.content ?? {}) },
    personaHooks: { ...cur.personaHooks, ...(b.personaHooks ?? {}) },
    courseUrls: { ...cur.courseUrls, ...(b.courseUrls ?? {}) },
    hourlyRate:
      Number(b.hourlyRate) > 0 ? Number(b.hourlyRate) : cur.hourlyRate,
    pixels: { ...cur.pixels, ...(b.pixels ?? {}) },
    integrations: { ...cur.integrations, ...(b.integrations ?? {}) },
    colors: sanitizeColors(b.colors ?? {}, cur.colors),
  };
  await saveSettings(next);
  return Response.json({ ok: true, settings: next });
}
