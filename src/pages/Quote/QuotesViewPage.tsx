/** @format */

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Pencil, Hash, User, AlignLeft, BarChart2, Calendar, RefreshCw } from "lucide-react";
import { GetQuoteByIdAPI } from "@/services/Api/QuoteApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function QuoteViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadQuote = async () => {
    try {
      const res = await GetQuoteByIdAPI(id);
      setQuote(res?.data?.data || null);
    } catch (error: any) {
      if (error.response?.data?.message === "You are not authorized to access this route") {
        return navigate("/unauthorized");
      }
      toast({ title: "Failed to load quote", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadQuote();
  }, [id]);

  if (loading)
    return (
      <div className="p-10 text-center text-muted-foreground text-sm">Loading...</div>
    );

  if (!quote)
    return (
      <div className="p-10 text-center text-muted-foreground text-sm">Quote not found.</div>
    );

  const statCards = [
    { label: "Characters", value: quote.character_count?.toLocaleString() ?? "—", icon: AlignLeft },
    { label: "Requests", value: quote.req_count?.toLocaleString() ?? "—", icon: BarChart2 },
    { label: "Created", value: new Date(quote.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), icon: Calendar },
    { label: "Updated", value: new Date(quote.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), icon: RefreshCw },
  ];

  return (
    <div className=" mx-auto py-8 px-4 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back
        </Button>
        <Button size="sm" onClick={() => navigate(`/quotes/edit/${quote.id}`)}>
          <Pencil className="h-3.5 w-3.5 mr-1.5" />
          Edit Quote
        </Button>
      </div>

      {/* Page title */}
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold tracking-tight">Quote Details</h1>
        {/* <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md font-mono">
          #{quote.id}
        </span> */}
      </div>

      {/* Quote block */}
      <div className="relative rounded-xl border bg-card p-6 space-y-4">
        {/* Decorative quote mark */}
        <span className="absolute top-4 right-5 text-5xl font-serif leading-none text-muted-foreground/10 select-none pointer-events-none">
          "
        </span>

        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <AlignLeft className="h-3 w-3" /> Quote
          </p>
          <p className="text-base leading-relaxed text-foreground">
            {quote.quote}
          </p>
        </div>

        <div className="h-px bg-border" />

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <User className="h-3.5 w-3.5" />
            <span className="font-medium text-foreground">{quote.author}</span>
          </div>

          {quote.QuoteTags?.length > 0 && (
            <>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-1.5 flex-wrap">
                <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                {quote.QuoteTags.map((tag: any) => (
                  <Badge key={tag.id} variant="secondary" className="text-xs">
                    {tag.title}
                  </Badge>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-xl border bg-card px-4 py-3.5 space-y-2"
          >
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Icon className="h-3.5 w-3.5" />
              {label}
            </div>
            <p className="text-sm font-semibold text-foreground">{value}</p>
          </div>
        ))}
      </div>

    </div>
  );
}