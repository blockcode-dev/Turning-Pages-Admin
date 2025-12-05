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
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { GetProjectDetailsAPI } from "@/services/Api/ProjectApi";

const getStatusBadge = (status: string) => {
	switch (status) {
		case "draft":
			return <Badge className="bg-muted text-muted-foreground">Draft</Badge>;
		case "in-editing":
			return <Badge className="bg-blue-500 text-white">In Editing</Badge>;
		case "completed":
			return <Badge className="bg-green-600 text-white">Completed</Badge>;
		default:
			return <Badge>{status}</Badge>;
	}
};

const ProjectDetails = () => {
	const [project, setProject] = useState<any>(null);
	const [selectedEditor, setSelectedEditor] = useState<string>("");

	const [searchParams] = useSearchParams();
	const projectId = searchParams.get("id");

	const navigate = useNavigate();
	const { toast } = useToast();

	const handleBack = () => navigate("/projects");

  const roleId = Number(localStorage.getItem("role_id"));
const isSuperAdmin = roleId === 1;


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

				// NEW CODE
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

			if (mapped.assignedEditor?.name) {
				setSelectedEditor(mapped.assignedEditor.name);
			}
		} catch (err) {
			console.error(err);
			toast({
				title: "Failed to load project",
				variant: "destructive",
			});
		}
	};

	const safeFormatDate = (dateString: string | undefined) => {
		if (!dateString) return "N/A";
		const dt = new Date(dateString);
		if (isNaN(dt.getTime())) return "N/A";
		return format(dt, "MMM dd, yyyy");
	};

	useEffect(() => {
		loadProjectDetails();
	}, []);

	if (!project)
		return (
			<p className="text-center text-muted-foreground mt-10">Loading...</p>
		);

	return (
		<div className="space-y-6 max-w-7xl">
			{/* HEADER */}
			<div className="flex items-center gap-4">
				<Button
					variant="ghost"
					size="icon"
					onClick={handleBack}
					className="hover:bg-muted"
				>
					<ArrowLeft className="h-4 w-4" />
				</Button>

				<div className="flex-1">
					<h1 className="text-3xl font-bold">{project.title}</h1>
					<p className="text-muted-foreground">Project Details & Management</p>
				</div>
			</div>

			{/* TOP SUMMARY CARD */}
			<Card>
				<CardHeader>
					<div className="flex items-start justify-between">
						<div className="space-y-4">
							<h2 className="text-xl font-semibold">{project.title}</h2>

							<div className="flex items-center gap-4 text-sm text-muted-foreground">
								<div className="flex items-center gap-1">
									<User className="h-4 w-4" />
									{project.author.name}
								</div>
								<div className="flex items-center gap-1">
									<Mail className="h-4 w-4" />
									{project.author.email}
								</div>

								<Badge
									variant="outline"
									className="text-green-600 border-green-600"
								>
									{project.author.accountStatus}
								</Badge>
							</div>

							<div className="flex items-center gap-6 text-sm">
								<div className="flex items-center gap-1">
									<Hash className="h-4 w-4" />
									{project.wordCount?.toLocaleString()} words
								</div>

								<div className="flex items-center gap-1">
									<FileText className="h-4 w-4" />
									{project.genre}
								</div>

								<div className="flex items-center gap-1">
									<Calendar className="h-4 w-4" />
									{safeFormatDate(project.submissionDate)}
								</div>
							</div>
						</div>

						<div>{getStatusBadge(project.status)}</div>
					</div>
				</CardHeader>
			</Card>

			{/* TABS */}
			<Tabs defaultValue="manuscript" className="space-y-6">
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="manuscript">Manuscript</TabsTrigger>
					<TabsTrigger value="user-info">User Info</TabsTrigger>
					<TabsTrigger value="editors">Editors</TabsTrigger>
				</TabsList>

				{/* MANUSCRIPT TAB */}
				<TabsContent value="manuscript">
					<Card>
						<CardHeader>
							<CardTitle>Chapters</CardTitle>
						</CardHeader>

						<CardContent>
							<div className="space-y-3">
								{project.chapters.map((ch: any, index: number) => (
									<div
										key={ch.id}
										className="flex items-center justify-between p-3 border rounded-lg"
									>
										<div>
											<h4 className="font-medium">{ch.title}</h4>
											<p className="text-muted-foreground text-sm">
												{ch.wordCount?.toLocaleString()} words
											</p>
										</div>
										<p className="text-muted-foreground">Chapter {index + 1}</p>
									</div>
								))}
							</div>

							<div className="pt-6 border-t mt-6">
								<Button
									onClick={() => navigate(`/editorial-suite?id=${project.id}`)}
									className="bg-primary text-primary-foreground"
								>
									<Edit3 className="h-4 w-4 mr-2" />
									Open Editorial Suite
								</Button>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* USER INFO TAB */}
				{/* USER INFO TAB */}
				<TabsContent value="user-info">
					<Card>
						<CardHeader>
							<CardTitle>Author Profile</CardTitle>
						</CardHeader>

						<CardContent>
							<div className="flex items-start gap-4">
								<Avatar className="h-16 w-16">
									<AvatarImage src={project.author.avatar} />
									<AvatarFallback>
										{project.author.name
											.split(" ")
											.map((n: string) => n[0])
											.join("")}
									</AvatarFallback>
								</Avatar>

								<div className="flex-1">
									<h3 className="text-lg font-semibold">
										{project.author.name}
									</h3>
									<p className="text-muted-foreground">
										{project.author.email}
									</p>
									<p className="text-sm text-muted-foreground mt-1">
										Member since {safeFormatDate(project.author.joinDate)}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* OTHER MANUSCRIPTS */}
					<Card className="mt-6">
						<CardHeader>
							<CardTitle>Other Manuscripts by {project.author.name}</CardTitle>
						</CardHeader>

						<CardContent>
							{project.otherManuscripts.length === 0 ? (
								<p className="text-muted-foreground">
									No other manuscripts as of now.
								</p>
							) : (
								<div className="space-y-3">
									{project.otherManuscripts.map((m: any) => (
										<div
											key={m.id}
											className="flex items-center justify-between p-3 border rounded-lg"
										>
											<div>
												<h4 className="font-medium">{m.title}</h4>
												<p className="text-sm text-muted-foreground">
													Submitted {safeFormatDate(m.created_at)}
												</p>
											</div>

											{/* Reuse your existing badge function */}
											{getStatusBadge(m.status)}
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* EDITORS TAB */}
				<TabsContent value="editors">
					<Card>
						<CardHeader>
							<CardTitle>Assigned Editor</CardTitle>
						</CardHeader>

						<CardContent>
							{project.assignedEditor ? (
								<>
									<div className="flex items-start gap-4 mb-6">
										<Avatar className="h-12 w-12">
											<AvatarImage src={project.assignedEditor.avatar} />
											<AvatarFallback>
												{project.assignedEditor.name
													.split(" ")
													.map((n: string) => n[0])
													.join("")}
											</AvatarFallback>
										</Avatar>

										<div className="flex-1">
											<h3 className="font-semibold">
												{project.assignedEditor.name}
											</h3>
											<p className="text-sm text-muted-foreground">
												{project.assignedEditor.email}
											</p>
											<Badge variant="outline" className="mt-2">
												{project.assignedEditor.role}
											</Badge>
										</div>
									</div>

									{isSuperAdmin && (
  <>
    <Label>Reassign Editor</Label>
    <div className="flex gap-2 mt-2">
      <Select value={selectedEditor} onValueChange={setSelectedEditor}>
        <SelectTrigger className="flex-1">
          <SelectValue />
        </SelectTrigger>

        <SelectContent className="bg-popover border z-50">
          <SelectItem value={project.assignedEditor.name}>
            {project.assignedEditor.name}
          </SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        onClick={() =>
          toast({
            title: "Editor reassigned",
            description: `Assigned to ${selectedEditor}`,
          })
        }
      >
        <UserCheck className="h-4 w-4 mr-1" />
        Reassign
      </Button>
    </div>
  </>
)}

								</>
							) : (
								<p className="text-muted-foreground">No editor assigned yet.</p>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
};

export default ProjectDetails;
