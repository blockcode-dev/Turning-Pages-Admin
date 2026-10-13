/** @format */

import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router";
import {
	ChevronDown,
	FileText,
	FolderOpen,
	LayoutDashboard,
	LayoutList,
	MessageSquare,
	Quote,
	Receipt,
	Tags,
	Ticket,
	UserCog,
	Users,
	type LucideIcon,
} from "lucide-react";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	useSidebar,
} from "@/components/ui/sidebar";
import logoMark from "@/assets/logo-mark.png";

type NavChild = { title: string; url: string };
type NavItem = { title: string; icon: LucideIcon } & (
	| { url: string; children?: never }
	| { url?: never; children: NavChild[] }
);

const navigationItems: NavItem[] = [
	{ title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
	{ title: "Editing Queue", url: "/editing-queue", icon: FileText },
	{ title: "Projects", url: "/projects", icon: FolderOpen },
	{ title: "Users", url: "/users", icon: Users },
	{ title: "Editors", url: "/editors", icon: UserCog },
	{ title: "Genres", url: "/genres", icon: Tags },
	{
		title: "Quotes",
		icon: Quote,
		children: [
			{ title: "Quote", url: "/quotes" },
			{ title: "Quote Tags", url: "/quote-tags" },
		],
	},
	{ title: "Feed", url: "/feeds", icon: LayoutList },
	{
		title: "Payments",
		icon: Receipt,
		children: [
			{ title: "Publishing Packages", url: "/payment-history" },
			{ title: "Subscriptions", url: "/subscriptions" },
		],
	},
	{ title: "Tickets", url: "/tickets", icon: Ticket },
	{ title: "Chat", url: "/chat", icon: MessageSquare },
];

const isPathActive = (current: string, url: string) =>
	current === url || current.startsWith(`${url}/`);

export function AdminSidebar() {
	const { state, isMobile, setOpen, setOpenMobile } = useSidebar();
	const { pathname } = useLocation();
	const isCollapsed = state === "collapsed" && !isMobile;

	// Groups containing the current page start expanded.
	const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() =>
		Object.fromEntries(
			navigationItems
				.filter((item) => item.children?.some((c) => isPathActive(pathname, c.url)))
				.map((item) => [item.title, true]),
		),
	);

	// Close the mobile drawer after navigating.
	useEffect(() => {
		if (isMobile) setOpenMobile(false);
	}, [pathname, isMobile, setOpenMobile]);

	const toggleMenu = (title: string) => {
		// In icon-only mode, expand the sidebar so the sub-items are visible.
		if (isCollapsed) {
			setOpen(true);
			setOpenMenus((prev) => ({ ...prev, [title]: true }));
			return;
		}
		setOpenMenus((prev) => ({ ...prev, [title]: !prev[title] }));
	};

	return (
		<Sidebar collapsible="icon">
			<SidebarHeader className="h-16 justify-center border-b border-sidebar-border px-3">
				<div className="flex items-center gap-2.5 overflow-hidden">
					<img src={logoMark} alt="" className="h-8 w-8 shrink-0 object-contain" />
					{!isCollapsed && (
						<div className="min-w-0 leading-tight">
							<p className="truncate text-[15px] font-bold tracking-tight text-foreground">Turning Pages</p>
							<p className="truncate text-[11px] font-medium uppercase tracking-wider text-primary">Admin</p>
						</div>
					)}
				</div>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Menu</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu className="gap-1">
							{navigationItems.map((item) => {
								if (item.children) {
									const isOpen = !!openMenus[item.title] && !isCollapsed;
									const hasActiveChild = item.children.some((c) => isPathActive(pathname, c.url));

									return (
										<SidebarMenuItem key={item.title}>
											<SidebarMenuButton
												tooltip={item.title}
												onClick={() => toggleMenu(item.title)}
												isActive={hasActiveChild && !isOpen}
												aria-expanded={isOpen}
												className="data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
											>
												<item.icon />
												<span>{item.title}</span>
												<ChevronDown
													className={`ml-auto transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
												/>
											</SidebarMenuButton>

											{isOpen && (
												<SidebarMenuSub>
													{item.children.map((child) => (
														<SidebarMenuSubItem key={child.url}>
															<SidebarMenuSubButton
																asChild
																isActive={isPathActive(pathname, child.url)}
																className="data-[active=true]:bg-primary/10 data-[active=true]:font-medium data-[active=true]:text-primary"
															>
																<NavLink to={child.url}>{child.title}</NavLink>
															</SidebarMenuSubButton>
														</SidebarMenuSubItem>
													))}
												</SidebarMenuSub>
											)}
										</SidebarMenuItem>
									);
								}

								return (
									<SidebarMenuItem key={item.title}>
										<SidebarMenuButton
											asChild
											tooltip={item.title}
											isActive={isPathActive(pathname, item.url)}
											className="data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:shadow-sm hover:data-[active=true]:bg-primary hover:data-[active=true]:text-primary-foreground"
										>
											<NavLink to={item.url}>
												<item.icon />
												<span>{item.title}</span>
											</NavLink>
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
