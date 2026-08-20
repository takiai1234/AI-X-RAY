import { promises as fs } from "fs";
import path from "path";

// Trả về báo cáo theo session_id để xem lại tại /r/<id> (F-02).
// Chỉ trả answers + tên (không lộ SĐT/email).
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id || !/^[\w-]{4,64}$/.test(id)) {
    return Response.json({ error: "id không hợp lệ" }, { status: 400 });
  }

  const dir = path.join(process.cwd(), "data", "leads");
  let files: string[] = [];
  try {
    files = (await fs.readdir(dir)).filter((f) => f.endsWith(".jsonl")).sort();
  } catch {
    return Response.json({ error: "không có dữ liệu" }, { status: 404 });
  }

  let found: Record<string, unknown> | null = null;
  for (const f of files.reverse()) {
    const raw = await fs.readFile(path.join(dir, f), "utf8").catch(() => "");
    for (const line of raw.split("\n").reverse()) {
      if (!line.trim()) continue;
      try {
        const r = JSON.parse(line);
        if (r.session_id === id) {
          found = r;
          break;
        }
      } catch {
        /* skip */
      }
    }
    if (found) break;
  }

  if (!found) {
    return Response.json({ error: "không tìm thấy báo cáo" }, { status: 404 });
  }

  return Response.json({
    name: (found.lead as { name?: string })?.name ?? "",
    answers: found.answers,
  });
}
