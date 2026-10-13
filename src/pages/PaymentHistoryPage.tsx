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

import { GetAllPaymentsAPI } from "@/services/Api/PaymentApi";

export default function PackagePurchasePage() {
	const [data, setData] = useState<any[]>([]);
	const [filtered, setFiltered] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");

	const { toast } = useToast();
	const navigate = useNavigate();

	const loadData = async () => {
		try {
			setLoading(true);

			const res = await GetAllPaymentsAPI();
			const list = res?.data?.data || [];

			// 🔥 FILTER ONLY PACKAGE PURCHASES
			const packageData = list.filter(
				(p: any) => p.payment_for === "package_purchase",
			);

			setData(packageData);
			setFiltered(packageData);
		} catch (error: any) {
			if (
				error.response?.data?.message ===
				"You are not authorized to access this route"
			) {
				return navigate("/unauthorized");
			}

			toast({
				title: "Failed to load packages",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadData();
	}, []);

useEffect(() => {
	const f = data.filter((p) =>
		`
		${p.payment_user?.user_profile?.name || ""}
		${p.payment_user?.email || ""}
		${p.package_name || ""}
		`
			.toLowerCase()
			.includes(search.toLowerCase())
	);

	setFiltered(f);
}, [search, data]);

	const formatPackageName = (name: string) => {
		if (!name) return "-";
		return name
			.split("_")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");
	};

	const getStatusBadge = (status: string) => {
		if (status === "success") {
			return (
				<span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded font-medium">
					Success
				</span>
			);
		}
		if (status === "pending") {
			return (
				<span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded">
					Pending
				</span>
			);
		}
		return (
			<span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded">
				Failed
			</span>
		);
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl sm:text-3xl font-bold">Publishing Packages</h1>
					<p className="text-muted-foreground">
						One-time publishing service purchases
					</p>
				</div>

				<Input
					placeholder="Search user / package..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="w-full sm:w-80"
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
									<TableHead>Amount</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Transaction</TableHead>
									<TableHead>Date</TableHead>
								</TableRow>
							</TableHeader>

							<TableBody>
								{filtered.map((p, i) => (
									<TableRow key={p.id}>
										<TableCell>{i + 1}</TableCell>

										<TableCell>
											<div className="flex flex-col">
												<span className="font-medium">
													{p.payment_user?.user_profile?.name || "-"}
												</span>
												<span className="text-xs text-muted-foreground">
													{p.payment_user?.email}
												</span>
											</div>
										</TableCell>

										<TableCell>{formatPackageName(p.package_name)}</TableCell>

										<TableCell>
											${p.amount} {p.currency}
										</TableCell>

										<TableCell>{getStatusBadge(p.payment_status)}</TableCell>

										<TableCell className="max-w-[150px]">
											{p.transaction_id?.slice(0, 12)}...
										</TableCell>

										<TableCell>
											{new Date(p.created_at).toLocaleString()}
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
