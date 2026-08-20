import { isAuthed } from "@/lib/adminAuth";
import {
  saveOgImage,
  deleteOgImage,
  getOgImageMeta,
  OG_ALLOWED_TYPES,
} from "@/lib/ogImage";

const MAX_SIZE = 3 * 1024 * 1024; // 3MB

export async function GET(req: Request) {
  if (!(await isAuthed(req))) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  return Response.json({ meta: await getOgImageMeta() });
}

// Upload ảnh share (multipart form-data, field "file")
export async function POST(req: Request) {
  if (!(await isAuthed(req))) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ error: "Form không hợp lệ" }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "Thiếu file ảnh" }, { status: 400 });
  }
  if (!OG_ALLOWED_TYPES[file.type]) {
    return Response.json(
      { error: "Chỉ nhận PNG, JPG hoặc WebP" },
      { status: 400 },
    );
  }
  if (file.size > MAX_SIZE) {
    return Response.json({ error: "Ảnh tối đa 3MB" }, { status: 400 });
  }
  const buf = Buffer.from(await file.arrayBuffer());
  const meta = await saveOgImage(buf, file.type);
  return Response.json({ ok: true, meta });
}

export async function DELETE(req: Request) {
  if (!(await isAuthed(req))) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  await deleteOgImage();
  return Response.json({ ok: true });
}
