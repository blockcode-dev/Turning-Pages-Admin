/** @format */

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { GetAllSubscriptionsAPI } from "@/services/Api/PaymentApi";

const CREDIT_PACKAGES = {
	starter: { credit: 5 },
	author: { credit: 12 },
	pro_author: { credit: 25 },
	studio: { credit: 50 },
};

// 🔥 format package name properly
const formatPackageName = (name: string) => {
	if (!name) return "-";

	// fix weird cases like "starterpro_author"
	const knownPackages = ["starter", "author", "pro_author", "studio"];

	for (let pkg of knownPackages) {
		if (name.includes(pkg)) {
			return pkg
				.split("_")
				.map(w => w.charAt(0).toUpperCase() + w.slice(1))
				.join(" ");
		}
	}

	return name
		.split("_")
		.map(w => w.charAt(0).toUpperCase() + w.slice(1))
		.join(" ");
};

// 🔥 get credit
const getCredits = (package_name: string) => {
	const key = Object.keys(CREDIT_PACKAGES).find(k =>
		package_name?.includes(k)
	);
	return key ? CREDIT_PACKAGES[key].credit : "-";
};

// 🔥 status badge
const getStatusBadge = (status: string) => {
	switch (status) {
		case "active":
			return (
				<span className="bg-green-100 text-green-700 px-2 py-1 text-xs rounded font-medium">
					Active
				</span>
			);
		case "scheduled":
			return (
				<span className="bg-blue-100 text-blue-700 px-2 py-1 text-xs rounded font-medium">
					Scheduled
				</span>
			);
		case "expired":
			return (
				<span className="bg-gray-100 text-gray-700 px-2 py-1 text-xs rounded font-medium">
					Expired
				</span>
			);
		case "canceled":
			return (
				<span className="bg-red-100 text-red-700 px-2 py-1 text-xs rounded font-medium">
					Canceled
				</span>
			);
		default:
			return (
				<span className="bg-yellow-100 text-yellow-700 px-2 py-1 text-xs rounded">
					{status}
				</span>
			);
	}
};

export default function SubscriptionPage() {
	const [subs, setSubs] = useState<any[]>([]);
	const [filtered, setFiltered] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");

	const { toast } = useToast();
	const navigate = useNavigate();

	const loadSubs = async () => {
		try {
			setLoading(true);

			const res = await GetAllSubscriptionsAPI();
			const list = res?.data?.data || [];

			setSubs(list);
			setFiltered(list);
		} catch (error: any) {
			if (
				error.response?.data?.message ===
				"You are not authorized to access this route"
			) {
				return navigate("/unauthorized");
			}

			toast({
				title: "Failed to load subscriptions",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadSubs();
	}, []);

	// 🔥 SEARCH (name + email + package)
	useEffect(() => {
		const f = subs.filter((s) => {
			const name = s.subscription_user?.user_profile?.name || "";
			const email = s.subscription_user?.email || "";
			const pkg = s.package_name || "";

			const searchText = search.toLowerCase();

			return (
				name.toLowerCase().includes(searchText) ||
				email.toLowerCase().includes(searchText) ||
				pkg.toLowerCase().includes(searchText)
			);
		});

		setFiltered(f);
	}, [search, subs]);

	return (
		<div className="max-w-7xl space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold">Subscriptions</h1>
					<p className="text-muted-foreground">
						Recurring credit plans (auto-renewal)
					</p>
				</div>

				<Input
					placeholder="Search name, email, package..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="w-80"
				/>
			</div>

			<Card>
				<CardContent className="pt-6">
					{loading ? (
						<p>Loading...</p>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>#</TableHead>
									<TableHead>User</TableHead>
									<TableHead>Package</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Credits</TableHead>
									<TableHead>Period</TableHead>
									<TableHead>Auto Renew</TableHead>
								</TableRow>
							</TableHeader>

							<TableBody>
								{filtered.map((s, i) => (
									<TableRow key={s.id}>
										<TableCell>{i + 1}</TableCell>

										{/* USER */}
										<TableCell>
											<div className="flex flex-col">
												<span className="font-medium">
													{s.subscription_user?.user_profile?.name || "-"}
												</span>
												<span className="text-xs text-muted-foreground">
													{s.subscription_user?.email}
												</span>
											</div>
										</TableCell>

										{/* PACKAGE */}
										<TableCell>
											{formatPackageName(s.package_name)}
										</TableCell>

										{/* STATUS */}
										<TableCell>
											{getStatusBadge(s.status)}
										</TableCell>

										{/* CREDIT */}
										<TableCell>
											{getCredits(s.package_name)}
										</TableCell>

										{/* PERIOD */}
										<TableCell>
											{new Date(s.current_period_start).toLocaleDateString()} -{" "}
											{new Date(s.current_period_end).toLocaleDateString()}
										</TableCell>

										{/* AUTO RENEW */}
										<TableCell>
											{s.cancel_at_period_end ? "No" : "Yes"}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	);
}