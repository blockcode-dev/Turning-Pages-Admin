/** @format */

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, BookOpen, Hash, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import {
	AssignEditorToBookAPI,
	GetProjectDetailsAPI,
} from "@/services/Api/ProjectApi";
import { GetAllEditorsAPI } from "@/services/Api/EditorApi";

const AssignProject = () => {
	const [manuscript, setManuscript] = useState<any>(null);
	const [selectedEditor, setSelectedEditor] = useState<string>("");

	const navigate = useNavigate();
	const { toast } = useToast();

	const [searchParams] = useSearchParams();
	const projectId = searchParams.get("id");

	const [apiEditors, setApiEditors] = useState<any[]>([]);
	const [assignedEditor, setAssignedEditor] = useState<any>(null);

	const loginRole = Number(localStorage.getItem("role_id")); // 1 = Super Admin

	const loadProject = async () => {
  try {
    const res = await GetProjectDetailsAPI(projectId!);
    const p = res.data.data;

    const mapped = {
      id: p.id,
      title: p.title,
      author: p.book_user?.user_profile?.name ?? "Unknown",
      genre: p.book_genre?.title ?? "-",
      wordCount: p.word_count,
      submissionDate: p.created_at,
      status: p.status,
    };

    setManuscript(mapped);

    const assigned = p.book_editors?.[0]?.editor ?? null;
    setAssignedEditor(assigned);

    // PRESELECT FOR SUPER ADMIN
    if (loginRole === 1 && assigned?.id) {
      setSelectedEditor(String(assigned.id));
    }

  } catch (err: any) {
    if (
      err.response?.data?.message ===
      "You are not authorized to access this route"
    ) {
      return navigate("/unauthorized");
    }
    toast({
      title: "Failed to load manuscript",
      variant: "destructive",
    });
  }
};


	const loadEditors = async () => {
		try {
			const res = await GetAllEditorsAPI();
			const editors = res.data.data || [];
			setApiEditors(editors);
		} catch (err) {
			console.error("Failed to load editors", err);
		}
	};

	useEffect(() => {
		loadProject();
		loadEditors();
	}, []);

	const timeline = ["draft", "in-editing", "completed"];

	const handleAssignProject = async () => {
		if (!selectedEditor) {
			toast({
				title: "Error",
				description: "Please select an editor to assign the project.",
				variant: "destructive",
			});
			return;
		}

		try {
			const payload = {
				editor_id: Number(selectedEditor),
				book_id: Number(manuscript.id),
			};

			await AssignEditorToBookAPI(payload);

			toast({
				title: "Project Assigned Successfully",
				description: `"${manuscript.title}" has been assigned successfully.`,
			});

			navigate("/editing-queue");
		} catch (err: any) {
			toast({
				title: "Assignment Failed",
				description: err.response?.data?.message || "Something went wrong.",
				variant: "destructive",
			});
		}
	};

	const handleBack = () => navigate("/editing-queue");

	if (!manuscript) return <p className="mt-10 text-center">Loading…</p>;

	return (
		<div className="space-y-6">
			{/* HEADER */}
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="icon" onClick={handleBack}>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<div>
					<h1 className="text-2xl sm:text-3xl font-bold text-foreground">Assign Project</h1>
					<p className="text-muted-foreground mt-1">
						Assign manuscript to an available editor
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* LEFT COLUMN */}
				<div className="space-y-6">
					{/* MANUSCRIPT DETAILS */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<BookOpen className="h-5 w-5 text-primary" />
								Manuscript Details
							</CardTitle>
						</CardHeader>

						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div>
									<div className="flex items-center gap-2 text-sm text-muted-foreground">
										<BookOpen className="h-4 w-4" />
										Title
									</div>
									<p className="font-semibold">{manuscript.title}</p>
								</div>

								<div>
									<div className="flex items-center gap-2 text-sm text-muted-foreground">
										<User className="h-4 w-4" />
										Author
									</div>
									<p className="font-semibold">{manuscript.author}</p>
								</div>

								<div>
									<div className="flex items-center gap-2 text-sm text-muted-foreground">
										<Hash className="h-4 w-4" />
										Genre
									</div>
									<Badge variant="outline">{manuscript.genre}</Badge>
								</div>

								<div>
									<div className="flex items-center gap-2 text-sm text-muted-foreground">
										<Hash className="h-4 w-4" />
										Word Count
									</div>
									<p className="font-semibold">
										{manuscript.wordCount?.toLocaleString()}
									</p>
								</div>

								<div className="col-span-2">
									<div className="flex items-center gap-2 text-sm text-muted-foreground">
										<Calendar className="h-4 w-4" />
										Submission Date
									</div>
									<p className="font-semibold">
										{new Date(manuscript.submissionDate).toLocaleDateString(
											"en-US",
											{
												year: "numeric",
												month: "long",
												day: "numeric",
											}
										)}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* EDITOR ASSIGNMENT */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<User className="h-5 w-5 text-primary" />
								Editor Assignment
							</CardTitle>
						</CardHeader>

						<CardContent className="space-y-4">
							{/* If user is NOT Super Admin */}
							{loginRole !== 1 ? (
								<div>
									<p className="text-sm font-medium text-muted-foreground">
										Assigned Editor
									</p>

									{assignedEditor ? (
										<div className="mt-1 flex items-center gap-2">
											<span className="font-semibold">
												{assignedEditor.name}
											</span>
											<Badge>{assignedEditor.admin_role?.name}</Badge>
										</div>
									) : (
										<p className="text-muted-foreground mt-1">
											Not assigned yet
										</p>
									)}
								</div>
							) : (
								<>
									{/* Super Admin (role_id=1) sees dropdown */}
									<label className="text-sm font-medium">Select Editor</label>

									<Select
										value={selectedEditor}
										onValueChange={setSelectedEditor}
									>
										<SelectTrigger>
											<SelectValue placeholder="Choose an editor..." />
										</SelectTrigger>

										<SelectContent>
											{apiEditors.map((editor) => {
												const isBusy = editor.editor_assign_books?.length > 0;
												return (
													<SelectItem
														key={editor.id}
														value={editor.id.toString()}
													>
														<div className="flex items-center gap-3">
															{/* Dot Indicator */}
															<div
																className={`w-2 h-2 rounded-full ${
																	isBusy ? "bg-red-500" : "bg-green-500"
																}`}
															/>

															{/* Name */}
															<span>{editor.name}</span>

															{/* Role badge */}
															<Badge
																variant={
																	editor.admin_role?.name === "Super Admin"
																		? "destructive"
																		: editor.admin_role?.name ===
																		  "Senior Editor"
																		? "default"
																		: "secondary"
																}
															>
																{editor.admin_role?.name}
															</Badge>
														</div>
													</SelectItem>
												);
											})}
										</SelectContent>
									</Select>
									{/* Availability Indicator Row */}
									<div className="flex items-center gap-6 mt-2">
										{/* Available */}
										<div className="flex items-center gap-2">
											<span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500"></span>
											<span className="text-sm text-muted-foreground">
												Available
											</span>
										</div>

										{/* Busy */}
										<div className="flex items-center gap-2">
											<span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500"></span>
											<span className="text-sm text-muted-foreground">
												Busy
											</span>
										</div>
									</div>
								</>
							)}
						</CardContent>
					</Card>
				</div>

				{/* RIGHT COLUMN — TIMELINE + BUTTONS */}
				<div className="space-y-6">
					{/* TIMELINE */}
					<Card>
						<CardHeader>
							<CardTitle>Project Timeline</CardTitle>
						</CardHeader>

						<CardContent>
							<div className="space-y-6 mt-2">
								{timeline.map((stage, index) => {
									const isActive = manuscript.status === stage;
									const isCompleted =
										timeline.indexOf(manuscript.status) > index;

									const formatted =
										stage === "in-editing"
											? "In Progress"
											: stage === "draft"
											? "Submitted"
											: "Completed";

									return (
										<div key={stage} className="flex items-start gap-4">
											{/* LEFT DOT + LINE */}
											<div className="flex flex-col items-center">
												{/* DOT */}
												<div
													className={`
                w-4 h-4 rounded-full border-2
                ${
									isActive
										? "bg-primary border-primary"
										: isCompleted
										? "bg-primary border-primary"
										: "bg-white border-input"
								}
              `}
												/>

												{/* Connecting line (except last one) */}
												{index < timeline.length - 1 && (
													<div
														className={`
                  w-0.5 h-10
                  ${isCompleted || isActive ? "bg-primary" : "bg-muted-foreground/40"}
                `}
													></div>
												)}
											</div>

											{/* LABELS */}
											<div className="flex flex-col pt-1">
												<p
													className={`
                font-medium
                ${
									isActive
										? "text-red-600"
										: isCompleted
										? "text-red-600"
										: "text-muted-foreground"
								}
              `}
												>
													{formatted}
												</p>

												{/* Subtext */}
												{isCompleted && (
													<p className="text-xs text-muted-foreground">Completed</p>
												)}
												{isActive && index !== timeline.length - 1 && (
													<p className="text-xs text-red-500">Next Stage</p>
												)}
											</div>
										</div>
									);
								})}
							</div>
						</CardContent>
					</Card>

					{/* ACTION BUTTONS */}
			{loginRole === 1 && (
  <Card>
    <CardHeader>
      <CardTitle>Assignment Actions</CardTitle>
    </CardHeader>

    <CardContent className="space-y-4">
      <Button
        className="w-full"
        size="lg"
        onClick={handleAssignProject}
      >
        Assign Project
      </Button>

      <Button variant="outline" className="w-full" onClick={handleBack}>
        Cancel
      </Button>
    </CardContent>
  </Card>
)}

				</div>
			</div>
		</div>
	);
};

export default AssignProject;
