/** @format */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Search,
	Filter,
	CalendarIcon,
	ArrowUpDown,
	Eye,
	ChevronLeft,
	ChevronRight,
	X,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { GetAllProjectsAPI } from "@/services/Api/ProjectApi";
import { GetAllGenresAPI } from "@/services/Api/GenreApi";
import { GetAllEditorsAPI } from "@/services/Api/EditorApi";

const statuses = [
	"All Statuses",
	"draft",
	"in-editing",
	"completed",
	"feedback",
];

const getStatusBadge = (status: string) => {
	switch (status) {
		case "draft":
			return (
				<Badge variant="secondary" className="bg-muted text-muted-foreground whitespace-nowrap">
					Draft
				</Badge>
			);
		case "in-editing":
			return (
				<Badge className="bg-info text-info-foreground whitespace-nowrap">In Submission</Badge>
			);
		case "completed":
			return (
				<Badge className="bg-success text-success-foreground whitespace-nowrap">Completed</Badge>
			);
		case "feedback":
			return <Badge className="bg-orange-500 text-white whitespace-nowrap">Feedback</Badge>;
		default:
			return <Badge variant="secondary">{status}</Badge>;
	}
};

const getGenreColor = (genre: string) => {
	const colors = [
		"bg-blue-100 text-blue-700",
		"bg-green-100 text-green-700",
		"bg-purple-100 text-purple-700",
		"bg-pink-100 text-pink-700",
		"bg-yellow-100 text-yellow-700",
		"bg-indigo-100 text-indigo-700",
		"bg-orange-100 text-orange-700",
		"bg-teal-100 text-teal-700",
	];
	let hash = 0;
	for (let i = 0; i < genre.length; i++) {
		hash = genre.charCodeAt(i) + ((hash << 5) - hash);
	}
	return colors[Math.abs(hash) % colors.length];
};

// ─── Mobile Card Component ───────────────────────────────────────────────────
const ProjectCard = ({
	project,
	index,
	currentPage,
	itemsPerPage,
	onOpen,
}: {
	project: any;
	index: number;
	currentPage: number;
	itemsPerPage: number;
	onOpen: (id: number) => void;
}) => (
	<div className="rounded-xl border bg-card shadow-sm p-4 space-y-3 hover:shadow-md transition-shadow">
		{/* Row 1: Sr.No + Title + Status */}
		<div className="flex items-start justify-between gap-2">
			<div className="flex items-center gap-2 min-w-0">
				<span className="text-xs font-bold text-muted-foreground shrink-0">
					#{(currentPage - 1) * itemsPerPage + index + 1}
				</span>
				<p className="font-semibold text-sm text-foreground leading-tight truncate">
					{project.title}
				</p>
			</div>
			{getStatusBadge(project.status)}
		</div>

		{/* Row 2: Meta info grid */}
		<div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
			<div>
				<span className="text-xs text-muted-foreground block">Author</span>
				<span className="font-medium truncate block">{project.author}</span>
			</div>
			<div>
				<span className="text-xs text-muted-foreground block">Word Count</span>
				<span className="font-medium">{project.wordCount.toLocaleString()}</span>
			</div>
			<div>
				<span className="text-xs text-muted-foreground block">Genre</span>
				<Badge
					className={`${getGenreColor(project.genre)} mt-0.5 max-w-full truncate`}
					title={project.genre}
				>
					{project.genre}
				</Badge>
			</div>
			<div>
				<span className="text-xs text-muted-foreground block">Submitted</span>
				<span className="font-medium">
					{format(new Date(project.submissionDate), "MMM dd, yyyy")}
				</span>
			</div>
		</div>

		{/* Row 3: Editor + Action */}
		<div className="flex items-center justify-between gap-2 pt-1 border-t">
			<div className="min-w-0">
				<span className="text-xs text-muted-foreground block">Editor</span>
				{project.assignedEditor && project.assignedEditor !== "Not assigned yet" ? (
					<span className="text-sm font-medium truncate block">{project.assignedEditor}</span>
				) : (
					<span className="text-xs text-red-600 font-medium bg-red-50 px-2 py-0.5 rounded-md inline-block">
						⚠ Not Assigned
					</span>
				)}
			</div>
			<Button
				variant="outline"
				size="sm"
				onClick={() => onOpen(project.id)}
				className="shrink-0 flex items-center gap-1.5"
			>
				<Eye className="h-3.5 w-3.5" />
				Open
			</Button>
		</div>
	</div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const Projects = () => {
	const [projects, setProjects] = useState<any[]>([]);
	const [genreOptions, setGenreOptions] = useState<string[]>(["All Genres"]);
	const [editorOptions, setEditorOptions] = useState<string[]>(["All Editors"]);
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage] = useState(100);

	// Filters
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedGenre, setSelectedGenre] = useState("All Genres");
	const [selectedStatus, setSelectedStatus] = useState("All Statuses");
	const [selectedEditor, setSelectedEditor] = useState("All Editors");
	const [dateRange, setDateRange] = useState<{
		from: Date | undefined;
		to: Date | undefined;
	}>({ from: undefined, to: undefined });

	// Sorting
	const [sortField, setSortField] = useState<string>("");
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

	// Mobile filter panel toggle
	const [showFilters, setShowFilters] = useState(false);

	const navigate = useNavigate();
	const { toast } = useToast();

	const loadProjects = async () => {
		try {
			const res = await GetAllProjectsAPI();
			const apiData = res.data.data || [];
			const parsed = apiData.map((p: any) => ({
				id: p.id,
				title: p.title,
				author: p.book_user?.user_profile?.name || "Unknown Author",
				genre: p.book_genre?.title || "Unknown Genre",
				wordCount: p.word_count || 0,
				status: p.status || "draft",
				submissionDate: p.created_at,
				assignedEditor:
					p.book_editors?.length > 0
						? p.book_editors[0]?.editor?.name
						: "Not assigned yet",
			}));
			setProjects(parsed);
		} catch (error: any) {
			if (error.response?.data?.message === "You are not authorized to access this route") {
				return navigate("/unauthorized");
			}
			toast({
				title: "Failed to load projects",
				description: error.response?.data?.message || "Something went wrong",
				variant: "destructive",
			});
		}
	};

	const loadGenres = async () => {
		try {
			const res = await GetAllGenresAPI();
			const mapped = (res.data.data || []).map((g: any) => g.title);
			setGenreOptions(["All Genres", ...mapped]);
		} catch (error) {
			console.error("Failed to load genres", error);
		}
	};

	const loadEditors = async () => {
		try {
			const res = await GetAllEditorsAPI();
			const names = (res.data.data || []).map((e: any) => e.name);
			setEditorOptions(["All Editors", ...names]);
		} catch (error) {
			console.error("Failed to load editors", error);
		}
	};

	useEffect(() => {
		loadProjects();
		loadGenres();
		loadEditors();
	}, []);

	const roleId = Number(localStorage.getItem("role_id"));
	const isSuperAdmin = roleId === 1;

	// ── Filter + Sort ───────────────────────────────────────────────────────
	const filteredAndSortedProjects = projects
		.filter((project) => {
			const matchesSearch =
				project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
				project.author.toLowerCase().includes(searchTerm.toLowerCase());
			const matchesGenre =
				selectedGenre === "All Genres" || project.genre === selectedGenre;
			const matchesStatus =
				selectedStatus === "All Statuses" || project.status === selectedStatus;
			const matchesEditor =
				selectedEditor === "All Editors" ||
				project.assignedEditor === selectedEditor;
			let matchesDate = true;
			if (dateRange.from && dateRange.to) {
				const projectDate = new Date(project.submissionDate);
				matchesDate =
					projectDate >= dateRange.from && projectDate <= dateRange.to;
			}
			return matchesSearch && matchesGenre && matchesStatus && matchesEditor && matchesDate;
		})
		.sort((a, b) => {
			if (!sortField) return 0;
			let aValue = a[sortField as keyof typeof a];
			let bValue = b[sortField as keyof typeof b];
			if (sortField === "submissionDate") {
				aValue = new Date(aValue as string).getTime();
				bValue = new Date(bValue as string).getTime();
			}
			if (typeof aValue === "string") {
				aValue = aValue.toLowerCase();
				bValue = (bValue as string).toLowerCase();
			}
			if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
			if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
			return 0;
		});

	// ── Pagination ──────────────────────────────────────────────────────────
	const totalPages = Math.ceil(filteredAndSortedProjects.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const paginatedProjects = filteredAndSortedProjects.slice(startIndex, startIndex + itemsPerPage);

	const handleSort = (field: string) => {
		if (sortField === field) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortField(field);
			setSortDirection("asc");
		}
	};

	const handleOpenProject = (projectId: number) => {
		navigate(`/project-details?id=${projectId}`);
	};

	const clearFilters = () => {
		setSearchTerm("");
		setSelectedGenre("All Genres");
		setSelectedStatus("All Statuses");
		setSelectedEditor("All Editors");
		setDateRange({ from: undefined, to: undefined });
	};

	const hasActiveFilters =
		searchTerm ||
		selectedGenre !== "All Genres" ||
		selectedStatus !== "All Statuses" ||
		selectedEditor !== "All Editors" ||
		dateRange.from;

	// ── Pagination controls (shared) ────────────────────────────────────────
	const PaginationControls = () => (
		<div className="flex flex-col sm:flex-row items-center justify-between gap-3">
			<p className="text-sm text-muted-foreground order-2 sm:order-1">
				Showing {startIndex + 1}–
				{Math.min(startIndex + itemsPerPage, filteredAndSortedProjects.length)}{" "}
				of {filteredAndSortedProjects.length} projects
			</p>
			<div className="flex items-center gap-1.5 order-1 sm:order-2 flex-wrap justify-center">
				<Button
					variant="outline"
					size="sm"
					onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
					disabled={currentPage === 1}
				>
					<ChevronLeft className="h-4 w-4" />
					<span className="hidden sm:inline ml-1">Previous</span>
				</Button>
				{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
					<Button
						key={page}
						variant={currentPage === page ? "default" : "outline"}
						size="sm"
						onClick={() => setCurrentPage(page)}
						className={cn(
							"w-8 h-8 p-0",
							currentPage === page && "bg-primary text-primary-foreground",
						)}
					>
						{page}
					</Button>
				))}
				<Button
					variant="outline"
					size="sm"
					onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
					disabled={currentPage === totalPages}
				>
					<span className="hidden sm:inline mr-1">Next</span>
					<ChevronRight className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);

	return (
		<div className="space-y-5 px-2 sm:px-0">
			{/* ── Page Header ── */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
				<div>
					<h1 className="text-2xl sm:text-3xl font-bold text-foreground">Projects</h1>
					<p className="text-muted-foreground mt-1 text-sm sm:text-base">
						Manage all publishing projects and assignments
					</p>
				</div>
				{/* Mobile: toggle filter panel */}
				<Button
					variant="outline"
					size="sm"
					className="sm:hidden self-start flex items-center gap-2"
					onClick={() => setShowFilters((v) => !v)}
				>
					<Filter className="h-4 w-4" />
					Filters
					{hasActiveFilters && (
						<span className="ml-1 h-2 w-2 rounded-full bg-primary inline-block" />
					)}
				</Button>
			</div>

			{/* ── Filters Card ── */}
			<Card className={cn("sm:block", showFilters ? "block" : "hidden sm:block")}>
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center justify-between text-base">
						<span className="flex items-center gap-2">
							<Filter className="h-4 w-4" />
							Filters & Search
						</span>
						{/* Close button on mobile */}
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
					{/* Responsive grid: stacks on mobile, spreads on larger screens */}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
						{/* Search */}
						<div className="space-y-1.5 sm:col-span-2 lg:col-span-1 xl:col-span-1">
							<label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
								Search
							</label>
							<div className="relative">
								<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Search projects or authors..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-8 h-9"
								/>
							</div>
						</div>

						{/* Genre */}
						<div className="space-y-1.5">
							<label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
								Genre
							</label>
							<Select value={selectedGenre} onValueChange={setSelectedGenre}>
								<SelectTrigger className="h-9">
									<SelectValue />
								</SelectTrigger>
								<SelectContent className="bg-popover border border-border z-50">
									{genreOptions.map((genre) => (
										<SelectItem key={genre} value={genre} className="hover:bg-muted cursor-pointer">
											{genre}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Status */}
						<div className="space-y-1.5">
							<label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
								Status
							</label>
							<Select value={selectedStatus} onValueChange={setSelectedStatus}>
								<SelectTrigger className="h-9">
									<SelectValue />
								</SelectTrigger>
								<SelectContent className="bg-popover border border-border z-50">
									{statuses.map((status) => (
										<SelectItem key={status} value={status} className="hover:bg-muted cursor-pointer">
											{status === "All Statuses"
												? status
												: status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Editor (super admin only) */}
						{isSuperAdmin && (
							<div className="space-y-1.5">
								<label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
									Editor
								</label>
								<Select value={selectedEditor} onValueChange={setSelectedEditor}>
									<SelectTrigger className="h-9">
										<SelectValue />
									</SelectTrigger>
									<SelectContent className="bg-popover border border-border z-50">
										{editorOptions.map((editor) => (
											<SelectItem key={editor} value={editor} className="hover:bg-muted cursor-pointer">
												{editor}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						)}

						{/* Date Range */}
						<div className="space-y-1.5">
							<label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
								Date Range
							</label>
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										className={cn(
											"w-full h-9 justify-start text-left font-normal text-sm",
											!dateRange.from && "text-muted-foreground",
										)}
									>
										<CalendarIcon className="mr-2 h-3.5 w-3.5 shrink-0" />
										<span className="truncate">
											{dateRange.from ? (
												dateRange.to ? (
													<>
														{format(dateRange.from, "LLL dd")} – {format(dateRange.to, "LLL dd")}
													</>
												) : (
													format(dateRange.from, "LLL dd, y")
												)
											) : (
												"Pick dates"
											)}
										</span>
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0" align="start">
									<Calendar
										initialFocus
										mode="range"
										defaultMonth={dateRange.from}
										selected={{ from: dateRange.from, to: dateRange.to }}
										onSelect={(range) =>
											setDateRange({ from: range?.from, to: range?.to })
										}
										numberOfMonths={2}
										className="p-3 pointer-events-auto"
									/>
								</PopoverContent>
							</Popover>
						</div>
					</div>

					{/* Filter actions row */}
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-4 pt-3 border-t">
						<span className="text-sm text-muted-foreground order-2 sm:order-1">
							Showing{" "}
							<span className="font-semibold text-foreground">
								{filteredAndSortedProjects.length}
							</span>{" "}
							of{" "}
							<span className="font-semibold text-foreground">{projects.length}</span>{" "}
							projects
						</span>
						<Button
							variant="outline"
							size="sm"
							onClick={clearFilters}
							disabled={!hasActiveFilters}
							className="order-1 sm:order-2 self-start sm:self-auto flex items-center gap-1.5"
						>
							<X className="h-3.5 w-3.5" />
							Clear Filters
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* ── Projects: Mobile Cards / Desktop Table ── */}

			{/* Mobile card list (hidden on md+) */}
			<div className="grid grid-cols-1 gap-3 md:hidden">
				{paginatedProjects.length > 0 ? (
					paginatedProjects.map((project, index) => (
						<ProjectCard
							key={project.id}
							project={project}
							index={index}
							currentPage={currentPage}
							itemsPerPage={itemsPerPage}
							onOpen={handleOpenProject}
						/>
					))
				) : (
					<div className="text-center py-16 text-muted-foreground">
						No projects match your filters.
					</div>
				)}
			</div>

			{/* Desktop table (hidden below md) */}
			<Card className="hidden md:block overflow-hidden">
				<CardContent className="p-0">
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow className="bg-muted/40">
									<TableHead className="w-12 text-center">Sr.</TableHead>
									<TableHead
										className="cursor-pointer hover:bg-muted/60 min-w-[180px]"
										onClick={() => handleSort("title")}
									>
										<div className="flex items-center gap-1.5">
											Project Title
											<ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
										</div>
									</TableHead>
									<TableHead
										className="cursor-pointer hover:bg-muted/60 min-w-[140px]"
										onClick={() => handleSort("author")}
									>
										<div className="flex items-center gap-1.5">
											Author
											<ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
										</div>
									</TableHead>
									<TableHead className="min-w-[100px]">Genre</TableHead>
									<TableHead
										className="cursor-pointer hover:bg-muted/60 text-right min-w-[100px]"
										onClick={() => handleSort("wordCount")}
									>
										<div className="flex items-center justify-end gap-1.5">
											Words
											<ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
										</div>
									</TableHead>
									<TableHead className="min-w-[110px]">Status</TableHead>
									<TableHead
										className="cursor-pointer hover:bg-muted/60 min-w-[130px]"
										onClick={() => handleSort("submissionDate")}
									>
										<div className="flex items-center gap-1.5">
											Submitted
											<ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
										</div>
									</TableHead>
									<TableHead className="min-w-[150px]">Editor</TableHead>
									<TableHead className="min-w-[110px]">Action</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{paginatedProjects.length > 0 ? (
									paginatedProjects.map((project, index) => (
										<TableRow key={project.id} className="hover:bg-muted/40 transition-colors">
											<TableCell className="text-center text-muted-foreground text-sm">
												{(currentPage - 1) * itemsPerPage + index + 1}
											</TableCell>
											<TableCell className="font-medium">{project.title}</TableCell>
											<TableCell className="text-muted-foreground">{project.author}</TableCell>
											<TableCell>
												<Badge
													className={`${getGenreColor(project.genre)} max-w-[130px] truncate`}
													title={project.genre}
												>
													{project.genre}
												</Badge>
											</TableCell>
											<TableCell className="text-right tabular-nums">
												{project.wordCount.toLocaleString()}
											</TableCell>
											<TableCell>{getStatusBadge(project.status)}</TableCell>
											<TableCell className="text-sm">
												{format(new Date(project.submissionDate), "MMM dd, yyyy")}
											</TableCell>
											<TableCell>
												{project.assignedEditor &&
												project.assignedEditor !== "Not assigned yet" ? (
													<span className="font-medium text-sm">{project.assignedEditor}</span>
												) : (
													<span className="text-xs text-red-600 font-medium bg-red-50 px-2 py-1 rounded-md">
														⚠ Not Assigned
													</span>
												)}
											</TableCell>
											<TableCell>
												<Button
													variant="outline"
													size="sm"
													onClick={() => handleOpenProject(project.id)}
													className="flex items-center gap-1.5 h-8"
												>
													<Eye className="h-3.5 w-3.5" />
													Open
												</Button>
											</TableCell>
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell colSpan={9} className="text-center py-16 text-muted-foreground">
											No projects match your current filters.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>

			{/* ── Pagination ── */}
			{totalPages > 1 && <PaginationControls />}
		</div>
	);
};

export default Projects;