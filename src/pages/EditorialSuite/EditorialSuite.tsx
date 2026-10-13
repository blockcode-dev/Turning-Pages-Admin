/** @format */

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import "./EditorialSuite.scss";
import { Editor } from "@tinymce/tinymce-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { UpdateBookStatus, UpdateChapter } from "@/services/Api/ChatperApi";

import {
	Save,
	Eye,
	ImageIcon,
	Trash2,
	Plus,
	Bot,
	X,
	BookOpen,
	Loader2,
	FileText,
	CheckCircle2,
	AlertCircle,
	ChevronRight,
	Sparkles,
	AlertTriangle,
	Send,
} from "lucide-react";

import { GetProjectDetailsAPI } from "@/services/Api/ProjectApi";
import {
	PlagiarismCheck,
	FactChecking,
	ConsistencyCheck,
	GenerateSummary,
	CreateChapter,
	DeleteChapter,
} from "@/services/Api/ChatperApi";
import AddChapterModal from "./Chapter/AddChapterModal";
import PdfViewer from "./PdfPreview/PdfViewer";

const AI_TOOLS = [
	{ label: "Fact Check", value: "fact", icon: "🔍" },
	{ label: "Plagiarism", value: "plagiarism", icon: "🛡️" },
	{ label: "Generate Summary", value: "summary", icon: "📝" },
	{ label: "Consistency Check", value: "consistency", icon: "⚖️" },
];

const EditorialSuite = () => {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const { toast } = useToast();

	const projectId = searchParams.get("id");
	const [bookTitle, setBookTitle] = useState("");
	const [chapters, setChapters] = useState<any[]>([]);
	const [selectedChapter, setSelectedChapter] = useState<any>(null);
	const [editorContent, setEditorContent] = useState("");
	const [showFeedbackModal, setShowFeedbackModal] = useState(false);

	const [selectedTool, setSelectedTool] = useState("");
	const [aiLoading, setAiLoading] = useState(false);
	const [aiResult, setAiResult] = useState<any>(null);
	const [activeTab, setActiveTab] = useState("plagiarism");

	const [showAiPanel, setShowAiPanel] = useState(false);
	const [showAddModal, setShowAddModal] = useState(false);
	const [deleteChapterId, setDeleteChapterId] = useState<number | null>(null);

	const [showPreview, setShowPreview] = useState(false);
	const [bookDetails, setBookDetails] = useState<any>(null);

	const [typedSummary, setTypedSummary] = useState("");

	const loadProject = async () => {
		try {
			const res = await GetProjectDetailsAPI(projectId);
			const data = res.data.data;
			setBookTitle(data.title || data.book_title || "Untitled Book");

			const formatted = data.book_chapters.map((ch: any) => ({
				id: ch.id,
				title: ch.title,
				content: ch.content,
				wordCount: ch.word_count,
			}));

			setChapters(formatted);
			setBookDetails({
				...data,
				book_chapters: formatted, // normalize structure
			});

			if (formatted.length > 0) {
				setSelectedChapter(formatted[0]);
				setEditorContent(formatted[0].content || "");
			}
		} catch {
			toast({ title: "Failed to load project", variant: "destructive" });
		}
	};

	const handleRunTool = async () => {
		if (!selectedTool || !selectedChapter) {
			toast({
				title: "Select a tool & chapter first",
				variant: "destructive",
			});
			return;
		}

		try {
			setAiLoading(true);
			setAiResult(null);
			setTypedSummary(""); // reset typing

			// ✅ Always open AI panel
			setShowAiPanel(true);

			// ✅ Set correct tab
			const tabMap: any = {
				summary: "summary",
				fact: "fact",
				plagiarism: "plagiarism",
				consistency: "consistency",
			};
			setActiveTab(tabMap[selectedTool]);

			let res;

			// ✅ TOOL HANDLING
			if (selectedTool === "plagiarism") {
				res = await PlagiarismCheck(editorContent);
			} else if (selectedTool === "fact") {
				res = await FactChecking(editorContent);
			} else if (selectedTool === "summary") {
				// ✅ safety check
				if (!projectId || !selectedChapter?.id) {
					toast({
						title: "Missing book or chapter ID",
						variant: "destructive",
					});
					return;
				}

				res = await GenerateSummary({
					book_id: projectId,
					chapter_id: selectedChapter.id,
				});
				console.log(res, "res");

				// ✅ typing effect
			const text = res?.data?.data?.summary?.detailed_summary || "";
				let i = 0;

				const interval = setInterval(() => {
					setTypedSummary((prev) => prev + text[i]);
					i++;
					if (i >= text.length) clearInterval(interval);
				}, 15);
			} else if (selectedTool === "consistency") {
				res = await ConsistencyCheck(projectId);
			}

			// ✅ store result
			setAiResult(res?.data?.data || null);
		} catch (err) {
			console.error(err);
			toast({
				title: "AI analysis failed",
				variant: "destructive",
			});
		} finally {
			setAiLoading(false);
		}
	};

	useEffect(() => {
		loadProject();
	}, []);

	const handleSave = async () => {
		if (!selectedChapter) {
			toast({
				title: "No chapter selected",
				variant: "destructive",
			});
			return;
		}

		try {
			await UpdateChapter({
				title: selectedChapter.title,
				book_id: projectId,
				content: editorContent,
				chapter_id: selectedChapter.id,
			});

			toast({
				title: "Chapter saved successfully 💾",
			});

			// optional: update word count locally
			setChapters((prev) =>
				prev.map((ch) =>
					ch.id === selectedChapter.id
						? {
								...ch,
								content: editorContent,
								wordCount: editorContent
									.replace(/<[^>]*>/g, "") // remove HTML
									.trim()
									.split(/\s+/)
									.filter(Boolean).length,
							}
						: ch,
				),
			);
		} catch (error) {
			toast({
				title: "Failed to save chapter",
				variant: "destructive",
			});
		}
	};
	const plainText = editorContent.replace(/<[^>]*>/g, "");
	const wordCount = plainText.trim().split(/\s+/).filter(Boolean).length;
	const charCount = plainText.length;

	const handleSendForFeedback = async () => {
		if (!projectId) {
			toast({
				title: "Missing book ID",
				variant: "destructive",
			});
			return;
		}

		try {
			await UpdateBookStatus({
				book_id: projectId,
				status: "feedback",
			});

			toast({ title: "Book sent for feedback 📩" });
			navigate("/projects"); // ← add this line

			// optional: reload project to reflect new status
			await loadProject();
		} catch (error) {
			toast({
				title: "Failed to send for feedback",
				variant: "destructive",
			});
		}
	};

	return (
		<div className="editorial-root">
			{/* ═══ TOP BAR ═══ */}
			<div className="top-bar">
				<div className="top-bar-left">
					<div className="chapter-badge">
						<BookOpen size={17} />
						{bookTitle || "Loading…"}
					</div>
				</div>

				<div className="top-bar-actions">
					<Select value={selectedTool} onValueChange={setSelectedTool}>
						<SelectTrigger className="editorial-select">
							<SelectValue placeholder="Choose AI tool…" />
						</SelectTrigger>
						<SelectContent>
							{AI_TOOLS.map((t) => (
								<SelectItem key={t.value} value={t.value}>
									{t.icon}&nbsp;&nbsp;{t.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<button
						className="btn-run"
						onClick={handleRunTool}
						disabled={aiLoading}
					>
						{aiLoading ? (
							<Loader2 size={14} className="spin" />
						) : (
							<Sparkles size={14} />
						)}
						{aiLoading ? "Running…" : "Run"}
					</button>

					<div className="divider-dot" />

					<button
						className={`btn-ai ${showAiPanel ? "active" : ""}`}
						onClick={() => setShowAiPanel(!showAiPanel)}
					>
						<Bot size={14} />
						AI Results
					</button>

					<div className="divider-dot" />

					{/* <button className="btn-ghost" onClick={() => setShowPDF(true)}>
						<Download size={14} />
						Download PDF
					</button> */}

					<button className="btn-ghost" onClick={() => setShowPreview(true)}>
						<Eye size={14} />
						Preview
					</button>
					<button
						className="btn-ghost"
						onClick={() => navigate(`/cover-generator?id=${projectId}`)}
					>
						<ImageIcon size={14} />
						Cover
					</button>

					<button className="btn-save" onClick={handleSave}>
						<Save size={14} />
						Save
					</button>
					<button
						className="btn-submit"
						onClick={() => setShowFeedbackModal(true)}
					>
						<Send size={14} />
						Submit for Feedback
					</button>
				</div>
			</div>

			{/* ═══ BODY ═══ */}
			<div className="body-wrap">
				{/* ─── SIDEBAR ─── */}
				<div className="sidebar">
					<div className="sidebar-header">
						<div className="sidebar-title">Chapters</div>
						<button
							className="add-chapter-btn"
							onClick={() => setShowAddModal(true)}
						>
							<Plus size={14} />
							New Chapter
						</button>
					</div>

					<div className="chapter-list">
						{chapters.map((ch) => (
							<div
								key={ch.id}
								className={`chapter-item ${selectedChapter?.id === ch.id ? "active" : ""}`}
								onClick={() => {
									setSelectedChapter(ch);
									setEditorContent(ch.content || "");
								}}
							>
								<div className="chapter-item-info">
									<div className="chapter-item-title">{ch.title}</div>
									<div className="chapter-item-meta">
										{ch.wordCount?.toLocaleString()} words
									</div>
								</div>
								<div className="chapter-item-actions">
									<button
										className="icon-btn delete"
										onClick={(e) => {
											e.stopPropagation();
											setDeleteChapterId(ch.id);
										}}
									>
										<Trash2 size={13} />
									</button>
								</div>
								{selectedChapter?.id === ch.id && (
									<ChevronRight
										size={13}
										style={{ color: "hsl(var(--primary))", flexShrink: 0, marginLeft: 4 }}
									/>
								)}
							</div>
						))}
					</div>
				</div>

				{/* ─── EDITOR ─── */}

				<div className="editor-area">
					<div className="editor-scroll">
						<div className="editor-paper">
							{/* 🔹 EDITABLE TITLE */}
							<div className="editor-paper-header">
								<input
									className="editor-title-input"
									value={selectedChapter?.title || ""}
									onChange={(e) => {
										setSelectedChapter((prev: any) => ({
											...prev,
											title: e.target.value,
										}));

										setChapters((prev) =>
											prev.map((ch) =>
												ch.id === selectedChapter.id
													? { ...ch, title: e.target.value }
													: ch,
											),
										);
									}}
									placeholder="Enter chapter title..."
								/>
							</div>

							{/* 🔹 TINYMCE EDITOR */}
							<Editor
								apiKey="l8z8itk8wu9fzhh5rycablwg5569p08i4rnr84vdohk2wh3m"
								value={editorContent}
								onEditorChange={(content) => setEditorContent(content)}
								init={{
									height: 500,
									menubar: false,
									resize: false,
									branding: false,
									statusbar: false,

									plugins: [
										"advlist",
										"autolink",
										"lists",
										"link",
										"image",
										"charmap",
										"preview",
										"anchor",
										"table",
										"code",
										"wordcount",
									],

									toolbar:
										"undo redo | blocks fontfamily fontsize | " +
										"bold italic underline strikethrough forecolor backcolor | " +
										"alignleft aligncenter alignright alignjustify | " +
										"bullist numlist outdent indent | link image table | removeformat",

									toolbar_location: "top",
									toolbar_sticky: true,

									block_formats:
										"Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Blockquote=blockquote; Code=pre",

									font_family_formats:
										"DM Sans=DM Sans,sans-serif;" +
										"Playfair Display=Playfair Display,serif;" +
										"Georgia=georgia,palatino,serif;" +
										"Times New Roman=times new roman,times,serif;" +
										"Arial=arial,helvetica,sans-serif;" +
										"Courier New=courier new,courier,monospace;",

									font_size_formats:
										"12px 13px 14px 15px 16px 18px 20px 24px 28px 32px",

									automatic_uploads: true,
									file_picker_types: "image",

									content_style: `
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap');

      body {
        font-family: 'DM Sans', sans-serif;
        font-size: 15px;
        line-height: 1.85;
        color: var(--tp-text);
        background: #ffffff;
        padding: 1rem;
      }

      p { margin: 0 0 1rem; }

      h1, h2, h3 {
        font-family: 'Playfair Display', serif;
        color: var(--tp-text);
        font-weight: 600;
        margin: 1.5rem 0 0.6rem;
      }

      h1 { font-size: 1.8rem; }
      h2 { font-size: 1.4rem; }
      h3 { font-size: 1.15rem; }

      blockquote {
        border-left: 3px solid var(--tp-primary);
        margin: 1rem 0;
        padding: 0.25rem 0 0.25rem 1.25rem;
        color: var(--tp-text-muted);
        font-style: italic;
      }

      pre {
        background: var(--tp-surface-muted);
        border: 1px solid var(--tp-border);
        border-radius: 6px;
        padding: 1rem;
        font-family: 'Courier New', monospace;
        font-size: 0.875rem;
        overflow-x: auto;
      }

      table { border-collapse: collapse; width: 100%; margin-bottom: 1rem; }
      td, th { border: 1px solid var(--tp-border); padding: 0.5rem 0.75rem; font-size: 0.875rem; }
      th { background: var(--tp-bg); font-weight: 600; }

      a { color: var(--tp-primary); text-decoration: underline; }
      ul, ol { padding-left: 1.5rem; margin-bottom: 1rem; }
      li { margin-bottom: 0.3rem; }
      strong { font-weight: 600; }
      em { font-style: italic; }
      s { text-decoration: line-through; color: var(--tp-text-muted); }

      ::selection { background: rgba(201, 168, 76, 0.2); }
    `,
								}}
							/>

							{/* 🔹 FOOTER */}
							<div className="editor-footer">
								<span className="editor-stat">
									<strong>{wordCount.toLocaleString()}</strong> words
								</span>
								<span className="editor-stat">
									<strong>{charCount.toLocaleString()}</strong> characters
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* ─── AI PANEL ─── */}
				{showAiPanel && (
					<div className="ai-panel">
						<div className="ai-panel-header">
							<Sparkles size={15} className="text-primary" />
							<span className="ai-panel-title">AI Analysis</span>
							<button
								className="icon-btn"
								onClick={() => setShowAiPanel(false)}
							>
								<X size={14} />
							</button>
						</div>

						<Tabs
							value={activeTab}
							onValueChange={setActiveTab}
							style={{
								display: "flex",
								flexDirection: "column",
								flex: 1,
								overflow: "hidden",
							}}
						>
							<TabsList className="ai-tabs-list">
								<TabsTrigger value="plagiarism" className="ai-tab-trigger">
									Plagiarism
								</TabsTrigger>
								<TabsTrigger value="summary" className="ai-tab-trigger">
									Summary
								</TabsTrigger>
								<TabsTrigger value="consistency" className="ai-tab-trigger">
									Consistency
								</TabsTrigger>
								<TabsTrigger value="fact" className="ai-tab-trigger">
									Fact Check
								</TabsTrigger>
							</TabsList>

							<div className="ai-tab-content">
								{/* ── PLAGIARISM ── */}
								<TabsContent value="plagiarism" style={{ margin: 0 }}>
									{aiLoading && activeTab === "plagiarism" ? (
										<div className="ai-loading">
											<Loader2 size={22} className="spin text-primary" />
											<p>Scanning for plagiarism…</p>
										</div>
									) : aiResult && selectedTool === "plagiarism" ? (
										<div>
											<div className="result-card">
												<div className="result-score">
													{aiResult.plagiarismScore ?? "--"}%
												</div>
												<div className="result-label">Similarity Score</div>
												<div className="score-bar-wrap">
													<div
														className="score-bar-fill"
														style={{
															width: `${aiResult.plagiarismScore ?? 0}%`,
														}}
													/>
												</div>
											</div>
											{aiResult.details && (
												<div className="result-card">
													<p className="result-text">{aiResult.details}</p>
												</div>
											)}
										</div>
									) : (
										<div className="ai-empty">
											<CheckCircle2 size={28} className="text-muted-foreground/50" />
											<p>Select "Plagiarism" and hit Run</p>
										</div>
									)}
								</TabsContent>

								{/* ── SUMMARY ── */}
								<TabsContent value="summary" style={{ margin: 0 }}>
									{aiLoading && activeTab === "summary" ? (
										<div className="ai-loading">
											<Loader2 size={24} className="spin text-primary" />

											<div style={{ textAlign: "center", marginTop: 12 }}>
												<p style={{ fontWeight: 500 }}>
													AI is generating your summary…
												</p>
												<p style={{ fontSize: 12 }} className="text-muted-foreground">
													This may take a few seconds. Please wait.
												</p>
											</div>
										</div>
									) : aiResult && selectedTool === "summary" ? (
										<div className="result-card">
										<p className="result-text">{typedSummary}</p>
										</div>
									) : (
										<div className="ai-empty">
											<FileText size={28} className="text-muted-foreground/50" />
											<p>Select "Generate Summary" and hit Run</p>
										</div>
									)}
								</TabsContent>

								{/* ── CONSISTENCY ── */}
								<TabsContent value="consistency" style={{ margin: 0 }}>
									{aiLoading && activeTab === "consistency" ? (
										<div className="ai-loading">
											<Loader2 size={22} className="spin text-primary" />
											<p>Checking consistency…</p>
										</div>
									) : aiResult && selectedTool === "consistency" ? (
										<div>
											<div className="result-card">
												<div style={{ display: "flex", flexWrap: "wrap" }}>
													<span className="result-tag tag-ok">
														<CheckCircle2 size={11} />
														Tone
													</span>
													<span className="result-tag tag-ok">
														<CheckCircle2 size={11} />
														Voice
													</span>
													<span className="result-tag tag-warn">
														<AlertCircle size={11} />
														Timeline
													</span>
												</div>
												{aiResult.issues && (
													<p
														className="result-text"
														style={{ marginTop: "0.75rem" }}
													>
														{aiResult.issues}
													</p>
												)}
											</div>
										</div>
									) : (
										<div className="ai-empty">
											<AlertCircle size={28} className="text-muted-foreground/50" />
											<p>Select "Consistency Check" and hit Run</p>
										</div>
									)}
								</TabsContent>

								{/* ── FACT CHECK ── */}
								<TabsContent value="fact" style={{ margin: 0 }}>
									{aiLoading && activeTab === "fact" ? (
										<div className="ai-loading">
											<Loader2 size={22} className="spin text-primary" />
											<p>Fact-checking content…</p>
										</div>
									) : aiResult && selectedTool === "fact" ? (
										<div className="result-card">
											<p className="result-text">
												{aiResult.factCheckResult ?? "Analysis complete."}
											</p>
										</div>
									) : (
										<div className="ai-empty">
											<CheckCircle2 size={28} className="text-muted-foreground/50" />
											<p>Select "Fact Check" and hit Run</p>
										</div>
									)}
								</TabsContent>
							</div>
						</Tabs>
					</div>
				)}
			</div>

			<AddChapterModal
				open={showAddModal}
				onClose={() => setShowAddModal(false)}
				onCreate={async (title) => {
					await CreateChapter({
						title,
						book_id: projectId,
					});

					toast({
						title: "Chapter added successfully ✅",
					});

					await loadProject();
				}}
			/>

			{deleteChapterId && (
				<div className="delete-modal-backdrop">
					<div className="delete-modal">
						{/* red shimmer strip */}
						<div className="delete-modal-strip" />

						<div className="delete-modal-inner">
							{/* icon */}
							<div className="delete-modal-icon">
								<Trash2 size={18} />
							</div>

							<h3>Delete Chapter</h3>
							<p>
								Are you sure you want to delete this chapter? All content will
								be permanently lost.
							</p>

							{/* warning */}
							<div className="delete-modal-warning">
								<AlertTriangle size={13} />
								This action cannot be undone.
							</div>

							<div className="delete-actions">
								<button onClick={() => setDeleteChapterId(null)}>Cancel</button>
								<button
									className="danger"
									onClick={async () => {
										await DeleteChapter(deleteChapterId);
										toast({ title: "Chapter deleted successfully 🗑️" });
										setDeleteChapterId(null);
										await loadProject();
									}}
								>
									Delete
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{showPreview && (
				<div className="preview-overlay">
					<PdfViewer
						htmlContent={editorContent}
						title={selectedChapter?.title || "Document"}
						onClose={() => setShowPreview(false)}
					/>
				</div>
			)}

			{showFeedbackModal && (
				<div className="feedback-modal-backdrop">
					<div className="feedback-modal">
						<div className="feedback-modal-icon">
							<Send size={22} />
						</div>
						<h3>Submit for Feedback</h3>
						<p>
							Your book <strong>"{bookTitle}"</strong> will be submitted for
							review. Make sure all chapters are saved before proceeding.
						</p>
						<div className="feedback-modal-actions">
							<button onClick={() => setShowFeedbackModal(false)}>
								Cancel
							</button>
							<button
								className="confirm"
								onClick={async () => {
									setShowFeedbackModal(false);
									await handleSendForFeedback();
								}}
							>
								Yes, Submit
							</button>
						</div>
					</div>
				</div>
			)}
			{/* {showPDF && (
				<BookHeader
					bookIdDetails={bookDetails}
					title={bookTitle}
					onClose={() => setShowPDF(false)}
				/>
			)} */}
		</div>
	);
};

export default EditorialSuite;
