/** @format */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { CalendarIcon, Eye, Filter, X, BookOpen } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { GetAllEditingQueueAPI } from "@/services/Api/ProjectApi";
import { GetAllGenresAPI } from "@/services/Api/GenreApi";

const statuses = [
	"All Statuses",
	"draft",
	"in-editing",
	"completed",
	"feedback",
];

const getStatusBadge = (status: string) => {
	const map: Record<string, string> = {
		"in-editing": "In Submission",
		draft: "Draft",
		completed: "Completed",
		feedback: "Feedback",
	};
	const label = map[status] ?? status.charAt(0).toUpperCase() + status.slice(1);

	const base =
		"inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap";

	switch (status) {
		case "draft":
			return (
				<span className={cn(base, "bg-[#F1EFE8] text-[#5F5E5A]")}>{label}</span>
			);
		case "in-editing":
			return (
				<span className={cn(base, "bg-[#E6F1FB] text-[#185FA5]")}>{label}</span>
			);
		case "completed":
			return (
				<span className={cn(base, "bg-[#EAF3DE] text-[#3B6D11]")}>{label}</span>
			);
		case "feedback":
			return (
				<span className={cn(base, "bg-[#FAEEDA] text-[#854F0B]")}>{label}</span>
			);
		default:
			return <span className={cn(base, "bg-muted text-muted-foreground")}>{label}</span>;
	}
};

const formatWordCount = (count: number) => count?.toLocaleString() || "0";

const formatStatus = (status: string) => {
	if (status === "All Statuses") return status;
	if (status === "in-editing") return "In Submission";
	return status.charAt(0).toUpperCase() + status.slice(1);
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({
	label,
	value,
	valueClass = "",
}: {
	label: string;
	value: number;
	valueClass?: string;
}) => (
	<div className="rounded-lg bg-muted/60 px-4 py-3 space-y-1">
		<p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
			{label}
		</p>
		<p className={cn("text-2xl font-medium", valueClass)}>{value}</p>
	</div>
);

// ── Mobile manuscript card ────────────────────────────────────────────────────
const ManuscriptCard = ({
	m,
	onView,
}: {
	m: any;
	onView: (m: any) => void;
}) => (
	<div className="rounded-xl border bg-card shadow-sm p-4 space-y-3 hover:shadow-md transition-shadow">
		<div className="flex items-start justify-between gap-2">
			<p className="font-semibold text-sm leading-tight truncate min-w-0">
				{m.title}
			</p>
			{getStatusBadge(m.status)}
		</div>

		<div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
			<div>
				<span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-0.5">
					Author
				</span>
				<span className="font-medium truncate block">
					{m.book_user?.user_profile?.name || "Unknown"}
				</span>
			</div>
			<div>
				<span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-0.5">
					Word Count
				</span>
				<span className="font-medium">{formatWordCount(m.word_count)}</span>
			</div>
			<div>
				<span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-0.5">
					Genre
				</span>
				<span className="font-medium">{m.book_genre?.title || "—"}</span>
			</div>
			<div>
				<span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-0.5">
					Submitted
				</span>
				<span className="font-medium">
					{format(new Date(m.created_at), "MMM dd, yyyy")}
				</span>
			</div>
		</div>

		<div className="pt-1 border-t">
			<Button
				variant="outline"
				size="sm"
				onClick={() => onView(m)}
				className="w-full flex items-center justify-center gap-1.5 h-8 text-xs"
			>
				<Eye className="h-3 w-3" />
				View Manuscript
			</Button>
		</div>
	</div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const EditingQueue = () => {
	const [manuscripts, setManuscripts] = useState<any[]>([]);
	const [filtered, setFiltered] = useState<any[]>([]);
	const [genres, setGenres] = useState<string[]>(["All Genres"]);

	const [selectedGenre, setSelectedGenre] = useState("All Genres");
	const [selectedStatus, setSelectedStatus] = useState("All Statuses");
	const [selectedDate, setSelectedDate] = useState<Date>();

	const [selectedManuscript, setSelectedManuscript] = useState<any>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [showFilters, setShowFilters] = useState(false);

	const navigate = useNavigate();

	const loadManuscripts = async () => {
		try {
			const res = await GetAllEditingQueueAPI();
			const list = res.data.data || [];
			setManuscripts(list);
			setFiltered(list);
		} catch (err: any) {
			if (
				err.response?.data?.message ===
				"You are not authorized to access this route"
			) {
				return navigate("/unauthorized");
			}
			console.error(err);
		}
	};

	const loadGenres = async () => {
		try {
			const res = await GetAllGenresAPI();
			const mapped = (res.data.data || []).map((g: any) => g.title);
			setGenres(["All Genres", ...mapped]);
		} catch (error) {
			console.error("Failed to load genres", error);
		}
	};

	useEffect(() => {
		loadGenres();
		loadManuscripts();
	}, []);

	useEffect(() => {
		let result = manuscripts;
		if (selectedGenre !== "All Genres")
			result = result.filter((m) => m.book_genre?.title === selectedGenre);
		if (selectedStatus !== "All Statuses")
			result = result.filter((m) => m.status === selectedStatus);
		if (selectedDate) {
			const ds = format(selectedDate, "yyyy-MM-dd");
			result = result.filter((m) => m.created_at?.startsWith(ds));
		}
		setFiltered(result);
	}, [selectedGenre, selectedStatus, selectedDate, manuscripts]);

	const handleViewManuscript = (m: any) => {
		setSelectedManuscript(m);
		setIsModalOpen(true);
	};

	const clearFilters = () => {
		setSelectedGenre("All Genres");
		setSelectedStatus("All Statuses");
		setSelectedDate(undefined);
	};

	const hasActiveFilters =
		selectedGenre !== "All Genres" ||
		selectedStatus !== "All Statuses" ||
		!!selectedDate;

	const countByStatus = (s: string) => manuscripts.filter((m) => m.status === s).length;

	return (
		<div className="space-y-5 px-2 sm:px-0">

			{/* ── Header ── */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
				<div>
					<h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
						Editing Queue
					</h1>
					<p className="text-muted-foreground mt-1 text-sm">
						Manage and track manuscripts in the editorial pipeline
					</p>
				</div>
				<Button
					variant="outline"
					size="sm"
					className="sm:hidden self-start flex items-center gap-2"
					onClick={() => setShowFilters((v) => !v)}
				>
					<Filter className="h-4 w-4" />
					Filters
					{hasActiveFilters && (
						<span className="h-2 w-2 rounded-full bg-primary inline-block" />
					)}
				</Button>
			</div>

			{/* ── Stat summary row ── */}
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
				<StatCard label="Total" value={manuscripts.length} />
				<StatCard
					label="In Submission"
					value={countByStatus("in-editing")}
					valueClass="text-[#185FA5]"
				/>
				<StatCard
					label="Completed"
					value={countByStatus("completed")}
					valueClass="text-[#3B6D11]"
				/>
				<StatCard
					label="Feedback"
					value={countByStatus("feedback")}
					valueClass="text-[#854F0B]"
				/>
			</div>

			{/* ── Filters ── */}
			<Card
				className={cn("sm:block", showFilters ? "block" : "hidden sm:block")}
			>
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center justify-between text-sm font-medium">
						<span className="flex items-center gap-2">
							<Filter className="h-3.5 w-3.5" />
							Filters
						</span>
						<Button
							variant="ghost"
							size="icon"
							className="sm:hidden h-7 w-7"
							onClick={() => setShowFilters(false)}
						>
							<X className="h-4 w-4" />
						</Button>
					</CardTitle>
				</CardHeader>

				<CardContent className="pt-0">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
						{/* Genre */}
						<div className="space-y-1.5">
							<label className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
								Genre
							</label>
							<Select value={selectedGenre} onValueChange={setSelectedGenre}>
								<SelectTrigger className="h-9 w-full text-sm">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{genres.map((g) => (
										<SelectItem key={g} value={g}>
											{g}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Status */}
						<div className="space-y-1.5">
							<label className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
								Status
							</label>
							<Select value={selectedStatus} onValueChange={setSelectedStatus}>
								<SelectTrigger className="h-9 w-full text-sm">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{statuses.map((s) => (
										<SelectItem key={s} value={s}>
											{formatStatus(s)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Date */}
						<div className="space-y-1.5">
							<label className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
								Submission Date
							</label>
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										className={cn(
											"h-9 w-full justify-start text-left font-normal text-sm",
											!selectedDate && "text-muted-foreground",
										)}
									>
										<CalendarIcon className="mr-2 h-3.5 w-3.5 shrink-0" />
										<span className="truncate">
											{selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
										</span>
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0" align="start">
									<Calendar
										mode="single"
										selected={selectedDate}
										onSelect={setSelectedDate}
										initialFocus
									/>
								</PopoverContent>
							</Popover>
						</div>

						{/* Clear */}
						<div className="flex items-end">
							<Button
								variant="outline"
								size="sm"
								onClick={clearFilters}
								disabled={!hasActiveFilters}
								className="w-full sm:w-auto flex items-center gap-1.5 h-9 text-sm"
							>
								<X className="h-3.5 w-3.5" />
								Clear Filters
							</Button>
						</div>
					</div>

					<p className="text-xs text-muted-foreground mt-4 pt-3 border-t">
						Showing{" "}
						<span className="font-medium text-foreground">{filtered.length}</span>{" "}
						of{" "}
						<span className="font-medium text-foreground">{manuscripts.length}</span>{" "}
						manuscripts
					</p>
				</CardContent>
			</Card>

			{/* ── Mobile cards ── */}
			<div className="grid grid-cols-1 gap-3 md:hidden">
				{filtered.length > 0 ? (
					filtered.map((m) => (
						<ManuscriptCard key={m.id} m={m} onView={handleViewManuscript} />
					))
				) : (
					<div className="text-center py-14 text-muted-foreground text-sm">
						No manuscripts found.
					</div>
				)}
			</div>

			{/* ── Desktop table ── */}
			<Card className="hidden md:block overflow-hidden">
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center gap-2 text-base">
						<BookOpen className="h-4 w-4" />
						Manuscripts
						<span className="ml-1 text-sm font-normal text-muted-foreground">
							({filtered.length})
						</span>
					</CardTitle>
				</CardHeader>

				<CardContent className="p-0">
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow className="bg-muted/40 hover:bg-muted/40">
									<TableHead className="min-w-[180px] text-[11px] uppercase tracking-widest">
										Book Title
									</TableHead>
									<TableHead className="min-w-[140px] text-[11px] uppercase tracking-widest">
										Author Name
									</TableHead>
									<TableHead className="min-w-[110px] text-[11px] uppercase tracking-widest">
										Genre
									</TableHead>
									<TableHead className="min-w-[100px] text-right text-[11px] uppercase tracking-widest">
										Word Count
									</TableHead>
									<TableHead className="min-w-[130px] text-[11px] uppercase tracking-widest">
										Submitted
									</TableHead>
									<TableHead className="min-w-[110px] text-[11px] uppercase tracking-widest">
										Status
									</TableHead>
									<TableHead className="min-w-[100px] text-[11px] uppercase tracking-widest">
										Action
									</TableHead>
								</TableRow>
							</TableHeader>

							<TableBody>
								{filtered.map((m) => (
									<TableRow
										key={m.id}
										className="hover:bg-muted/30 transition-colors"
									>
										<TableCell className="font-medium text-sm">
											{m.title}
										</TableCell>
										<TableCell className="text-sm text-muted-foreground">
											{m.book_user?.user_profile?.name || "Unknown"}
										</TableCell>
										<TableCell className="text-sm">
											{m.book_genre?.title || "—"}
										</TableCell>
										<TableCell className="text-sm text-right tabular-nums">
											{formatWordCount(m.word_count)}
										</TableCell>
										<TableCell className="text-sm">
											{format(new Date(m.created_at), "MMM dd, yyyy")}
										</TableCell>
										<TableCell>{getStatusBadge(m.status)}</TableCell>
										<TableCell>
											<Button
												variant="outline"
												size="sm"
												onClick={() => handleViewManuscript(m)}
												className="flex items-center gap-1.5 h-7 text-xs px-3"
											>
												<Eye className="h-3 w-3" />
												View
											</Button>
										</TableCell>
									</TableRow>
								))}

								{filtered.length === 0 && (
									<TableRow>
										<TableCell
											colSpan={7}
											className="text-center py-14 text-muted-foreground text-sm"
										>
											No manuscripts match the current filters.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>

			{/* ── Modal ── */}
			<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
				<DialogContent className="w-[calc(100vw-2rem)] max-w-lg rounded-xl p-5 sm:p-6">
					<DialogHeader>
						<DialogTitle className="text-base font-semibold tracking-tight">
							{selectedManuscript?.title}
						</DialogTitle>
					</DialogHeader>

					{selectedManuscript && (
						<div className="space-y-5 mt-1">
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								{[
									{
										label: "Author",
										value: selectedManuscript.book_user?.user_profile?.name || "Unknown",
									},
									{
										label: "Genre",
										value: selectedManuscript.book_genre?.title || "—",
									},
									{
										label: "Word Count",
										value: `${formatWordCount(selectedManuscript.word_count)} words`,
									},
									{
										label: "Submitted",
										value: format(new Date(selectedManuscript.created_at), "MMMM dd, yyyy"),
									},
								].map(({ label, value }) => (
									<div key={label}>
										<p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">
											{label}
										</p>
										<p className="text-sm font-medium">{value}</p>
									</div>
								))}
								<div>
									<p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">
										Status
									</p>
									<div className="mt-1">
										{getStatusBadge(selectedManuscript.status)}
									</div>
								</div>
							</div>

							<div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
								<Button
									className="w-full sm:w-auto"
									onClick={() => {
										setIsModalOpen(false);
										navigate(`/assign-project?id=${selectedManuscript.id}`);
									}}
								>
									Assign Project
								</Button>
								<Button
									variant="outline"
									className="w-full sm:w-auto"
									onClick={() => {
										setIsModalOpen(false);
										navigate(`/editorial-suite?id=${selectedManuscript.id}`);
									}}
								>
									Open in Editorial Suite
								</Button>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default EditingQueue;