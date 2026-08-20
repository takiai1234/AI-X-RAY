"use client";

import { useEffect, useRef } from "react";

// Chèn HTML tùy chỉnh (GTM, pixel khác...) sao cho <script> bên trong THỰC SỰ chạy.
// React không chạy script trong dangerouslySetInnerHTML nên phải dùng contextual fragment.
export default function CustomHtml({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const injected = useRef(false);

  useEffect(() => {
    if (!ref.current || injected.current || !html.trim()) return;
    injected.current = true;
    try {
      const range = document.createRange();
      range.selectNode(ref.current);
      ref.current.appendChild(range.createContextualFragment(html));
    } catch (e) {
      console.error("[custom-html] không chèn được:", e);
    }
  }, [html]);

  return <div ref={ref} style={{ display: "none" }} data-custom-embed />;
}
