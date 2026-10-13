/** @format */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

import {
  AddQuoteAPI,
  GetAllQuoteTagsAPI,
} from "@/services/Api/QuoteApi";

export default function AddQuotePage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [author, setAuthor] = useState("");
  const [quote, setQuote] = useState("");
  const [tags, setTags] = useState<number[]>([]);
  const [allTags, setAllTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // LOAD TAGS
  const loadTags = async () => {
    try {
      const res = await GetAllQuoteTagsAPI({ page: 1 });
      setAllTags(res?.data?.data?.data || []);
    } catch {
      toast({
        title: "Failed to load tags",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadTags();
  }, []);

  // TOGGLE TAG
  const toggleTag = (id: number) => {
    setTags((prev) =>
      prev.includes(id)
        ? prev.filter((t) => t !== id)
        : [...prev, id]
    );
  };

  // AUTO GENERATE HTML DESC
  const generateDesc = (quote: string, author: string) => {
    return `
      <blockquote>
        &ldquo;${quote}&rdquo;
        <footer>— ${author}</footer>
      </blockquote>
    `;
  };

  // SUBMIT
  const handleSubmit = async () => {
    if (!author.trim() || !quote.trim()) {
      return toast({
        title: "Required fields missing",
        description: "Author and Quote are required",
        variant: "destructive",
      });
    }

    try {
      setLoading(true);

      const desc = generateDesc(quote, author);

      await AddQuoteAPI({
         add_type: "single",
        author: author.trim(),
        quote: quote.trim(),
        desc,
        tags,
      });

      toast({ title: "Quote added successfully" });
      navigate("/quotes");
    } catch (error: any) {
      toast({
        title: "Failed to add quote",
        description: error.response?.data?.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Add Quote</h1>

        <Button variant="outline" onClick={() => navigate(-1)}>
          Cancel
        </Button>
      </div>

      {/* FORM */}
      <Card>
        <CardContent className="p-6 space-y-6">
          {/* AUTHOR */}
          <div>
            <label className="text-sm font-medium">
              Author <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Enter author name"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>

          {/* QUOTE */}
          <div>
            <label className="text-sm font-medium">
              Quote <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full border rounded-md p-3 text-sm"
              rows={4}
              placeholder="Enter quote..."
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
            />
          </div>

          {/* TAGS */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Select Tags
            </label>

            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-1 rounded-full text-xs border transition ${
                    tags.includes(tag.id)
                      ? "bg-primary text-white"
                      : "bg-muted hover:bg-muted/70"
                  }`}
                >
                  {tag.title}
                </button>
              ))}
            </div>
          </div>

          {/* PREVIEW */}
          {quote && (
            <div className="bg-muted p-4 rounded-md">
              <p className="text-lg font-medium">
                “{quote}”
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                — {author || "Author"}
              </p>
            </div>
          )}

          {/* ACTION */}
          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving..." : "Add Quote"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}