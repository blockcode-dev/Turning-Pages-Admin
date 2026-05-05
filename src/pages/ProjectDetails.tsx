/** @format */

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import {
	ArrowLeft,
	User,
	Mail,
	Hash,
	FileText,
	Calendar,
	Edit3,
	UserCheck,
	BookOpen,
	Layers,
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
	AssignEditorToBookAPI,
	GetProjectDetailsAPI,
} from "@/services/Api/ProjectApi";
import { GetAllEditorsAPI } from "@/services/Api/EditorApi";

const getStatusBadge = (status: string) => {
	switch (status) {
		case "draft":
			return (
				<Badge className="bg-muted text-muted-foreground whitespace-nowrap">
					Draft
				</Badge>
			);
		case "in-editing":
			return (
				<Badge className="bg-blue-500 text-white whitespace-nowrap">
					In Editing
				</Badge>
			);
		case "completed":
			return (
				<Badge className="bg-green-600 text-white whitespace-nowrap">
					Completed
				</Badge>
			);
		case "feedback":
			return (
				<Badge className="bg-orange-500 text-white whitespace-nowrap">
					Feedback
				</Badge>
			);
		default:
			return <Badge className="whitespace-nowrap">{status}</Badge>;
	}
};

const ProjectDetails = () => {
	const [project, setProject] = useState<any>(null);
	const [selectedEditor, setSelectedEditor] = useState<string>("");
	const [apiEditors, setApiEditors] = useState<any[]>([]);

	const [searchParams] = useSearchParams();
	const projectId = searchParams.get("id");

	const navigate = useNavigate();
	const { toast } = useToast();

	const roleId = Number(localStorage.getItem("role_id"));
	const isSuperAdmin = roleId === 1;

	const safeFormatDate = (dateString: string | undefined) => {
		if (!dateString) return "N/A";
		const dt = new Date(dateString);
		if (isNaN(dt.getTime())) return "N/A";
		return format(dt, "MMM dd, yyyy");
	};

	const loadProjectDetails = async () => {
		try {
			const res = await GetProjectDetailsAPI(projectId);
			const p = res.data.data;

			const mapped = {
				id: p.id,
				title: p.title,
				wordCount: p.word_count,
				genre: p.book_genre?.title ?? "Unknown",
				submissionDate: p.created_at,
				status: p.status,

				author: {
					name: p.book_user?.user_profile?.name ?? "Unknown Author",
					email: p.book_user?.email ?? "",
					avatar: "/api/placeholder/48/48",
					joinDate: p.book_user?.user_profile?.created_at ?? "",
					accountStatus: p.book_user?.status ?? "",
					totalManuscripts: p.book_user?.user_books?.length ?? 0,
				},

				assignedEditor: p.book_editors?.length
					? {
							name: p.book_editors[0].editor?.name ?? "Unknown",
							email: p.book_editors[0].editor?.email ?? "",
							role: p.book_editors[0].editor?.admin_role?.name ?? "",
							avatar: "/api/placeholder/48/48",
						}
					: null,

				chapters:
					p.book_chapters?.map((ch: any) => ({
						id: ch.id,
						title: ch.title,
						wordCount: ch.word_count,
					})) ?? [],

				otherManuscripts:
					p.book_user?.user_books
						?.filter((b: any) => b.id !== p.id)
						.map((b: any) => ({
							id: b.id,
							title: b.title,
							status: b.status,
							created_at: b.created_at,
						})) ?? [],
			};

			setProject(mapped);

			if (p.book_editors?.length) {
				setSelectedEditor(p.book_editors[0].editor_id?.toString());
			}
		} catch (err) {
			console.error(err);
			toast({ title: "Failed to load project", variant: "destructive" });
		}
	};

	const loadEditors = async () => {
		try {
			const res = await GetAllEditorsAPI();
			setApiEditors(res.data.data || []);
		} catch (err) {
			console.error("Failed to load editors", err);
		}
	};

	useEffect(() => {
		loadEditors();
		loadProjectDetails();
	}, []);

	const handleAssignProject = async () => {
		if (!selectedEditor) {
			return toast({
				title: "Error",
				description: "Please select an editor.",
				variant: "destructive",
			});
		}
		try {
			await AssignEditorToBookAPI({
				editor_id: Number(selectedEditor),
				book_id: Number(project.id),
			});
			toast({
				title: "Editor Assigned",
				description: `"${project.title}" has been assigned successfully.`,
			});
			loadProjectDetails();
		} catch (err: any) {
			toast({
				title: "Assignment Failed",
				description: err.response?.data?.message || "Something went wrong.",
				variant: "destructive",
			});
		}
	};

	if (!project)
		return (
			<div className="flex items-center justify-center min-h-[40vh]">
				<p className="text-muted-foreground animate-pulse">Loading project...</p>
			</div>
		);

	const isInEditing = project.status?.toLowerCase().trim() === "in-editing";

	return (
		<div className="space-y-5 max-w-7xl px-2 sm:px-0">

			{/* ── Header ── */}
			<div className="flex items-start gap-3">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => navigate("/projects")}
					className="hover:bg-muted mt-0.5 shrink-0"
				>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<div className="min-w-0">
					<h1 className="text-2xl sm:text-3xl font-bold leading-tight truncate">
						{project.title}
					</h1>
					<p className="text-muted-foreground text-sm mt-0.5">
						Project Details & Management
					</p>
				</div>
			</div>

			{/* ── Summary Card ── */}
			<Card>
				<CardHeader className="pb-4">
					<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
						{/* Left: title + meta */}
						<div className="space-y-3 min-w-0">
							<h2 className="text-lg sm:text-xl font-semibold truncate">
								{project.title}
							</h2>

							{/* Author info — wraps on mobile */}
							<div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
								<span className="flex items-center gap-1.5">
									<User className="h-3.5 w-3.5 shrink-0" />
									{project.author.name}
								</span>
								<span className="flex items-center gap-1.5 min-w-0">
									<Mail className="h-3.5 w-3.5 shrink-0" />
									<span className="truncate">{project.author.email}</span>
								</span>
								<Badge
									variant="outline"
									className="text-green-600 border-green-600"
								>
									{project.author.accountStatus}
								</Badge>
							</div>

							{/* Book meta — wraps on mobile */}
							<div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm">
								<span className="flex items-center gap-1.5 text-muted-foreground">
									<Hash className="h-3.5 w-3.5 shrink-0" />
									{project.wordCount?.toLocaleString()} words
								</span>
								<span className="flex items-center gap-1.5 text-muted-foreground">
									<FileText className="h-3.5 w-3.5 shrink-0" />
									{project.genre}
								</span>
								<span className="flex items-center gap-1.5 text-muted-foreground">
									<Calendar className="h-3.5 w-3.5 shrink-0" />
									{safeFormatDate(project.submissionDate)}
								</span>
							</div>
						</div>

						{/* Right: status badge */}
						<div className="shrink-0">{getStatusBadge(project.status)}</div>
					</div>
				</CardHeader>
			</Card>

			{/* ── Tabs ── */}
			<Tabs defaultValue="manuscript" className="space-y-5">
				{/* Tab list — scrollable on very small screens */}
				<div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
					<TabsList className="grid grid-cols-4 min-w-[360px] w-full">
						<TabsTrigger value="manuscript" className="text-xs sm:text-sm">
							Manuscript
						</TabsTrigger>
						<TabsTrigger value="cover-generator" className="text-xs sm:text-sm">
							<span className="hidden sm:inline">Cover Generator</span>
							<span className="sm:hidden">Cover</span>
						</TabsTrigger>
						<TabsTrigger value="user-info" className="text-xs sm:text-sm">
							<span className="hidden sm:inline">User Info</span>
							<span className="sm:hidden">User</span>
						</TabsTrigger>
						<TabsTrigger value="editors" className="text-xs sm:text-sm">
							Editors
						</TabsTrigger>
					</TabsList>
				</div>

				{/* ── Manuscript Tab ── */}
				<TabsContent value="manuscript">
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="flex items-center gap-2 text-base sm:text-lg">
								<Layers className="h-4 w-4" />
								Chapters
								<span className="ml-auto text-sm font-normal text-muted-foreground">
									{project.chapters.length} chapter
									{project.chapters.length !== 1 ? "s" : ""}
								</span>
							</CardTitle>
						</CardHeader>

						<CardContent className="space-y-3">
							{project.chapters.length === 0 ? (
								<p className="text-muted-foreground text-sm">
									No chapters found.
								</p>
							) : (
								project.chapters.map((ch: any, index: number) => (
									<div
										key={ch.id}
										className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/40 transition-colors gap-3"
									>
										<div className="min-w-0">
											<h4 className="font-medium text-sm truncate">{ch.title}</h4>
											<p className="text-muted-foreground text-xs mt-0.5">
												{ch.wordCount?.toLocaleString()} words
											</p>
										</div>
										<span className="text-xs text-muted-foreground shrink-0">
											Ch. {index + 1}
										</span>
									</div>
								))
							)}

							<div className="pt-5 border-t mt-2">
								<Button
									disabled={!isInEditing}
									onClick={() => {
										if (isInEditing) navigate(`/editorial-suite?id=${project.id}`);
									}}
									className="w-full sm:w-auto bg-primary text-primary-foreground disabled:opacity-50"
								>
									<Edit3 className="h-4 w-4 mr-2" />
									Open Editorial Suite
								</Button>
								{!isInEditing && (
									<p className="text-xs text-muted-foreground mt-2">
										Editorial Suite is only available when the project is{" "}
										<span className="font-medium">In Editing</span>.
									</p>
								)}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* ── Cover Generator Tab ── */}
				<TabsContent value="cover-generator">
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-base sm:text-lg">
								Generate Book Cover
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<p className="text-muted-foreground text-sm">
								Create an AI-generated book cover using the book's title, genre,
								and author details.
							</p>
							<Button
								className="w-full sm:w-auto bg-primary text-primary-foreground"
								onClick={() => navigate(`/cover-generator?id=${project.id}`)}
							>
								Open Cover Generator
							</Button>
						</CardContent>
					</Card>
				</TabsContent>

				{/* ── User Info Tab ── */}
				<TabsContent value="user-info" className="space-y-5">
					{/* Author Profile Card */}
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="flex items-center gap-2 text-base sm:text-lg">
								<User className="h-4 w-4" />
								Author Profile
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex items-start gap-4">
								<Avatar className="h-14 w-14 shrink-0">
									<AvatarImage src={project.author.avatar} />
									<AvatarFallback>
										{project.author.name
											.split(" ")
											.map((n: string) => n[0])
											.join("")}
									</AvatarFallback>
								</Avatar>
								<div className="min-w-0 flex-1">
									<h3 className="text-base font-semibold">{project.author.name}</h3>
									<p className="text-muted-foreground text-sm truncate">
										{project.author.email}
									</p>
									<p className="text-xs text-muted-foreground mt-1">
										Member since {safeFormatDate(project.author.joinDate)}
									</p>
									<Badge variant="outline" className="mt-2 text-green-600 border-green-600">
										{project.author.accountStatus}
									</Badge>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Other Manuscripts Card */}
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="flex items-center gap-2 text-base sm:text-lg">
								<BookOpen className="h-4 w-4" />
								Other Manuscripts by {project.author.name}
								<span className="ml-auto text-sm font-normal text-muted-foreground">
									{project.otherManuscripts.length} total
								</span>
							</CardTitle>
						</CardHeader>
						<CardContent>
							{project.otherManuscripts.length === 0 ? (
								<p className="text-muted-foreground text-sm">
									No other manuscripts as of now.
								</p>
							) : (
								<div className="space-y-3">
									{project.otherManuscripts.map((m: any) => (
										<div
											key={m.id}
											className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/40 transition-colors gap-3"
										>
											<div className="min-w-0">
												<h4 className="font-medium text-sm truncate">{m.title}</h4>
												<p className="text-xs text-muted-foreground mt-0.5">
													Submitted {safeFormatDate(m.created_at)}
												</p>
											</div>
											<div className="shrink-0">{getStatusBadge(m.status)}</div>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* ── Editors Tab ── */}
				<TabsContent value="editors">
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="flex items-center gap-2 text-base sm:text-lg">
								<UserCheck className="h-4 w-4" />
								Assigned Editor
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-5">
							{/* No editor assigned */}
							{!project.assignedEditor && (
								<div className="flex items-center gap-2 text-muted-foreground text-sm p-3 bg-muted/40 rounded-lg">
									<UserCheck className="h-4 w-4 shrink-0" />
									No editor assigned yet.
								</div>
							)}

							{/* Current editor */}
							{project.assignedEditor && (
								<div className="flex items-start gap-4 p-4 border rounded-lg bg-muted/20">
									<Avatar className="h-11 w-11 shrink-0">
										<AvatarImage src={project.assignedEditor.avatar} />
										<AvatarFallback>
											{project.assignedEditor.name
												.split(" ")
												.map((n: string) => n[0])
												.join("")}
										</AvatarFallback>
									</Avatar>
									<div className="min-w-0 flex-1">
										<h3 className="font-semibold text-sm">
											{project.assignedEditor.name}
										</h3>
										<p className="text-xs text-muted-foreground truncate">
											{project.assignedEditor.email}
										</p>
										<Badge variant="outline" className="mt-2 text-xs">
											{project.assignedEditor.role}
										</Badge>
									</div>
								</div>
							)}

							{/* Super admin: assign/reassign */}
							{isSuperAdmin && isInEditing && (
								<div className="space-y-2 pt-2 border-t">
									<Label className="text-sm font-medium">
										{project.assignedEditor ? "Reassign Editor" : "Assign Editor"}
									</Label>
									<div className="flex flex-col sm:flex-row gap-2 mt-1">
										<Select
											value={selectedEditor}
											onValueChange={setSelectedEditor}
										>
											<SelectTrigger className="flex-1">
												<SelectValue placeholder="Choose an editor" />
											</SelectTrigger>
											<SelectContent>
												{apiEditors.map((editor) => (
													<SelectItem
														key={editor.id}
														value={editor.id.toString()}
													>
														{editor.name} — {editor.admin_role?.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<Button
											onClick={handleAssignProject}
											className="flex items-center justify-center gap-1.5 sm:w-auto w-full"
										>
											<UserCheck className="h-4 w-4" />
											Save
										</Button>
									</div>
								</div>
							)}

							{/* Non super admin read-only note */}
							{!isSuperAdmin && project.assignedEditor && (
								<p className="text-xs text-muted-foreground">
									You cannot modify editor assignment.
								</p>
							)}

							{/* In-editing note for super admin when not in-editing */}
							{isSuperAdmin && !isInEditing && (
								<p className="text-xs text-muted-foreground">
									Editor assignment is only available when the project is{" "}
									<span className="font-medium">In Editing</span>.
								</p>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
};

export default ProjectDetails;