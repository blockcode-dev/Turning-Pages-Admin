import { useState, useRef, useEffect, useCallback } from "react";
import "./PdfViewer.scss";

// ─── All supported page sizes (at 96 dpi) ────────────────────────────────────
export const PAGE_SIZES = {
  A3:          { label: "A3",           w: 1123, h: 1587, desc: "297 × 420 mm",   icon: "tall" },
  A4:          { label: "A4",           w: 794,  h: 1123, desc: "210 × 297 mm",   icon: "tall" },
  A5:          { label: "A5",           w: 559,  h: 794,  desc: "148 × 210 mm",   icon: "tall" },
  LETTER:      { label: "Letter",       w: 816,  h: 1056, desc: "8.5 × 11 in",    icon: "tall" },
  LEGAL:       { label: "Legal",        w: 816,  h: 1344, desc: "8.5 × 14 in",    icon: "tall" },
  B5:          { label: "B5",           w: 665,  h: 945,  desc: "176 × 250 mm",   icon: "tall" },
  HALFLETTER:  { label: "Half Letter",  w: 528,  h: 816,  desc: "5.5 × 8.5 in",   icon: "tall" },
  TRADE:       { label: "Trade Book",   w: 576,  h: 864,  desc: "6 × 9 in",       icon: "tall" },
  POCKET:      { label: "Pocket Book",  w: 432,  h: 648,  desc: "4.5 × 6.75 in",  icon: "tall" },
  SQUARE:      { label: "Square",       w: 756,  h: 756,  desc: "7.87 × 7.87 in", icon: "square" },
};

const PAD_RATIO_X   = 0.091;  // ~72px on A4
const PAD_RATIO_TOP = 0.053;
const PAD_RATIO_BOT = 0.043;

function getLayout(sizeKey) {
  const s = PAGE_SIZES[sizeKey];
  const padX   = Math.round(s.w * PAD_RATIO_X);
  const padTop = Math.round(s.h * PAD_RATIO_TOP);
  const padBot = Math.round(s.h * PAD_RATIO_BOT);
  return {
    ...s,
    padX, padTop, padBot,
    contentW: s.w - padX * 2,
    contentH: s.h - padTop - padBot,
    fontSize: Math.max(10, Math.round(s.w * 0.017)),   // scale font to page width
  };
}

// ─── Measure rendered height of HTML at a given width ────────────────────────
function measureHeight(html, width, fontSize) {
  const probe = document.createElement("div");
  probe.style.cssText = `
    position:fixed; top:-99999px; left:0;
    width:${width}px; font-size:${fontSize}px;
    line-height:1.8; visibility:hidden;
    pointer-events:none; word-break:break-word;
    overflow-wrap:break-word; padding:0; margin:0;
  `;
  probe.innerHTML = html;
  document.body.appendChild(probe);
  const h = probe.getBoundingClientRect().height;
  document.body.removeChild(probe);
  return h;
}

// ─── Split a single oversized element by binary-search on words ───────────────
function splitLargeElement(outerHTML, tag, attrs, layout) {
  const tmp   = document.createElement("div");
  tmp.innerHTML = outerHTML;
  const text  = tmp.innerText || tmp.textContent || "";
  const words = text.split(/\s+/).filter(Boolean);
  if (!words.length) return [];

  const chunks = [];
  let   i      = 0;
  while (i < words.length) {
    let lo = 1, hi = words.length - i, best = 1;
    while (lo <= hi) {
      const mid  = Math.floor((lo + hi) / 2);
      const test = words.slice(i, i + mid).join(" ");
      const h    = measureHeight(`<${tag}${attrs}>${test}</${tag}>`, layout.contentW, layout.fontSize);
      if (h <= layout.contentH) { best = mid; lo = mid + 1; }
      else                       { hi  = mid - 1; }
    }
    chunks.push(`<${tag}${attrs}>${words.slice(i, i + best).join(" ")}</${tag}>`);
    i += best;
  }
  return chunks;
}

// ─── Main paginator ───────────────────────────────────────────────────────────
function paginateHTML(rawHTML, layout) {
  const container = document.createElement("div");
  container.innerHTML = rawHTML;
  let children = Array.from(container.children);

  // Handle single giant block — split by sentences
  if (children.length <= 1) {
    const src  = children.length === 1 ? children[0] : container;
    const tag  = (src.tagName || "div").toLowerCase();
    if (/^(p|div|section|article)$/.test(tag)) {
      const text = src.innerText || src.textContent || "";
      const sents = text
        .replace(/([.!?])\s+([A-Z"'])/g, "$1\n\n$2")
        .split(/\n\n+/)
        .map(s => s.trim())
        .filter(Boolean);
      if (sents.length > 1) {
        container.innerHTML = sents.map(s => `<p>${s}</p>`).join("");
        children = Array.from(container.children);
      }
    }
  }

  const pages = [];
  let   page  = [];
  let   pageH = 0;

  children.forEach(el => {
    const elHTML = el.outerHTML;
    const tag    = el.tagName.toLowerCase();
    const attrs  = el.getAttributeNames().map(a => ` ${a}="${el.getAttribute(a)}"`).join("");
    const h      = measureHeight(elHTML, layout.contentW, layout.fontSize);

    if (h <= 0) return;

    if (h > layout.contentH) {
      if (page.length) { pages.push(page.join("")); page = []; pageH = 0; }
      splitLargeElement(elHTML, tag || "p", attrs, layout).forEach(c => pages.push(c));
      return;
    }

    if (pageH + h > layout.contentH && page.length > 0) {
      pages.push(page.join(""));
      page  = [];
      pageH = 0;
    }

    page.push(elHTML);
    pageH += h;
  });

  if (page.length) pages.push(page.join(""));
  return pages.length ? pages : [rawHTML];
}

// ─── Size Selector Modal ──────────────────────────────────────────────────────
function SizeSelector({ current, onSelect, onClose }) {
  const sizes = Object.entries(PAGE_SIZES);
  // Group: Standard / Book
  const standard = ["A3","A4","A5","LETTER","LEGAL"];
  const books    = ["B5","HALFLETTER","TRADE","POCKET","SQUARE"];

  const Card = ({ sizeKey }) => {
    const s       = PAGE_SIZES[sizeKey];
    const active  = sizeKey === current;
    const ratio   = s.h / s.w;
    const cardW   = 70;
    const cardH   = Math.min(Math.round(cardW * ratio), 100);

    return (
      <button
        className={`sz-card${active ? " sz-card--on" : ""}`}
        onClick={() => { onSelect(sizeKey); onClose(); }}
        title={`${s.label} — ${s.desc}`}
      >
        <div className="sz-card__paper" style={{ width: cardW, height: cardH }}>
          <div className="sz-card__lines">
            {[...Array(5)].map((_, i) => <span key={i} />)}
          </div>
        </div>
        <span className="sz-card__label">{s.label}</span>
        <span className="sz-card__desc">{s.desc}</span>
        {active && <span className="sz-card__check">✓</span>}
      </button>
    );
  };

  return (
    <div className="sz-overlay" onClick={onClose}>
      <div className="sz-modal" onClick={e => e.stopPropagation()}>
        <div className="sz-modal__head">
          <span>Page Size</span>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="sz-modal__group">
          <p className="sz-modal__group-label">Standard</p>
          <div className="sz-modal__grid">
            {standard.map(k => <Card key={k} sizeKey={k} />)}
          </div>
        </div>

        <div className="sz-modal__group">
          <p className="sz-modal__group-label">Books &amp; Special</p>
          <div className="sz-modal__grid">
            {books.map(k => <Card key={k} sizeKey={k} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PdfViewer({ htmlContent = "", title = "Document", onClose }) {
  const [sizeKey,  setSizeKey]  = useState("A4");
  const [pages,    setPages]    = useState([]);
  const [zoom,     setZoom]     = useState(1.0);
  const [status,   setStatus]   = useState("idle");
  const [showSize, setShowSize] = useState(false);
  const pageRefs = useRef([]);

  const layout = getLayout(sizeKey);

  // ── Re-paginate when content OR size changes ──────────────────────────
  useEffect(() => {
    if (!htmlContent?.trim()) { setStatus("empty"); return; }

    setStatus("rendering");
    setPages([]);

    const id = setTimeout(() => {
      try {
        const built = paginateHTML(htmlContent, layout);
        setPages(built);
        setStatus("ready");
      } catch (err) {
        console.error(err);
        setPages([htmlContent]);
        setStatus("ready");
      }
    }, 100);

    return () => clearTimeout(id);
  }, [htmlContent, sizeKey]);

  const scrollTo  = i => pageRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "start" });
  const zoomIn    = () => setZoom(z => Math.min(1.5, +(z + 0.1).toFixed(1)));
  const zoomOut   = () => setZoom(z => Math.max(0.3, +(z - 0.1).toFixed(1)));
  const zoomReset = () => setZoom(1.0);
  const total     = pages.length;
  const sz        = PAGE_SIZES[sizeKey];

  return (
    <div className="pdv">

      {/* ── Size selector modal ─────────────────────────────────────── */}
      {showSize && (
        <SizeSelector
          current={sizeKey}
          onSelect={setSizeKey}
          onClose={() => setShowSize(false)}
        />
      )}

      {/* ══ HEADER ════════════════════════════════════════════════════ */}
      <header className="pdv__header">
        <div className="pdv__hl">
          {onClose && (
            <button className="pdv__back" onClick={onClose}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Edit
            </button>
          )}
          <div className="pdv__hdiv" />
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            style={{ color: "rgba(255,255,255,.4)", flexShrink: 0 }}>
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M14 2v6h6M9 13h6M9 17h4" stroke="currentColor"
              strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span className="pdv__doc-name">{title}</span>
        </div>

        <div className="pdv__hc">
          {status === "ready" && (
            <span className="pdv__badge">{total} {total === 1 ? "page" : "pages"}</span>
          )}
        </div>

        <div className="pdv__hr">
          {/* ── Size picker button ──── */}
          <button className="pdv__size-btn" onClick={() => setShowSize(true)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2"
                stroke="currentColor" strokeWidth="1.5"/>
              <path d="M3 9h18M9 3v18" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            {sz.label}
            <span className="pdv__size-desc">{sz.desc}</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" style={{ opacity:.6 }}>
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <div className="pdv__hdiv" />

          {/* <button className="pdv__print-btn" onClick={() => window.print()}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <rect x="6" y="14" width="12" height="8" rx="1"
                stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            Print
          </button> */}
        </div>
      </header>

      {/* ══ TOOLBAR ═══════════════════════════════════════════════════ */}
      {status === "ready" && (
        <div className="pdv__toolbar">
          <div className="pdv__jumps">
            {pages.map((_, i) => (
              <button key={i} className="pdv__jump" onClick={() => scrollTo(i)}>{i + 1}</button>
            ))}
          </div>
          <div className="pdv__tb-sep" />
          <div className="pdv__zoom-row">
            <button className="pdv__tb-btn" onClick={zoomOut} disabled={zoom <= 0.3}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="M21 21l-4.35-4.35M8 11h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            <button className="pdv__zoom-val" onClick={zoomReset}>{Math.round(zoom * 100)}%</button>
            <button className="pdv__tb-btn" onClick={zoomIn} disabled={zoom >= 1.5}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="M21 21l-4.35-4.35M11 8v6M8 11h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ══ CANVAS ════════════════════════════════════════════════════ */}
      <main className="pdv__canvas">

        {status === "rendering" && (
          <div className="pdv__loading">
            <div className="pdv__spinner"><span/><span/><span/></div>
            <p>Laying out {sz.label} pages…</p>
          </div>
        )}

        {status === "empty" && (
          <div className="pdv__empty">
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
                stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
              <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
            </svg>
            <p>Nothing to preview yet.</p>
          </div>
        )}

        {status === "ready" && (
          <div
            className="pdv__stack"
            style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
          >
            {pages.map((html, i) => (
              <div
                key={`${sizeKey}-${i}`}
                className="pdv__page-wrap"
                ref={el => (pageRefs.current[i] = el)}
              >
                <div className="pdv__shadow" />

                <div
                  className="pdv__page"
                  style={{ width: layout.w, minHeight: layout.h }}
                >
                  {/* Running head */}
                  <div className="pdv__rhead" style={{ padding: `${layout.padTop * 0.4}px ${layout.padX}px 0` }}>
                    <span className="pdv__rhead-label">{title.toUpperCase()}</span>
                    <span className="pdv__rhead-rule" />
                    <span className="pdv__rhead-size">{sz.label}</span>
                  </div>

                  {/* Body */}
                  <div
                    className="pdv__body"
                    style={{
                      padding:   `${layout.padTop * 0.55}px ${layout.padX}px 0`,
                      height:    layout.contentH,
                      overflow:  "hidden",
                      fontSize:  layout.fontSize,
                    }}
                    dangerouslySetInnerHTML={{ __html: html }}
                  />

                  {/* Folio */}
                  <div className="pdv__folio" style={{ padding: `8px ${layout.padX}px 16px` }}>
                    <span className="pdv__folio-rule" />
                    <span className="pdv__folio-num">{i + 1}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}