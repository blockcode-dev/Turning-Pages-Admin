/** @format */

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Loader2,
	BookOpen,
	ArrowLeft,
	CheckCircle2,
	AlertTriangle,
	XCircle,
	TrendingUp,
	ListChecks,
	ThumbsUp,
	ThumbsDown,
	Flag,
	RotateCcw,
	ChevronDown,
	ChevronRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RunTavAnalysisAPI } from "@/services/Api/ProjectApi";

// ── Score helpers ────────────────────────────────────────────────────────────

const scoreTier = (score: number, max = 10) => {
	if (score === undefined || score === null) return "neutral";
	const pct = score / max;
	if (pct >= 0.7) return "good";
	if (pct >= 0.4) return "mid";
	return "bad";
};

const tierColors: Record<string, { text: string; bar: string; badge: string }> = {
	good: { text: "text-green-600", bar: "bg-green-500", badge: "bg-green-100 text-green-800" },
	mid: { text: "text-orange-600", bar: "bg-orange-500", badge: "bg-orange-100 text-orange-800" },
	bad: { text: "text-red-600", bar: "bg-red-500", badge: "bg-red-100 text-red-800" },
	neutral: { text: "text-muted-foreground", bar: "bg-muted-foreground/40", badge: "bg-muted text-muted-foreground" },
};

// A single scored row: label, numeric score with a color-coded fill bar, and rating text.
const ScoreRow = ({
	label,
	score,
	max = 10,
	rating,
	highlight,
}: {
	label: string;
	score: number;
	max?: number;
	rating: string;
	highlight?: boolean;
}) => {
	const tier = scoreTier(score, max);
	const colors = tierColors[tier];
	const pct = score !== undefined && score !== null ? Math.min(100, (score / max) * 100) : 0;

	return (
		<div
			className={`flex items-center gap-3 px-3 py-2 border-b last:border-b-0 text-sm ${
				highlight ? "bg-muted/40 font-semibold" : ""
			}`}
		>
			<div className="w-40 shrink-0 truncate">{label}</div>
			<div className={`w-14 shrink-0 font-bold tabular-nums ${colors.text}`}>
				{score ?? "-"}/{max}
			</div>
			<div className="w-24 shrink-0 h-1.5 rounded-full bg-muted overflow-hidden">
				<div className={`h-full rounded-full ${colors.bar}`} style={{ width: `${pct}%` }} />
			</div>
			<div className="flex-1 text-muted-foreground truncate">{rating}</div>
		</div>
	);
};

const ScoreTable = ({
	rows,
	labelHeader = "Category",
}: {
	rows: { label: string; score: number; max?: number; rating: string; highlight?: boolean }[];
	labelHeader?: string;
}) => (
	<div className="border rounded-lg overflow-hidden">
		<div className="flex items-center gap-3 px-3 py-2 border-b-2 font-semibold text-xs uppercase tracking-wide text-muted-foreground bg-muted/40">
			<div className="w-40 shrink-0">{labelHeader}</div>
			<div className="w-14 shrink-0">Score</div>
			<div className="w-24 shrink-0"></div>
			<div className="flex-1">Rating</div>
		</div>
		{rows.map((r, i) => (
			<ScoreRow key={i} {...r} />
		))}
	</div>
);

const SectionPill = ({
	icon,
	label,
	className,
}: {
	icon: React.ReactNode;
	label: string;
	className: string;
}) => (
	<div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold text-xs mt-3 mb-1.5 ${className}`}>
		{icon}
		{label}
	</div>
);

// Collapsible wrapper used for the 9 audit sections and chapter cards, so the
// page reads as a scannable report instead of one long unbroken scroll.
const Collapsible = ({
	title,
	badge,
	defaultOpen = false,
	children,
}: {
	title: React.ReactNode;
	badge?: React.ReactNode;
	defaultOpen?: boolean;
	children: React.ReactNode;
}) => {
	const [open, setOpen] = useState(defaultOpen);
	return (
		<div className="border rounded-lg overflow-hidden">
			<button
				onClick={() => setOpen((o) => !o)}
				className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
			>
				<span className="flex items-center gap-2 font-semibold text-sm">
					{open ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
					{title}
				</span>
				{badge}
			</button>
			{open && <div className="px-4 py-4 border-t">{children}</div>}
		</div>
	);
};

// ── Main page ─────────────────────────────────────────────────────────────

const TavAnalysisPage = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const { toast } = useToast();

	const bookId = Number(searchParams.get("id"));

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [data, setData] = useState<any>(null);

	const runAnalysis = async () => {
		if (!bookId) {
			setError("No book id provided.");
			setLoading(false);
			return;
		}
		try {
			setLoading(true);
			setError(null);

			const res = await RunTavAnalysisAPI(bookId);
			const payload = res.data.data || res.data;
			setData(payload);
		} catch (err: any) {
			const message = err.response?.data?.message || err.message || "Analysis failed.";
			setError(message);
			toast({
				title: "TAV analysis failed",
				description: message,
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		runAnalysis();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [bookId]);

	const header = data?.header;
	const report = data?.report;
	const allChapters =
		data?.chapter_analysis?.flatMap((chunk: any) => chunk.chapters || []) || [];

	if (loading) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 text-center px-4">
				<Loader2 className="h-9 w-9 animate-spin text-primary" />
				<div>
					<p className="text-base font-semibold">Running TAV Analysis…</p>
					<p className="text-sm text-muted-foreground mt-1 max-w-sm">
						This runs a full 9-part manuscript audit and can take over a minute.
						Feel free to stay on this page — it'll update automatically when it's done.
					</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="max-w-lg mx-auto mt-16 text-center space-y-4">
				<XCircle className="h-9 w-9 text-red-600 mx-auto" />
				<p className="font-semibold">Analysis failed</p>
				<p className="text-sm text-muted-foreground">{error}</p>
				<div className="flex gap-2 justify-center">
					<Button onClick={runAnalysis} className="flex items-center gap-2">
						<RotateCcw className="h-4 w-4" />
						Try Again
					</Button>
					<Button variant="outline" onClick={() => navigate(-1)}>
						<ArrowLeft className="h-4 w-4 mr-1" />
						Back to Projects
					</Button>
				</div>
			</div>
		);
	}

	if (!data) return null;

	const notCertified = header?.certification === "Not Yet Certified";
	const overallTier = scoreTier(report?.overall_score, 30);
	const overallColors = tierColors[overallTier];

	return (
		<div className="space-y-4 px-2 sm:px-0 max-w-5xl mx-auto pb-16">
			{/* ── Top bar ── */}
			<div className="flex items-center justify-between gap-3">
				<Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="flex items-center gap-1.5 -ml-2">
					<ArrowLeft className="h-4 w-4" />
					Back to Projects
				</Button>
				<Button variant="outline" size="sm" onClick={runAnalysis} className="flex items-center gap-1.5">
					<RotateCcw className="h-4 w-4" />
					Re-run Analysis
				</Button>
			</div>

			{/* ── Report header banner ── */}
			<Card className="overflow-hidden">
				<div className={`h-1.5 ${overallColors.bar}`} />
				<CardContent className="p-4 sm:p-5">
					<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
						<div className="min-w-0">
							<div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
								<BookOpen className="h-3.5 w-3.5" />
								TAV Analysis Report
							</div>
							<h1 className="text-xl sm:text-2xl font-bold truncate">{header?.book?.title}</h1>
							<p className="text-sm text-muted-foreground mt-0.5">
								by {header?.book?.author || "Unknown"} · {header?.book?.genre} · {header?.book?.language}
							</p>
						</div>

						{/* Overall score - the hero number of the report */}
						<div className="flex items-center gap-4 shrink-0">
							<div className="text-right">
								<div className={`text-3xl font-black tabular-nums ${overallColors.text}`}>
									{report?.overall_score}
									<span className="text-base text-muted-foreground font-medium">/30</span>
								</div>
								<Badge className={notCertified ? "bg-red-600 text-white mt-1" : "bg-green-600 text-white mt-1"}>
									{header?.certification}
								</Badge>
							</div>
						</div>
					</div>

					<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t text-sm">
						<div>
							<span className="text-xs text-muted-foreground block">Total Words</span>
							<span className="font-semibold">{header?.book?.total_words?.toLocaleString()}</span>
						</div>
						<div>
							<span className="text-xs text-muted-foreground block">Chapters</span>
							<span className="font-semibold">{header?.book?.total_chapters}</span>
						</div>
						<div>
							<span className="text-xs text-muted-foreground block">Analyzed</span>
							<span className="font-semibold">
								{header?.analysis_date ? new Date(header.analysis_date).toLocaleDateString() : "-"}
							</span>
						</div>
						<div>
							<span className="text-xs text-muted-foreground block">Readiness</span>
							<span className={`font-semibold ${header?.readiness === "Ready for Publication" ? "text-green-600" : "text-orange-600"}`}>
								{header?.readiness}
							</span>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* ── Overall scores ── */}
			{report?.scores && (
				<Card>
					<CardHeader className="pb-2 pt-4 px-4">
						<CardTitle className="text-base flex items-center gap-2">
							<TrendingUp className="h-4 w-4" />
							Overall Scores
						</CardTitle>
					</CardHeader>
					<CardContent className="px-4 pb-4">
						<ScoreTable
							rows={[
								{ label: "Theme", score: report.scores.theme.score, rating: report.scores.theme.rating },
								{ label: "Authority", score: report.scores.authority.score, rating: report.scores.authority.rating },
								{ label: "Value", score: report.scores.value.score, rating: report.scores.value.rating },
								{ label: "Overall", score: report.overall_score, max: 30, rating: report.readiness, highlight: true },
							]}
						/>
					</CardContent>
				</Card>
			)}

			{/* ── Section scores ── */}
			{report?.sections && (
				<Card>
					<CardHeader className="pb-2 pt-4 px-4">
						<CardTitle className="text-base flex items-center gap-2">
							<ListChecks className="h-4 w-4" />
							All Audit Section Scores
						</CardTitle>
					</CardHeader>
					<CardContent className="px-4 pb-4">
						<ScoreTable
							labelHeader="Section"
							rows={report.sections.map((s: any) => ({ label: s.name, score: s.score, rating: s.rating }))}
						/>
					</CardContent>
				</Card>
			)}

			{/* ── Executive summary ── */}
			{report?.executive_summary && (
				<Card>
					<CardHeader className="pb-2 pt-4 px-4">
						<CardTitle className="text-base">Executive Summary</CardTitle>
					</CardHeader>
					<CardContent className="px-4 pb-4">
						<SectionPill icon={<ListChecks className="h-3.5 w-3.5" />} label="Overall Assessment" className="bg-indigo-100 text-indigo-800" />
						<p className="text-sm leading-relaxed">{report.executive_summary.overall_assessment}</p>

						<SectionPill icon={<ThumbsUp className="h-3.5 w-3.5" />} label="Major Strengths" className="bg-green-100 text-green-800" />
						<ul className="list-disc pl-5 text-sm space-y-0.5">
							{report.executive_summary.major_strengths?.map((x: string, i: number) => <li key={i}>{x}</li>)}
						</ul>

						<SectionPill icon={<ThumbsDown className="h-3.5 w-3.5" />} label="Major Weaknesses" className="bg-red-100 text-red-800" />
						<ul className="list-disc pl-5 text-sm space-y-0.5">
							{report.executive_summary.major_weaknesses?.map((x: string, i: number) => <li key={i}>{x}</li>)}
						</ul>

						{report.executive_summary.editor_notes && (
							<>
								<SectionPill icon={<AlertTriangle className="h-3.5 w-3.5" />} label="Editor Notes" className="bg-yellow-100 text-yellow-800" />
								<p className="text-sm leading-relaxed">{report.executive_summary.editor_notes}</p>
							</>
						)}
					</CardContent>
				</Card>
			)}

			{/* ── Priority revisions ── */}
			{report?.priority_revisions?.length > 0 && (
				<Card>
					<CardHeader className="pb-2 pt-4 px-4">
						<CardTitle className="text-base flex items-center gap-2">
							<Flag className="h-4 w-4" />
							Priority Revisions
						</CardTitle>
					</CardHeader>
					<CardContent className="px-4 pb-4 space-y-2">
						{report.priority_revisions.map((pr: any, i: number) => (
							<div key={i} className="border rounded-lg p-3 border-l-4 border-l-red-500 text-sm">
								<div className="flex items-center gap-2 flex-wrap mb-1.5">
									<Badge className="bg-red-100 text-red-800 text-xs">{pr.priority} Priority</Badge>
									<span className="font-semibold">Chapter {pr.chapter}</span>
									{pr.estimated_effort && (
										<span className="text-xs text-muted-foreground">Effort: {pr.estimated_effort}</span>
									)}
								</div>
								<p><b>Issue:</b> {pr.issue}</p>
								<p className="mt-1"><b>Action:</b> {pr.action}</p>
								{pr.impact && <p className="mt-1"><b>Impact:</b> {pr.impact}</p>}
							</div>
						))}
					</CardContent>
				</Card>
			)}

			{/* ── Full audit section detail - collapsible ── */}
			{report?.sections && (
				<Card>
					<CardHeader className="pb-2 pt-4 px-4">
						<CardTitle className="text-base">Audit Sections (Full Detail)</CardTitle>
					</CardHeader>
					<CardContent className="px-4 pb-4 space-y-2">
						{report.sections.map((section: any) => {
							const tier = scoreTier(section.score);
							return (
								<Collapsible
									key={section.key}
									title={section.name}
									badge={
										<span className={`text-xs font-bold px-2 py-0.5 rounded ${tierColors[tier].badge}`}>
											{section.score}/10 · {section.rating}
										</span>
									}
								>
									<p className="text-sm leading-relaxed">{section.assessment}</p>

									<SectionPill icon={<ListChecks className="h-3.5 w-3.5" />} label="Findings" className="bg-blue-100 text-blue-800" />
									<ul className="list-disc pl-5 text-sm space-y-0.5">
										{section.findings?.map((f: string, i: number) => <li key={i}>{f}</li>)}
									</ul>

									<SectionPill icon={<CheckCircle2 className="h-3.5 w-3.5" />} label="Recommendations" className="bg-green-100 text-green-800" />
									<ul className="list-disc pl-5 text-sm space-y-0.5">
										{section.recommendations?.map((r: string, i: number) => <li key={i}>{r}</li>)}
									</ul>
								</Collapsible>
							);
						})}
					</CardContent>
				</Card>
			)}

			{/* ── Chapter analysis - collapsible ── */}
			{allChapters.length > 0 && (
				<Card>
					<CardHeader className="pb-2 pt-4 px-4">
						<CardTitle className="text-base">Chapter Analysis</CardTitle>
					</CardHeader>
					<CardContent className="px-4 pb-4 space-y-2">
						{allChapters.map((chapter: any) => (
							<Collapsible
								key={chapter.chapter_number}
								title={`Ch. ${chapter.chapter_number} — ${chapter.chapter_title}`}
							>
								<p className="text-sm"><b>Purpose:</b> {chapter.purpose}</p>
								<p className="text-sm mt-1 leading-relaxed">{chapter.summary}</p>

								<div className="mt-3">
									<ScoreTable
										labelHeader="Metric"
										rows={[
											{ label: "Structure", score: chapter.scores.structure.score, rating: chapter.scores.structure.rating },
											{ label: "Clarity", score: chapter.scores.clarity.score, rating: chapter.scores.clarity.rating },
											{ label: "Flow", score: chapter.scores.flow.score, rating: chapter.scores.flow.rating },
											{ label: "Redundancy", score: chapter.scores.redundancy.score, rating: chapter.scores.redundancy.rating },
										]}
									/>
								</div>

								<SectionPill icon={<AlertTriangle className="h-3.5 w-3.5" />} label="Issues" className="bg-red-100 text-red-800" />
								<ul className="list-disc pl-5 text-sm space-y-0.5">
									{chapter.issues?.map((i: string, idx: number) => <li key={idx}>{i}</li>)}
								</ul>

								<SectionPill icon={<CheckCircle2 className="h-3.5 w-3.5" />} label="Recommendations" className="bg-green-100 text-green-800" />
								<ul className="list-disc pl-5 text-sm space-y-0.5">
									{chapter.recommendations?.map((r: string, idx: number) => <li key={idx}>{r}</li>)}
								</ul>
							</Collapsible>
						))}
					</CardContent>
				</Card>
			)}

			{/* ── Final recommendation ── */}
			<Card className={notCertified ? "border-orange-300 bg-orange-50" : "border-green-300 bg-green-50"}>
				<CardContent className="p-4 flex gap-3">
					{notCertified ? (
						<AlertTriangle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
					) : (
						<CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
					)}
					<div>
						<div className="font-bold">{header?.certification}</div>
						<SectionPill icon={<CheckCircle2 className="h-3.5 w-3.5" />} label="Final Recommendation" className="bg-white/70 text-foreground" />
						<p className="text-sm leading-relaxed">{report?.final_recommendation}</p>
					</div>
				</CardContent>
			</Card>

			{/* ── Next steps ── */}
			{report?.next_steps?.length > 0 && (
				<Card>
					<CardHeader className="pb-2 pt-4 px-4">
						<CardTitle className="text-base">Next Steps</CardTitle>
					</CardHeader>
					<CardContent className="px-4 pb-4">
						<ul className="list-disc pl-5 text-sm space-y-1">
							{report.next_steps.map((step: string, i: number) => <li key={i}>{step}</li>)}
						</ul>
					</CardContent>
				</Card>
			)}
		</div>
	);
};

export default TavAnalysisPage;