import { useState, useRef, useEffect, useCallback } from "react";
import "./PdfViewer.scss";

// ─── A4 page dimensions at 96dpi ───────────────────────────────────────────
const A4_WIDTH_PX  = 794;   // 210mm @ 96dpi
const A4_HEIGHT_PX = 1123;  // 297mm @ 96dpi
const PAGE_PADDING = 72;    // ~19mm margins

/**
 * PdfViewer
 *
 * Props:
 *  - htmlContent  {string}  Raw HTML string from CKEditor  (required)
 *  - title        {string}  Document title shown in header
 *  - onClose      {func}    Called when user clicks back / Edit button
 */
const PdfViewer = ({ htmlContent, title = "Document", onClose }) => {
  const [pages, setPages]             = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale]             = useState(1.0);
  const [isRendering, setIsRendering] = useState(true);
  const containerRef = useRef(null);

  // ── Paginate HTML into A4-height chunks ────────────────────────────────
  const paginateContent = useCallback(() => {
    if (!htmlContent) { setIsRendering(false); return; }
    setIsRendering(true);

    const contentWidth = A4_WIDTH_PX - PAGE_PADDING * 2;
    const pageHeight   = A4_HEIGHT_PX - PAGE_PADDING * 2 - 48; // reserve footer

    // Off-screen sandbox at exact content width
    const sandbox = document.createElement("div");
    sandbox.style.cssText = `
      position: fixed;
      top: -99999px; left: -99999px;
      width: ${contentWidth}px;
      font-family: 'Lora', Georgia, serif;
      font-size: 13.5px;
      line-height: 1.85;
      color: #1a1a1a;
      word-break: break-word;
      visibility: hidden;
      pointer-events: none;
    `;
    document.body.appendChild(sandbox);

    // Clean raw markdown-style headings CKEditor can spit out
    const cleaned = htmlContent
      .replace(/^#+\s*/gm, "")
      .replace(/<p>\s*#+\s*/g, "<p>")
      .trim();

    const isHtml = /<[a-z][\s\S]*>/i.test(cleaned);
    const fullHtml = isHtml
      ? cleaned
      : cleaned
          .split(/\n{2,}/)
          .map(p => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
          .join("");

    sandbox.innerHTML = fullHtml;

    const children = Array.from(sandbox.children);
    const chunks   = [];
    let   chunk    = [];
    let   used     = 0;

    children.forEach(el => {
      const h = el.getBoundingClientRect().height || 24;
      if (used + h > pageHeight && chunk.length > 0) {
        chunks.push(chunk.map(n => n.outerHTML).join(""));
        chunk = [];
        used  = 0;
      }
      chunk.push(el);
      used += h + 10;
    });

    if (chunk.length) chunks.push(chunk.map(n => n.outerHTML).join(""));
    document.body.removeChild(sandbox);

    setPages(chunks.length ? chunks : [fullHtml]);
    setCurrentPage(1);
    setIsRendering(false);
  }, [htmlContent]);

  useEffect(() => { paginateContent(); }, [paginateContent]);

  // ── Keyboard nav ───────────────────────────────────────────────────────
  useEffect(() => {
    const h = e => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown")
        setCurrentPage(p => Math.min(pages.length, p + 1));
      if (e.key === "ArrowLeft" || e.key === "ArrowUp")
        setCurrentPage(p => Math.max(1, p - 1));
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [pages.length]);

  const goToPrev      = () => setCurrentPage(p => Math.max(1, p - 1));
  const goToNext      = () => setCurrentPage(p => Math.min(pages.length, p + 1));
  const zoomIn        = () => setScale(s => Math.min(2.0, +(s + 0.25).toFixed(2)));
  const zoomOut       = () => setScale(s => Math.max(0.5, +(s - 0.25).toFixed(2)));
  const resetZoom     = () => setScale(1.0);
  const handlePageInput = e => {
    const v = parseInt(e.target.value);
    if (!isNaN(v) && v >= 1 && v <= pages.length) setCurrentPage(v);
  };

  const total = pages.length;

  return (
    <div className="pdv">

      {/* ══ HEADER ══════════════════════════════════════════════════════ */}
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
          <div className="pdv__header-divider"/>
          <div className="pdv__doc-chip">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 2v6h6M9 13h6M9 17h4" stroke="currentColor"
                strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span>{title}</span>
          </div>
        </div>

        <div className="pdv__hc">
          {!isRendering && total > 0 && (
            <span className="pdv__badge">{total} {total === 1 ? "page" : "pages"}</span>
          )}
        </div>

        <div className="pdv__hr">
          <button className="pdv__action" onClick={() => window.print()}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="6" y="14" width="12" height="8" rx="1"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Print
          </button>
        </div>
      </header>

      {/* ══ TOOLBAR ═════════════════════════════════════════════════════ */}
      {!isRendering && total > 0 && (
        <div className="pdv__toolbar">

          {/* Navigation */}
          <div className="pdv__nav">
            <button className="pdv__tb-btn" onClick={goToPrev}
              disabled={currentPage <= 1} aria-label="Prev">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <div className="pdv__pager">
              <input
                type="number" className="pdv__pg-input"
                value={currentPage} min={1} max={total}
                onChange={handlePageInput}
              />
              <span className="pdv__pg-of">/ {total}</span>
            </div>

            <button className="pdv__tb-btn" onClick={goToNext}
              disabled={currentPage >= total} aria-label="Next">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          <div className="pdv__tb-sep"/>

          {/* Zoom */}
          <div className="pdv__zoom">
            <button className="pdv__tb-btn" onClick={zoomOut} disabled={scale <= 0.5}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="M21 21l-4.35-4.35M8 11h6" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            <button className="pdv__zoom-pct" onClick={resetZoom}>
              {Math.round(scale * 100)}%
            </button>
            <button className="pdv__tb-btn" onClick={zoomIn} disabled={scale >= 2.0}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="M21 21l-4.35-4.35M11 8v6M8 11h6" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          <div className="pdv__tb-sep"/>

          {/* Page dots */}
          <div className="pdv__dots">
            {pages.map((_, i) => (
              <button
                key={i}
                className={`pdv__dot ${i + 1 === currentPage ? "pdv__dot--on" : ""}`}
                onClick={() => setCurrentPage(i + 1)}
                title={`Page ${i + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* ══ CANVAS ══════════════════════════════════════════════════════ */}
      <main className="pdv__canvas" ref={containerRef}>

        {isRendering && (
          <div className="pdv__loading">
            <div className="pdv__spin-pages">
              <div className="pdv__sp pdv__sp--1"/>
              <div className="pdv__sp pdv__sp--2"/>
              <div className="pdv__sp pdv__sp--3"/>
            </div>
            <p>Rendering document…</p>
          </div>
        )}

        {!isRendering && total === 0 && (
          <div className="pdv__empty">
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
                stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
            </svg>
            <p>Nothing to preview yet.<br/>Go back and add some content.</p>
          </div>
        )}

        {!isRendering && total > 0 && (
          <div
            className="pdv__scale-wrap"
            style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}
          >
            {/* Drop shadow layers for paper depth */}
            <div className="pdv__paper-shadow pdv__paper-shadow--3"/>
            <div className="pdv__paper-shadow pdv__paper-shadow--2"/>
            <div className="pdv__paper-shadow pdv__paper-shadow--1"/>

            {/* The A4 page */}
            <article
              className="pdv__page"
              style={{ width: A4_WIDTH_PX, minHeight: A4_HEIGHT_PX, padding: PAGE_PADDING }}
            >
              {/* Running head */}
              <div className="pdv__running-head">
                <span className="pdv__running-title">{title.toUpperCase()}</span>
                <span className="pdv__running-line"/>
              </div>

              {/* Body content */}
              <div
                className="pdv__body"
                dangerouslySetInnerHTML={{ __html: pages[currentPage - 1] || "" }}
              />

              {/* Folio */}
              <div className="pdv__folio">
                <span className="pdv__folio-rule"/>
                <span className="pdv__folio-num">{currentPage}</span>
              </div>
            </article>
          </div>
        )}
      </main>

      {/* ══ PROGRESS ════════════════════════════════════════════════════ */}
      {total > 0 && !isRendering && (
        <div className="pdv__progress">
          <div
            className="pdv__progress-fill"
            style={{ width: `${(currentPage / total) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default PdfViewer;

/*
════════════════════════════════════════════════════════════════
  INTEGRATION — paste into your existing editor component
════════════════════════════════════════════════════════════════

  import { useState } from 'react';
  import { CKEditor } from '@ckeditor/ckeditor5-react';
  import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
  import PdfViewer from './PdfViewer';
  import './PdfViewer.scss';

  export default function App() {
    const [html, setHtml]   = useState('');
    const [mode, setMode]   = useState('edit'); // 'edit' | 'preview'

    return (
      <div className="app">
        <nav className="app-nav">
          <h1>THE VANISHING GLASS</h1>

          <div className="nav-actions">
            {mode === 'edit' ? (
              <button onClick={() => setMode('preview')}>
                👁  Preview
              </button>
            ) : (
              <button onClick={() => setMode('edit')}>
                ✏️  Edit
              </button>
            )}
          </div>
        </nav>

        {mode === 'edit' ? (
          <CKEditor
            editor={ClassicEditor}
            data={html}
            onChange={(_, editor) => setHtml(editor.getData())}
          />
        ) : (
          <PdfViewer
            htmlContent={html}
            title="THE VANISHING GLASS"
            onClose={() => setMode('edit')}
          />
        )}
      </div>
    );
  }

════════════════════════════════════════════════════════════════
*/