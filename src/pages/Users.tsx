/** @format */

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

import {
	Search,
	Filter,
	Eye,
	UserX,
	RotateCcw,
	CalendarIcon,
	Mail,
	FileText,
	CheckCircle,
	Clock,
	Users as UsersIcon,
} from "lucide-react";

import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
	GetAllUsersAPI,
	GetUserDetailsAPI,
	GetUserStatsAPI,
	UpdateUserStatusAPI,
} from "@/services/Api/UserApi";

const getAccountStatusBadge = (status?: string) => {
	if (!status) return <Badge variant="secondary">Unknown</Badge>;

	if (status === "ACCEPTED")
		return (
			<Badge className="bg-green-500 text-white">
				<CheckCircle className="h-3 w-3 mr-1" /> Active
			</Badge>
		);

	if (status === "REJECTED")
		return (
			<Badge className="bg-gray-400 text-white">
				<Clock className="h-3 w-3 mr-1" /> Inactive
			</Badge>
		);

	return <Badge>{status}</Badge>;
};

const Users = () => {
	const [users, setUsers] = useState<any[]>([]);
	const [stats, setStats] = useState<any>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [manuscriptFilter, setManuscriptFilter] = useState("all");
	const [dateFilter, setDateFilter] = useState("all");

	const [selectedUser, setSelectedUser] = useState<any>(null);
	const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

	const { toast } = useToast();

	useEffect(() => {
		loadUsers();
		loadStats();
	}, []);

	const loadUsers = async () => {
		try {
			const res = await GetAllUsersAPI();
			setUsers(res.data.data || []);
		} catch {
			toast({
				title: "Failed to load users",
				variant: "destructive",
			});
		}
	};

	const loadStats = async () => {
		try {
			const res = await GetUserStatsAPI();
			setStats(res.data.data);
		} catch {
			toast({
				title: "Failed to load stats",
				variant: "destructive",
			});
		}
	};

	const handleToggleStatus = async (user: any) => {
		const current = user.status;

		// Convert backend ENUM ↔ API required values
		const backendStatus = current === "ACCEPTED" ? "deactive" : "active";

		try {
			await UpdateUserStatusAPI({
				userId: user.id,
				status: backendStatus, // send correct value
			});

			toast({
				title: `User ${
					backendStatus === "active" ? "Activated" : "Deactivated"
				}`,
			});

			loadUsers();
			loadStats();
		} catch (err) {
			toast({ title: "Failed to update status", variant: "destructive" });
		}
	};

	const mapStatus = (status: string) => {
		return status === "ACCEPTED" ? "active" : "inactive";
	};

	const filteredUsers = users.filter((user) => {
		const name = user.user_profile?.name || "";
		const email = user.email || "";
		const manuscripts = user.manuscript_count || 0;

		// ⭐ REAL STATUS comes from ENUM field
		const accountStatus = mapStatus(user.status); // "active" or "inactive"

		const joinDate = user.created_at?.slice(0, 4);

		const matchesSearch =
			name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			email.toLowerCase().includes(searchTerm.toLowerCase());

		const matchesStatus =
			statusFilter === "all" || accountStatus === statusFilter;

		const matchesManuscripts =
			manuscriptFilter === "all" ||
			(manuscriptFilter === "1-3" && manuscripts >= 1 && manuscripts <= 3) ||
			(manuscriptFilter === "4-6" && manuscripts >= 4 && manuscripts <= 6) ||
			(manuscriptFilter === "7+" && manuscripts >= 7);

		const matchesDate = dateFilter === "all" || joinDate === dateFilter;

		return matchesSearch && matchesStatus && matchesManuscripts && matchesDate;
	});

	const handleViewProfile = async (userId: number) => {
		try {
			const res = await GetUserDetailsAPI(userId);
			setSelectedUser(res.data.data);
			setIsProfileModalOpen(true);
		} catch {
			toast({ title: "Failed to load user profile", variant: "destructive" });
		}
	};

	return (
		<div className="space-y-6">
			{/* PAGE TITLE */}
			<div>
				<h1 className="text-3xl font-bold">Users Management</h1>
				<p className="text-muted-foreground mt-2">
					Manage user accounts & manuscripts
				</p>
			</div>

			{/* STATS CARDS */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card>
					<CardHeader className="flex justify-between pb-2">
						<CardTitle className="text-sm">Total Users</CardTitle>
						<UsersIcon className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex justify-between pb-2">
						<CardTitle className="text-sm">Active Users</CardTitle>
						<CheckCircle className="h-4 w-4 text-success" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-success">
							{stats?.activeUsers || 0}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex justify-between pb-2">
						<CardTitle className="text-sm">Inactive Users</CardTitle>
						<Clock className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{stats?.inactiveUsers || 0}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex justify-between pb-2">
						<CardTitle className="text-sm">Total Manuscripts</CardTitle>
						<FileText className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{stats?.totalManuscripts || 0}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* FILTERS */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Filter className="h-5 w-5 text-primary" />
						Filters
					</CardTitle>
				</CardHeader>

				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
						{/* Search */}
						<div className="space-y-2">
							<label className="text-sm font-medium">Search Users</label>
							<div className="relative">
								<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Search by name or email..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-10"
								/>
							</div>
						</div>

						{/* Status Filter */}
						<div className="space-y-2">
							<label className="text-sm font-medium">Account Status</label>
							<Select value={statusFilter} onValueChange={setStatusFilter}>
								<SelectTrigger>
									<SelectValue placeholder="Select status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All</SelectItem>
									<SelectItem value="active">Active</SelectItem>
									<SelectItem value="inactive">Inactive</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Manuscripts Filter */}
						<div className="space-y-2">
							<label className="text-sm font-medium">Manuscripts</label>
							<Select
								value={manuscriptFilter}
								onValueChange={setManuscriptFilter}
							>
								<SelectTrigger>
									<SelectValue placeholder="All manuscripts" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All</SelectItem>
									<SelectItem value="1-3">1-3 Manuscripts</SelectItem>
									<SelectItem value="4-6">4-6 Manuscripts</SelectItem>
									<SelectItem value="7+">7+ Manuscripts</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Date Filter */}
						<div className="space-y-2">
							<label className="text-sm font-medium">Year Joined</label>
							<Select value={dateFilter} onValueChange={setDateFilter}>
								<SelectTrigger>
									<SelectValue placeholder="All dates" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All</SelectItem>
									<SelectItem value="2025">2025</SelectItem>
									<SelectItem value="2024">2024</SelectItem>
									<SelectItem value="2023">2023</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* USERS TABLE */}
			<Card>
				<CardHeader>
					<CardTitle>Users ({filteredUsers.length})</CardTitle>
				</CardHeader>

				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>User</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Manuscripts</TableHead>
								<TableHead>Account Created On</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Action</TableHead>
							</TableRow>
						</TableHeader>

						<TableBody>
							{filteredUsers.map((u) => {
								const name = u.user_profile?.name || "N/A";
								return (
									<TableRow key={u.id}>
										<TableCell>
											<div className="flex items-center gap-3">
												<Avatar className="h-8 w-8">
													<AvatarImage
														src={u.user_attachments?.[0]?.file_uri}
													/>
													<AvatarFallback>
														{name
															.split(" ")
															.map((n: string) => n[0])
															.join("")}
													</AvatarFallback>
												</Avatar>
												<span className="font-medium">{name}</span>
											</div>
										</TableCell>

										<TableCell>{u.email}</TableCell>

										<TableCell>
											<div className="flex items-center gap-1">
												<FileText className="h-4 w-4 text-muted-foreground" />
												<span className="font-medium">
													{u.manuscript_count || 0}
												</span>
											</div>
										</TableCell>

										<TableCell>
											{format(new Date(u.created_at), "MMM dd, yyyy")}
										</TableCell>

										<TableCell>{getAccountStatusBadge(u.status)}</TableCell>

										<TableCell>
											<div className="flex items-center gap-2">
												<Button
													size="sm"
													variant="outline"
													onClick={() => handleViewProfile(u.id)}
												>
													<Eye className="h-4 w-4 mr-1" /> View
												</Button>
												<Button
													variant="outline"
													className={
														u.status === "ACCEPTED"
															? "text-red-600"
															: "text-green-600"
													}
													onClick={() => handleToggleStatus(u)}
												>
													<UserX className="h-4 w-4 mr-2" />
													{u.status === "ACCEPTED" ? "Deactivate" : "Activate"}
												</Button>

												{/* <Button
													variant="outline"
													size="sm"
													// onClick={() => handleResetPassword(user.id, user.name)}
												>
													<RotateCcw className="h-4 w-4" />
												</Button> */}
											</div>
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			{/* USER PROFILE MODAL */}
			<Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
				<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>User Profile</DialogTitle>
					</DialogHeader>

					{selectedUser && (
						<div className="space-y-6">
							{/* USER INFO */}
							<div className="flex items-start gap-4">
								<Avatar className="h-16 w-16">
									<AvatarImage
										src={selectedUser.user_attachments?.[0]?.file_uri || ""}
									/>
									<AvatarFallback className="text-lg">
										{selectedUser.user_profile?.name
											?.split(" ")
											.map((n: string) => n[0])
											.join("")}
									</AvatarFallback>
								</Avatar>

								<div className="flex-1">
									<h3 className="text-xl font-semibold">
										{selectedUser.user_profile?.name}
									</h3>

									<div className="flex items-center gap-2 mt-1">
										<Mail className="h-4 w-4 text-muted-foreground" />
										{selectedUser.email}
									</div>

									<div className="flex items-center gap-2 mt-1">
										<CalendarIcon className="h-4 w-4 text-muted-foreground" />
										Joined{" "}
										{format(new Date(selectedUser.created_at), "MMM dd, yyyy")}
									</div>

									<div className="mt-2">
										{getAccountStatusBadge(selectedUser.is_active)}
									</div>
								</div>
							</div>

							<Separator />

							{/* BOOKS LIST */}
							<div>
								<h4 className="font-medium mb-3">
									Projects ({selectedUser.user_books?.length || 0})
								</h4>

								{selectedUser.user_books?.length > 0 ? (
									<div className="space-y-3">
										{selectedUser.user_books.map((book: any) => {
											// STATUS BADGES
											const getProjectStatusBadge = (status: string) => {
												if (status === "completed")
													return (
														<Badge className="bg-green-500 text-white px-3 py-1 rounded-full">
															Completed
														</Badge>
													);
												if (status === "in-editing")
													return (
														<Badge className="bg-blue-500 text-white px-3 py-1 rounded-full">
															In Editing
														</Badge>
													);
												return (
													<Badge className="bg-gray-400 text-white px-3 py-1 rounded-full">
														Draft
													</Badge>
												);
											};

											return (
												<div
													key={book.id}
													className="p-4 border rounded-lg space-y-2"
												>
													{/* TITLE + STATUS */}
													<div className="flex items-center justify-between">
														<h5 className="font-medium">{book.title}</h5>
														{getProjectStatusBadge(book.status)}
													</div>

													{/* GENRE */}
													<p className="text-sm text-muted-foreground">
														Genre: {book.book_genre?.title || "N/A"}
													</p>

													{/* DESCRIPTION */}
													<p className="text-sm text-muted-foreground line-clamp-3">
														{book.description || "No description provided."}
													</p>
												</div>
											);
										})}
									</div>
								) : (
									<p className="text-sm text-muted-foreground">
										No projects found.
									</p>
								)}
							</div>

							<Separator />

							{/* ACCOUNT ACTIONS */}
							<div>
								<h4 className="font-medium mb-3">Account Actions</h4>
								<div className="flex gap-3">
									<Button variant="outline" className="text-red-600">
										<UserX className="h-4 w-4 mr-2" /> Deactivate Account
									</Button>

									<Button variant="outline">
										<RotateCcw className="h-4 w-4 mr-2" /> Reset Password
									</Button>
								</div>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default Users;
