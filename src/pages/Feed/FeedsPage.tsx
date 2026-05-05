/** @format */

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

import { Eye } from "lucide-react";
import { GetAllFeedsAPI } from "@/services/Api/FeedsApi";


export default function FeedsPage() {
	const [feeds, setFeeds] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");

	const [page, setPage] = useState(1);
	const [total, setTotal] = useState(0);

	const { toast } = useToast();
	const navigate = useNavigate();

	const limit = 10;

	// LOAD FEEDS
	const loadFeeds = async () => {
		try {
			setLoading(true);

			const res = await GetAllFeedsAPI({
				page,
				limit,
				search,
			});

			const data = res?.data?.data;

			setFeeds(data?.data || []);
			setTotal(data?.total || 0);
		} catch (error: any) {
			toast({
				title: "Failed to load feeds",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadFeeds();
	}, [page, search]);

	const totalPages = Math.ceil(total / limit);

	return (
		<div className="max-w-7xl space-y-6">
			{/* HEADER */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Feeds</h1>
					<p className="text-muted-foreground mt-1">
						Manage all user posts.
					</p>
				</div>

				<Input
					placeholder="Search feeds..."
					value={search}
					onChange={(e) => {
						setPage(1);
						setSearch(e.target.value);
					}}
					className="w-72"
				/>
			</div>

			{/* TABLE */}
			<Card>
				<CardContent className="pt-6">
					{loading ? (
						<p className="text-muted-foreground">Loading...</p>
					) : (
						<>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>#</TableHead>
										<TableHead>Title</TableHead>
										<TableHead>User</TableHead>
										<TableHead>Likes</TableHead>
										<TableHead>Comments</TableHead>
										<TableHead className="text-right">Action</TableHead>
									</TableRow>
								</TableHeader>

								<TableBody>
									{feeds.map((f: any, index: number) => (
										<TableRow key={f.id}>
											<TableCell>
												{(page - 1) * limit + index + 1}
											</TableCell>

											{/* TITLE */}
											<TableCell className="max-w-md">
												<p className="truncate font-medium">
													{f.title}
												</p>
												<p className="text-xs text-muted-foreground truncate">
													{f.content}
												</p>
											</TableCell>

											{/* USER */}
											<TableCell>
												{f.feed_user?.user_profile?.name || "-"}
											</TableCell>

											{/* COUNTS */}
											<TableCell>{f.likes_count}</TableCell>
											<TableCell>{f.comment_count}</TableCell>

											{/* ACTION */}
											<TableCell className="text-right">
												<Button
													size="icon"
													variant="outline"
													onClick={() =>
														navigate(`/feeds/view/${f.id}`)
													}
												>
													<Eye className="h-4 w-4" />
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>

							{/* PAGINATION */}
							<div className="flex justify-between mt-4">
								<p className="text-sm text-muted-foreground">
									Page {page} of {totalPages}
								</p>

								<div className="flex gap-2">
									<Button
										disabled={page === 1}
										onClick={() => setPage(page - 1)}
									>
										Prev
									</Button>

									<Button
										disabled={page === totalPages}
										onClick={() => setPage(page + 1)}
									>
										Next
									</Button>
								</div>
							</div>
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
}