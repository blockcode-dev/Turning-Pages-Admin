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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Search,
	Filter,
	CalendarIcon,
	ChevronDown,
	ArrowUpDown,
	Eye,
	Archive,
	UserCheck,
	MoreHorizontal,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { GetAllProjectsAPI } from "@/services/Api/ProjectApi";
import { GetAllGenresAPI } from "@/services/Api/GenreApi";
import { GetAllEditorsAPI } from "@/services/Api/EditorApi";

const genres = [
	"All Genres",
	"Technology",
	"Poetry",
	"Science Fiction",
	"Historical Fiction",
	"Business",
	"Romance",
	"Mystery",
	"Cookbook",
];
const statuses = ["All Statuses", "draft", "in-editing", "completed"];

const editors = [
	"All Editors",
	"Dr. Emily Carter",
	"Marcus Rodriguez",
	"Jessica Chen",
	"David Thompson",
	"Lisa Wang",
];

const getStatusBadge = (status: string) => {
	switch (status) {
		case "draft":
			return (
				<Badge variant="secondary" className="bg-muted text-muted-foreground">
					Draft
				</Badge>
			);

		case "in-editing":
			return <Badge className="bg-info text-info-foreground">In Editing</Badge>;

		case "completed":
			return (
				<Badge className="bg-success text-success-foreground">Completed</Badge>
			);

		default:
			return <Badge variant="secondary">{status}</Badge>;
	}
};

const Projects = () => {
	const [projects, setProjects] = useState<any[]>([]);
	const [genres, setGenres] = useState<string[]>(["All Genres"]);
	const [selectedProjects, setSelectedProjects] = useState<number[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage] = useState(5);
	const [editors, setEditors] = useState<string[]>(["All Editors"]);

	// Filters
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedGenre, setSelectedGenre] = useState("All Genres");
	const [selectedStatus, setSelectedStatus] = useState("All Statuses");
	const [selectedEditor, setSelectedEditor] = useState("All Editors");
	const [dateRange, setDateRange] = useState<{
		from: Date | undefined;
		to: Date | undefined;
	}>({
		from: undefined,
		to: undefined,
	});

	// Sorting
	const [sortField, setSortField] = useState<string>("");
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

	const navigate = useNavigate();
	const { toast } = useToast();

	const loadProjects = async () => {
		try {
			const res = await GetAllProjectsAPI();
			const apiData = res.data.data || [];

			// Normalize data to match frontend structure
			const parsed = apiData.map((p: any) => ({
				id: p.id,
				title: p.title,
				author: p.book_user?.user_profile?.name || "Unknown Author",
				genre: p.book_genre?.title || "Unknown Genre",
				wordCount: p.word_count || 0,
				status: p.status || "draft",
				submissionDate: p.created_at,

				// 🔥 Assigned Editor Logic Updated
				assignedEditor:
					p.book_editors?.length > 0
						? p.book_editors[0]?.editor?.name
						: "Not assigned yet",
			}));

			setProjects(parsed);
		} catch (error: any) {
			// Unauthorized access redirect
			if (
				error.response?.data?.message ===
				"You are not authorized to access this route"
			) {
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
			const apiGenres = res.data.data || [];

			const mapped = apiGenres.map((g: any) => g.title);

			setGenres(["All Genres", ...mapped]);
		} catch (error) {
			console.error("Failed to load genres", error);
		}
	};

	const loadEditors = async () => {
		try {
			const res = await GetAllEditorsAPI();
			const apiEditors = res.data.data || [];

			const names = apiEditors.map((editor: any) => editor.name);

			setEditors(["All Editors", ...names]);
		} catch (error) {
			console.error("Failed to load editors", error);
		}
	};

	useEffect(() => {
		loadProjects();
		loadGenres();
		loadEditors();
	}, []);

	// Filter and sort projects
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

			return (
				matchesSearch &&
				matchesGenre &&
				matchesStatus &&
				matchesEditor &&
				matchesDate
			);
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

	// Pagination
	const totalPages = Math.ceil(filteredAndSortedProjects.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const paginatedProjects = filteredAndSortedProjects.slice(
		startIndex,
		startIndex + itemsPerPage
	);

	const handleSort = (field: string) => {
		if (sortField === field) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortField(field);
			setSortDirection("asc");
		}
	};

	const handleSelectProject = (projectId: number) => {
		setSelectedProjects((prev) =>
			prev.includes(projectId)
				? prev.filter((id) => id !== projectId)
				: [...prev, projectId]
		);
	};

	const handleSelectAll = () => {
		if (selectedProjects.length === paginatedProjects.length) {
			setSelectedProjects([]);
		} else {
			setSelectedProjects(paginatedProjects.map((p) => p.id));
		}
	};

	const handleBulkAction = (action: string) => {
		if (selectedProjects.length === 0) {
			toast({
				title: "No Projects Selected",
				description: "Please select projects to perform bulk actions.",
				variant: "destructive",
			});
			return;
		}

		switch (action) {
			case "assign":
				toast({
					title: "Assign Editor",
					description: `${selectedProjects.length} project(s) ready for editor assignment.`,
				});
				break;
			case "status":
				toast({
					title: "Status Changed",
					description: `Status updated for ${selectedProjects.length} project(s).`,
				});
				break;
			case "archive":
				toast({
					title: "Projects Archived",
					description: `${selectedProjects.length} project(s) have been archived.`,
				});
				break;
		}
		setSelectedProjects([]);
	};

	const handleOpenProject = (projectId: number) => {
		navigate(`/project-details?id=${projectId}`);
	};

	const roleId = Number(localStorage.getItem("role_id"));
	const isSuperAdmin = roleId === 1;

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-foreground">Projects</h1>
					<p className="text-muted-foreground mt-2">
						Manage all publishing projects and assignments
					</p>
				</div>

				{/* Bulk Actions */}
				{selectedProjects.length > 0 && (
					<div className="flex items-center gap-2">
						<span className="text-sm text-muted-foreground">
							{selectedProjects.length} selected
						</span>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" size="sm">
									Bulk Actions
									<ChevronDown className="h-4 w-4 ml-2" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="bg-popover border border-border">
								<DropdownMenuItem
									onClick={() => handleBulkAction("assign")}
									className="hover:bg-muted cursor-pointer"
								>
									<UserCheck className="h-4 w-4 mr-2" />
									Assign Editor
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => handleBulkAction("status")}
									className="hover:bg-muted cursor-pointer"
								>
									<ArrowUpDown className="h-4 w-4 mr-2" />
									Change Status
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => handleBulkAction("archive")}
									className="hover:bg-muted cursor-pointer"
								>
									<Archive className="h-4 w-4 mr-2" />
									Archive
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				)}
			</div>

			{/* Filters */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Filter className="h-5 w-5" />
						Filters & Search
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
						<div className="space-y-2">
							<label className="text-sm font-medium">Search</label>
							<div className="relative">
								<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Search projects or authors..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-8"
								/>
							</div>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium">Genre</label>
							<Select value={selectedGenre} onValueChange={setSelectedGenre}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>

								<SelectContent className="bg-popover border border-border z-50">
									{genres.map((genre) => (
										<SelectItem
											key={genre}
											value={genre}
											className="hover:bg-muted cursor-pointer"
										>
											{genre}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium">Status</label>
							<Select value={selectedStatus} onValueChange={setSelectedStatus}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent className="bg-popover border border-border z-50">
									{statuses.map((status) => (
										<SelectItem
											key={status}
											value={status}
											className="hover:bg-muted cursor-pointer"
										>
											{status === "All Statuses"
												? status
												: status.charAt(0).toUpperCase() +
												  status.slice(1).replace("-", " ")}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{isSuperAdmin && (
							<div className="space-y-2">
								<label className="text-sm font-medium">Editor</label>
								<Select
									value={selectedEditor}
									onValueChange={setSelectedEditor}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent className="bg-popover border border-border z-50">
										{editors.map((editor) => (
											<SelectItem
												key={editor}
												value={editor}
												className="hover:bg-muted cursor-pointer"
											>
												{editor}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						)}

						<div className="space-y-2">
							<label className="text-sm font-medium">Date Range</label>
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										className={cn(
											"justify-start text-left font-normal",
											!dateRange.from && "text-muted-foreground"
										)}
									>
										<CalendarIcon className="mr-2 h-4 w-4" />
										{dateRange.from ? (
											dateRange.to ? (
												<>
													{format(dateRange.from, "LLL dd")} -{" "}
													{format(dateRange.to, "LLL dd")}
												</>
											) : (
												format(dateRange.from, "LLL dd, y")
											)
										) : (
											<span>Pick dates</span>
										)}
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

					<div className="flex items-center gap-2 mt-4">
						<Button
							variant="outline"
							size="sm"
							onClick={() => {
								setSearchTerm("");
								setSelectedGenre("All Genres");
								setSelectedStatus("All Statuses");
								setSelectedEditor("All Editors");
								setDateRange({ from: undefined, to: undefined });
							}}
						>
							Clear Filters
						</Button>
						<span className="text-sm text-muted-foreground">
							Showing {filteredAndSortedProjects.length} of {projects.length}{" "}
							projects
						</span>
					</div>
				</CardContent>
			</Card>

			{/* Projects Table */}
			<Card>
				<CardContent className="p-0">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-12">
									<Checkbox
										checked={
											selectedProjects.length === paginatedProjects.length &&
											paginatedProjects.length > 0
										}
										onCheckedChange={handleSelectAll}
									/>
								</TableHead>
								<TableHead
									className="cursor-pointer hover:bg-muted/50"
									onClick={() => handleSort("title")}
								>
									<div className="flex items-center gap-2">
										Project Title
										<ArrowUpDown className="h-4 w-4" />
									</div>
								</TableHead>
								<TableHead
									className="cursor-pointer hover:bg-muted/50"
									onClick={() => handleSort("author")}
								>
									<div className="flex items-center gap-2">
										Author Name
										<ArrowUpDown className="h-4 w-4" />
									</div>
								</TableHead>
								<TableHead>Genre</TableHead>
								<TableHead
									className="cursor-pointer hover:bg-muted/50"
									onClick={() => handleSort("wordCount")}
								>
									<div className="flex items-center gap-2">
										Word Count
										<ArrowUpDown className="h-4 w-4" />
									</div>
								</TableHead>
								<TableHead>Status</TableHead>
								<TableHead
									className="cursor-pointer hover:bg-muted/50"
									onClick={() => handleSort("submissionDate")}
								>
									<div className="flex items-center gap-2">
										Submission Date
										<ArrowUpDown className="h-4 w-4" />
									</div>
								</TableHead>
								<TableHead>Assigned Editor</TableHead>
								<TableHead>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{paginatedProjects.map((project) => (
								<TableRow key={project.id} className="hover:bg-muted/50">
									<TableCell>
										<Checkbox
											checked={selectedProjects.includes(project.id)}
											onCheckedChange={() => handleSelectProject(project.id)}
										/>
									</TableCell>
									<TableCell className="font-medium">{project.title}</TableCell>
									<TableCell>{project.author}</TableCell>
									<TableCell>
										<Badge variant="outline">{project.genre}</Badge>
									</TableCell>
									<TableCell>{project.wordCount.toLocaleString()}</TableCell>
									<TableCell>{getStatusBadge(project.status)}</TableCell>
									<TableCell>
										{format(new Date(project.submissionDate), "MMM dd, yyyy")}
									</TableCell>
									<TableCell>
										{project.assignedEditor ? (
											project.assignedEditor
										) : (
											<span className="text-muted-foreground">
												Not assigned yet
											</span>
										)}
									</TableCell>

									<TableCell>
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleOpenProject(project.id)}
											className="flex items-center gap-2"
										>
											<Eye className="h-4 w-4" />
											Open Project
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						Showing {startIndex + 1} to{" "}
						{Math.min(
							startIndex + itemsPerPage,
							filteredAndSortedProjects.length
						)}{" "}
						of {filteredAndSortedProjects.length} projects
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
							disabled={currentPage === 1}
						>
							<ChevronLeft className="h-4 w-4" />
							Previous
						</Button>
						<div className="flex items-center gap-1">
							{Array.from({ length: totalPages }, (_, i) => i + 1).map(
								(page) => (
									<Button
										key={page}
										variant={currentPage === page ? "default" : "outline"}
										size="sm"
										onClick={() => setCurrentPage(page)}
										className={
											currentPage === page
												? "bg-primary text-primary-foreground"
												: ""
										}
									>
										{page}
									</Button>
								)
							)}
						</div>
						<Button
							variant="outline"
							size="sm"
							onClick={() =>
								setCurrentPage((prev) => Math.min(prev + 1, totalPages))
							}
							disabled={currentPage === totalPages}
						>
							Next
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</div>
			)}
		</div>
	);
};

export default Projects;
