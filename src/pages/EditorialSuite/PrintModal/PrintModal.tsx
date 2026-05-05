/** @format */

import React, { useRef, useState, useEffect, useCallback } from "react";
import {
	Send,
	Image as ImageIcon,
	Download,
	X,
	MessageCircle,
	Check,
} from "lucide-react";
import "./PrintModal.scss";
import { useNavigate } from "react-router-dom";

/* ================= TYPES ================= */

type PageSizeKey =
	| "A3"
	| "A4"
	| "A5"
	| "LETTER"
	| "LEGAL"
	| "B5"
	| "HALFLETTER";

interface Chapter {
	title?: string;
	content?: string;
}

interface BookDetails {
	cover_img_name?: string;
	author?: string;
	book_chapters?: Chapter[];
	book_chat_room?: { id: number };
}

interface BookHeaderProps {
	title?: string;
	onEditCover?: () => void;
	bookIdDetails?: BookDetails;
	onSubmit?: (type: string) => void;
}

/* ================= PAGE SIZES ================= */

const PAGE_SIZES: Record<PageSizeKey, any> = {
	A3: { label: "A3", w: 1123, h: 1587 },
	A4: { label: "A4", w: 794, h: 1123 },
	A5: { label: "A5", w: 559, h: 794 },
	LETTER: { label: "Letter", w: 816, h: 1056 },
	LEGAL: { label: "Legal", w: 816, h: 1344 },
	B5: { label: "B5", w: 665, h: 945 },
	HALFLETTER: { label: "Half Letter", w: 528, h: 816 },
};

/* ================= PRINT MODAL ================= */

interface PrintModalProps {
	bookIdDetails?: BookDetails;
	title?: string;
	sizeKey: PageSizeKey;
	onClose: () => void;
}

const PrintModal: React.FC<PrintModalProps> = ({
	bookIdDetails,
	title,
	sizeKey,
	onClose,
}) => {
	const printRef = useRef<HTMLDivElement | null>(null);
	const [pages, setPages] = useState<any[]>([]);

	useEffect(() => {
		const chapters = bookIdDetails?.book_chapters || [];

		const builtPages = [
			{ type: "cover" },
			...chapters.map((ch, i) => ({
				type: "chapter",
				html: `
          <h2>Chapter ${i + 1} – ${ch.title || ""}</h2>
          ${ch.content || "<p></p>"}
        `,
			})),
		];

		setPages(builtPages);
	}, [bookIdDetails]);

	const handlePrint = useCallback(() => {
		if (!printRef.current) return;

		const win = window.open("", "_blank");
		if (!win) return;
		const size = PAGE_SIZES[sizeKey];
		win.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body {
              font-family: Georgia, serif;
              margin: 0;
            }
           .page {
    width: ${size.w}px;
    min-height: ${size.h}px;
    padding: 72px;
    box-sizing: border-box;
    page-break-after: always;
  }
            h1, h2 {
              text-align: center;
            }
            p {
              line-height: 1.8;
            }
          </style>
        </head>
        <body>
          ${printRef.current.innerHTML}
        </body>
      </html>
    `);

		win.document.close();
		win.print();
	}, [title]);

	return (
		<div className="bh-print-overlay" onClick={onClose}>
			<div className="bh-print-modal" onClick={(e) => e.stopPropagation()}>
				<div className="bh-print-modal__head">
					<span>Download PDF — {sizeKey}</span>
					<button onClick={onClose}>
						<X size={16} />
					</button>
				</div>

				<button className="bh-print-modal__print-btn" onClick={handlePrint}>
					Print / Save PDF
				</button>

				<div ref={printRef}>
					{pages.map((pg, i) =>
						pg.type === "cover" ? (
							<div key={i} className="page">
								<h1>{title}</h1>
								<p>{bookIdDetails?.author}</p>
							</div>
						) : (
							<div key={i} className="page">
								<div dangerouslySetInnerHTML={{ __html: pg.html }} />
							</div>
						),
					)}
				</div>
			</div>
		</div>
	);
};

/* ================= MAIN ================= */

const BookHeader: React.FC<BookHeaderProps> = ({
	title,
	onEditCover,
	bookIdDetails,
	onSubmit,
}) => {
	console.log(title, onEditCover, bookIdDetails, onSubmit);
	const [sizeKey, setSizeKey] = useState<PageSizeKey>("A4");
	const [showPrint, setShowPrint] = useState(false);
	const [showSizeSelector, setShowSizeSelector] = useState(true);

	const navigate = useNavigate();

	return (
		<>
			<header className="book-header">
				<h3>{title}</h3>

				<div className="actions">
					<button onClick={onEditCover}>
						<ImageIcon size={16} /> Edit Cover
					</button>

					<button onClick={() => onSubmit?.("submit")}>
						<Send size={16} /> Submit
					</button>

					{bookIdDetails?.book_chat_room && (
						<button
							onClick={() =>
								navigate(`/dashboard/chat/${bookIdDetails.book_chat_room?.id}`)
							}
						>
							<MessageCircle size={16} /> Chat
						</button>
					)}

					{/* DOWNLOAD PDF BUTTON */}
					<div className="bh-pdf-group">
						<button
							className="action-btn download-pdf bh-pdf-main"
							onClick={() => {
								if (!sizeKey) {
									setShowSizeSelector(true);
									return;
								}
								setShowPrint(true);
							}}
						>
							<Download size={16} />
							Download PDF
						</button>

						<button
							className="bh-pdf-size-toggle"
							onClick={() => setShowSizeSelector(!showSizeSelector)}
						>
							<span className="bh-pdf-size-label">{sizeKey}</span>
						</button>

						{/* SIZE DROPDOWN */}
						{showSizeSelector && (
							<div className="bh-size-dropdown">
								<div className="bh-size-dropdown__head">
									<span>Select Page Size</span>
									<button onClick={() => setShowSizeSelector(false)}>
										<X size={14} />
									</button>
								</div>

								<div className="bh-size-dropdown__grid">
									{Object.entries(PAGE_SIZES).map(([key, val]) => (
										<div
											key={key}
											className={`bh-sz-card ${
												sizeKey === key ? "bh-sz-card--on" : ""
											}`}
											onClick={() => {
												setSizeKey(key as PageSizeKey);
												setShowSizeSelector(false);
											}}
										>
											<div className="bh-sz-card__paper" />
											<div className="bh-sz-card__label">{val.label}</div>
											{sizeKey === key && (
												<div className="bh-sz-card__check">
													<Check size={12} />
												</div>
											)}
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
			</header>

			{showPrint && (
				<PrintModal
					bookIdDetails={bookIdDetails}
					title={title}
					sizeKey={sizeKey}
					onClose={() => setShowPrint(false)}
				/>
			)}
		</>
	);
};

export default BookHeader;
