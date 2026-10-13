/** @format */

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

import {
  GetQuoteByIdAPI,
  UpdateQuoteAPI,
  GetAllQuoteTagsAPI,
} from "@/services/Api/QuoteApi";

export default function EditQuotePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [author, setAuthor] = useState("");
  const [quote, setQuote] = useState("");
  const [tags, setTags] = useState<number[]>([]);
  const [allTags, setAllTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  // LOAD QUOTE
  const loadQuote = async () => {
    try {
      const res = await GetQuoteByIdAPI(id);
      const data = res?.data?.data;

      setAuthor(data?.author || "");
      setQuote(data?.quote || "");

      // pre-select tags
      const tagIds =
        data?.QuoteTags?.map((t: any) => t.id) || [];

      setTags(tagIds);
    } catch (error: any) {
      if (
        error.response?.data?.message ===
        "You are not authorized to access this route"
      ) {
        return navigate("/unauthorized");
      }

      toast({
        title: "Failed to load quote",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadTags();
      loadQuote();
    }
  }, [id]);

  // TOGGLE TAG
  const toggleTag = (tagId: number) => {
    setTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((t) => t !== tagId)
        : [...prev, tagId]
    );
  };

  // GENERATE DESC
  const generateDesc = (quote: string, author: string) => {
    return `
      <blockquote>
        &ldquo;${quote}&rdquo;
        <footer>— ${author}</footer>
      </blockquote>
    `;
  };

  // UPDATE
  const handleUpdate = async () => {
    if (!author.trim() || !quote.trim()) {
      return toast({
        title: "Required fields missing",
        description: "Author and Quote are required",
        variant: "destructive",
      });
    }

    try {
      setSaving(true);

      const desc = generateDesc(quote, author);

      await UpdateQuoteAPI(id, {
        author: author.trim(),
        quote: quote.trim(),
        desc,
        tags,
      });

      toast({ title: "Quote updated successfully" });
      navigate("/quotes");
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.response?.data?.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        Loading quote...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Edit Quote</h1>

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
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
            />
          </div>

          {/* TAGS */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Tags
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
              <p className="text-lg font-medium">“{quote}”</p>
              <p className="text-sm text-muted-foreground mt-1">
                — {author || "Author"}
              </p>
            </div>
          )}

          {/* ACTION */}
          <div className="flex justify-end">
            <Button onClick={handleUpdate} disabled={saving}>
              {saving ? "Updating..." : "Update Quote"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}