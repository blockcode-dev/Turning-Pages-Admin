/** @format */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ChevronDown, Key, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { GetAdminProfileAPI } from "@/services/Api/AuthApi";

const ADMIN_NAME_KEY = "admin_name";

export function AdminHeader() {
	const navigate = useNavigate();
	const [adminName, setAdminName] = useState(
		() => sessionStorage.getItem(ADMIN_NAME_KEY) || "Admin User",
	);

	useEffect(() => {
		// The profile name rarely changes; fetch it once per browser session.
		if (sessionStorage.getItem(ADMIN_NAME_KEY)) return;
		const token = localStorage.getItem("token");
		if (!token) return;

		GetAdminProfileAPI({ token })
			.then((res) => {
				if (res?.data?.success) {
					const name = res.data.data.name || "Admin User";
					sessionStorage.setItem(ADMIN_NAME_KEY, name);
					setAdminName(name);
				}
			})
			.catch(() => {});
	}, []);

	const handleLogout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("isAdmin");
		localStorage.removeItem("role_id");
		localStorage.removeItem("admin_id");
		sessionStorage.removeItem(ADMIN_NAME_KEY);
		navigate("/", { replace: true });
	};

	const initial = adminName.trim().charAt(0).toUpperCase() || "A";

	return (
		<header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b bg-card/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-card/80 sm:px-6">
			<SidebarTrigger className="text-muted-foreground hover:text-foreground" />

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="h-10 gap-2 px-2 sm:px-3">
						<span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
							{initial}
						</span>
						<span className="hidden max-w-[160px] truncate font-medium sm:inline">{adminName}</span>
						<ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-56">
					<DropdownMenuLabel className="truncate font-normal text-muted-foreground">
						{adminName}
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem className="cursor-pointer gap-2" onClick={() => navigate("/admin/profile")}>
						<User className="h-4 w-4" />
						Profile
					</DropdownMenuItem>
					<DropdownMenuItem className="cursor-pointer gap-2" onClick={() => navigate("/change-password")}>
						<Key className="h-4 w-4" />
						Change Password
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						className="cursor-pointer gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
						onClick={handleLogout}
					>
						<LogOut className="h-4 w-4" />
						Logout
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</header>
	);
}
