/** @format */

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GetFeedByIdAPI } from "@/services/Api/FeedsApi";

export default function FeedViewPage() {
	const { id } = useParams();
	const navigate = useNavigate();
	const { toast } = useToast();

	const [feed, setFeed] = useState<any>(null);

	/* 🔥 BUILD COMMENT TREE */
	const buildCommentsTree = (comments: any[]) => {
		const map: any = {};
		const roots: any[] = [];

		comments.forEach((c) => {
			map[c.id] = { ...c, children: [] };
		});

		comments.forEach((c) => {
			if (c.parent_id) {
				map[c.parent_id]?.children.push(map[c.id]);
			} else {
				roots.push(map[c.id]);
			}
		});

		return roots;
	};

	/* 🚀 LOAD FEED */
	const loadFeed = async () => {
		try {
			const res = await GetFeedByIdAPI(id);
			const data = res?.data?.data;

			data.commentsTree = buildCommentsTree(data.replies || []);
			setFeed(data);
		} catch {
			toast({
				title: "Failed to load feed",
				variant: "destructive",
			});
		}
	};

	useEffect(() => {
		if (id) loadFeed();
	}, [id]);

	if (!feed) return <div className="p-10">Loading...</div>;

	return (
		<div className="mx-auto space-y-6">
			<Button variant="ghost" onClick={() => navigate(-1)}>
				<ArrowLeft className="h-4 w-4 mr-2" />
				Back
			</Button>

			{/* FEED */}
			<Card className="shadow-lg rounded-2xl">
				<CardContent className="p-6 space-y-5">

					{/* USER */}
					<div className="flex items-center gap-3">
						<div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center font-bold">
							{feed.feed_user?.user_profile?.name?.[0]}
						</div>

						<div>
							<p className="font-medium">
								{feed.feed_user?.user_profile?.name}
							</p>
							<p className="text-xs text-muted-foreground">
								{new Date(feed.created_at).toLocaleString()}
							</p>
						</div>
					</div>

					{/* TITLE + GENRE */}
					<div>
						<h2 className="text-xl font-semibold">{feed.title}</h2>

						{feed.feed_genre && (
							<span className="inline-block mt-1 bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-medium">
								{feed.feed_genre.title}
							</span>
						)}
					</div>

					{/* CONTENT */}
					<p className="text-sm leading-relaxed whitespace-pre-line">
						{feed.content}
					</p>

					{/* IMAGE */}
					{feed.img_uri && (
						<img
							src={`https://api.turningpages.io/images/${feed.img_uri}`}
							className="rounded-xl w-full h-[220px] object-cover"
						/>
					)}

					{/* STATS */}
					<div className="flex gap-6 text-sm text-muted-foreground border-t pt-3">
						<span>❤️ {feed.likes_count}</span>
						<span>💬 {feed.comment_count}</span>
						<span>👁 {feed.views_count}</span>
						<span>🔁 {feed.shares_count}</span>
					</div>

					{/* ✅ LIKED USERS */}
					{feed.feed_likes?.length > 0 && (
						<div className="border-t pt-3">
							<p className="text-sm font-medium mb-2">Liked by</p>

							<div className="flex flex-wrap gap-2">
								{feed.feed_likes.map((like: any) => {
									const name =
										like.liked_user?.user_profile?.name || "User";

									return (
										<div
											key={like.id}
											className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full text-xs"
										>
											<div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold">
												{name[0]}
											</div>
											<span>{name}</span>
										</div>
									);
								})}
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* COMMENTS */}
			<Card className="rounded-2xl shadow">
				<CardContent className="p-6">
					<h3 className="font-semibold mb-4">
						Comments ({feed.comment_count})
					</h3>

					<div className="space-y-4">
						{feed.commentsTree?.map((c: any) => (
							<CommentItem key={c.id} comment={c} />
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

/* 🔥 COMMENT COMPONENT */
function CommentItem({ comment }: any) {
	const name =
		comment.feed_comment_user?.user_profile?.name || "User";

	return (
		<div>
			<div className="flex gap-3">
				<div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
					{name[0]}
				</div>

				<div className="flex-1">
					<div className="bg-muted p-3 rounded-xl">
						<p className="text-sm font-medium">{name}</p>
						<p className="text-sm">{comment.content}</p>
					</div>

					<p className="text-xs text-muted-foreground mt-1">
						{new Date(comment.created_at).toLocaleString()}
					</p>

					{/* CHILD COMMENTS */}
					{comment.children?.length > 0 && (
						<div className="mt-3 ml-4 space-y-3 border-l pl-4">
							{comment.children.map((child: any) => (
								<CommentItem key={child.id} comment={child} />
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}