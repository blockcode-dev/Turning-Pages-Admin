/** @format */

import { useState, useRef, useEffect } from "react";
import "./PdfViewer.scss";

/* ─── TYPES ───────────────────────────────────────── */

type PageSizeKey =
  | "A3"
  | "A4"
  | "A5"
  | "LETTER"
  | "LEGAL"
  | "B5"
  | "HALFLETTER"
  | "TRADE"
  | "POCKET"
  | "SQUARE";

interface PageSize {
  label: string;
  w: number;
  h: number;
  desc: string;
  icon: string;
}

interface Layout extends PageSize {
  padX: number;
  padTop: number;
  padBot: number;
  contentW: number;
  contentH: number;
  fontSize: number;
}

interface PdfViewerProps {
  htmlContent?: string;
  title?: string;
  onClose?: () => void;
}

/* ─── PAGE SIZES ───────────────────────────────────── */

export const PAGE_SIZES: Record<PageSizeKey, PageSize> = {
  A3: { label: "A3", w: 1123, h: 1587, desc: "297 × 420 mm", icon: "tall" },
  A4: { label: "A4", w: 794, h: 1123, desc: "210 × 297 mm", icon: "tall" },
  A5: { label: "A5", w: 559, h: 794, desc: "148 × 210 mm", icon: "tall" },
  LETTER: { label: "Letter", w: 816, h: 1056, desc: "8.5 × 11 in", icon: "tall" },
  LEGAL: { label: "Legal", w: 816, h: 1344, desc: "8.5 × 14 in", icon: "tall" },
  B5: { label: "B5", w: 665, h: 945, desc: "176 × 250 mm", icon: "tall" },
  HALFLETTER: { label: "Half Letter", w: 528, h: 816, desc: "5.5 × 8.5 in", icon: "tall" },
  TRADE: { label: "Trade Book", w: 576, h: 864, desc: "6 × 9 in", icon: "tall" },
  POCKET: { label: "Pocket Book", w: 432, h: 648, desc: "4.5 × 6.75 in", icon: "tall" },
  SQUARE: { label: "Square", w: 756, h: 756, desc: "7.87 × 7.87 in", icon: "square" },
};

const PAD_RATIO_X = 0.091;
const PAD_RATIO_TOP = 0.053;
const PAD_RATIO_BOT = 0.043;

/* ─── HELPERS ─────────────────────────────────────── */

function getLayout(sizeKey: PageSizeKey): Layout {
  const s = PAGE_SIZES[sizeKey];

  const padX = Math.round(s.w * PAD_RATIO_X);
  const padTop = Math.round(s.h * PAD_RATIO_TOP);
  const padBot = Math.round(s.h * PAD_RATIO_BOT);

  return {
    ...s,
    padX,
    padTop,
    padBot,
    contentW: s.w - padX * 2,
    contentH: s.h - padTop - padBot,
    fontSize: Math.max(10, Math.round(s.w * 0.017)),
  };
}

function measureHeight(html: string, width: number, fontSize: number): number {
  const probe = document.createElement("div");

  probe.style.cssText = `
    position:fixed; top:-99999px; left:0;
    width:${width}px; font-size:${fontSize}px;
    line-height:1.8; visibility:hidden;
  `;

  probe.innerHTML = html;
  document.body.appendChild(probe);

  const h = probe.getBoundingClientRect().height;
  document.body.removeChild(probe);

  return h;
}

function paginateHTML(rawHTML: string, layout: Layout): string[] {
  const container = document.createElement("div");
  container.innerHTML = rawHTML;

  const children = Array.from(container.children);

  const pages: string[] = [];
  let page: string[] = [];
  let pageH = 0;

  children.forEach((el) => {
    const html = (el as HTMLElement).outerHTML;
    const h = measureHeight(html, layout.contentW, layout.fontSize);

    if (pageH + h > layout.contentH && page.length > 0) {
      pages.push(page.join(""));
      page = [];
      pageH = 0;
    }

    page.push(html);
    pageH += h;
  });

  if (page.length) pages.push(page.join(""));

  return pages.length ? pages : [rawHTML];
}

/* ─── COMPONENT ───────────────────────────────────── */

export default function PdfViewer({
  htmlContent = "",
  title = "Document",
  onClose,
}: PdfViewerProps) {
  const [sizeKey, setSizeKey] = useState<PageSizeKey>("A4");
  const [pages, setPages] = useState<string[]>([]);
  const [zoom, setZoom] = useState<number>(1);
  const [status, setStatus] = useState<"idle" | "rendering" | "ready" | "empty">("idle");

  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const layout = getLayout(sizeKey);

  useEffect(() => {
    if (!htmlContent?.trim()) {
      setStatus("empty");
      return;
    }

    setStatus("rendering");

    const id = setTimeout(() => {
      const built = paginateHTML(htmlContent, layout);
      setPages(built);
      setStatus("ready");
    }, 100);

    return () => clearTimeout(id);
  }, [htmlContent, sizeKey]);

  const scrollTo = (i: number) => {
    pageRefs.current[i]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="pdv">
      {/* HEADER */}
      <header className="pdv__header">
        {onClose && (
          <button className="pdv__back" onClick={onClose}>
            Edit
          </button>
        )}

        <span className="pdv__doc-name">{title}</span>

        {status === "ready" && (
          <span className="pdv__badge">
            {pages.length} {pages.length === 1 ? "page" : "pages"}
          </span>
        )}
      </header>

      {/* BODY */}
      <main className="pdv__canvas">
        {status === "rendering" && <p>Rendering preview...</p>}

        {status === "empty" && <p>No content</p>}

        {status === "ready" && (
          <div
            className="pdv__stack"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "top center",
            }}
          >
            {pages.map((html, i) => (
              <div
                key={i}
                ref={(el) => (pageRefs.current[i] = el)}
                className="pdv__page-wrap"
              >
                <div
                  className="pdv__page"
                  style={{
                    width: layout.w,
                    minHeight: layout.h,
                  }}
                >
                  <div
                    className="pdv__body"
                    style={{
                      padding: `${layout.padTop}px ${layout.padX}px`,
                      fontSize: layout.fontSize,
                    }}
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}