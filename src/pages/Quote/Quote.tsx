/** @format */

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Papa from "papaparse";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

import { BookOpen, Eye, Pencil, Plus, Trash2, Upload } from "lucide-react";

import {
  GetAllQuotesAPI,
  DeleteQuoteAPI,
  AddBulkQuoteAPI,
} from "@/services/Api/QuoteApi";

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [sortField, setSortField] = useState<string>("quote");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const { toast } = useToast();
  const navigate = useNavigate();

  const limit = 100;

  // 🔥 DEBOUNCE SEARCH
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // reset page on search
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  // LOAD QUOTES
  const loadQuotes = async () => {
    try {
      setLoading(true);

      const res = await GetAllQuotesAPI({
        page,
        search: debouncedSearch,
      });

      const data = res?.data?.data;

      setQuotes(Array.isArray(data?.data) ? data.data : []);
      setTotal(data?.total || 0);
    } catch (error: any) {
      if (
        error.response?.data?.message ===
        "You are not authorized to access this route"
      ) {
        return navigate("/unauthorized");
      }

      toast({
        title: "Failed to load quotes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sortedQuotes = [...quotes].sort((a, b) => {
    let valA: any;
    let valB: any;

    switch (sortField) {
      case "quote":
        valA = a.quote || "";
        valB = b.quote || "";
        return sortOrder === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);

      case "author":
        valA = a.author || "";
        valB = b.author || "";
        return sortOrder === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);

      case "tags":
        valA = (a.QuoteTags || []).map((t: any) => t.title).join(", ");
        valB = (b.QuoteTags || []).map((t: any) => t.title).join(", ");
        return sortOrder === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);

      default:
        return 0;
    }
  });

  useEffect(() => {
    loadQuotes();
  }, [page, debouncedSearch]);

  // DELETE
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this quote?")) return;

    try {
      await DeleteQuoteAPI(id);
      toast({ title: "Quote deleted successfully" });
      loadQuotes();
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.response?.data?.message,
        variant: "destructive",
      });
    }
  };

  const totalPages = Math.ceil(total / limit);

  // 🔢 PAGINATION LOGIC
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, page + 2);

    // 👇 FIX 1: when totalPages small
    if (totalPages <= maxVisible) {
      start = 1;
      end = totalPages;
    } else {
      if (page <= 3) {
        start = 1;
        end = maxVisible;
      }

      if (page >= totalPages - 2) {
        start = Math.max(1, totalPages - maxVisible + 1); // ✅ FIX HERE
        end = totalPages;
      }
    }

    // 👇 safety clamp
    start = Math.max(1, start);

    // FIRST
    if (start > 1) pages.push(1);
    if (start > 2) pages.push("...");

    // RANGE
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // LAST
    if (end < totalPages - 1) pages.push("...");
    if (end < totalPages) pages.push(totalPages);

    return pages;
  };

  const handleCSVUpload = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const parsedData = results.data;

          const generateDesc = (quote: string, author: string) => {
            return `
    <blockquote>
      &ldquo;${quote}&rdquo;
      <footer>— ${author}</footer>
    </blockquote>
  `;
          };

          const quotes = parsedData.map((row: any) => ({
            author: row.author,
            quote: row.quote,
            desc: generateDesc(row.quote, row.author), // ✅ AUTO
            tags: row.tags
              ? String(row.tags)
                  .split("|")
                  .map((t: string) => t.trim())
                  .filter(Boolean)
              : [],
          }));

          await AddBulkQuoteAPI({
            add_type: "multiple",
            quotes,
          });

          toast({ title: "Bulk quotes uploaded successfully 🚀" });
          setSelectedFile(null);
          loadQuotes();
        } catch (err: any) {
          toast({
            title: "Upload failed",
            description: err.message,
            variant: "destructive",
          });
        }
      },
    });
  };

  const downloadSampleCSV = () => {
    const csvContent = `author,quote,tags
John Doe,"Life is short, make it count.","Motivation|Life"
Jane Smith,"Stay strong and keep going.","Success|Growth"`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "quotes_sample.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Quotes</h1>
          <p className="text-muted-foreground mt-1">
            Browse and manage all quotes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            id="csvUpload"
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setSelectedFile(file);
                handleCSVUpload(file);
                e.target.value = "";
              }
            }}
          />

          {/* Upload button */}
          <Button
            variant="outline"
            onClick={() => {
              document.getElementById("csvUpload")?.click();
            }}
          >
            <Upload className="h-4 w-4" />
            Upload CSV
          </Button>

          {/* Instructions button */}
          <Button variant="secondary" onClick={() => setShowInstructions(true)}>
            <BookOpen className="h-4 w-4" />
            Instructions
          </Button>

          {/* File name */}
          {selectedFile && (
            <span className="text-sm text-muted-foreground">
              {selectedFile.name}
            </span>
          )}
          <Input
            placeholder="Search quotes or authors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72"
          />

          <Button onClick={() => navigate("/quotes/add")}>
            <Plus className="h-4 w-4 mr-1" />
            Add Quote
          </Button>
        </div>
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
                    <TableHead
                      onClick={() => {
                        setSortField("quote");
                        setSortOrder((prev) =>
                          prev === "asc" ? "desc" : "asc",
                        );
                      }}
                      className="sortable-th"
                    >
                      <div className="flex items-center gap-2">
                        <ArrowUpDown
                          size={13}
                          className={
                            sortField === "quote" ? "opacity-100" : "opacity-40"
                          }
                        />
                        Quote
                      </div>
                    </TableHead>
                    <TableHead
                      onClick={() => {
                        setSortField("author");
                        setSortOrder((prev) =>
                          prev === "asc" ? "desc" : "asc",
                        );
                      }}
                      className="sortable-th"
                    >
                      <div className="flex items-center gap-2">
                        <ArrowUpDown
                          size={13}
                          className={
                            sortField === "author"
                              ? "opacity-100"
                              : "opacity-40"
                          }
                        />
                        Author
                      </div>
                    </TableHead>
                    <TableHead
                      onClick={() => {
                        setSortField("tags");
                        setSortOrder((prev) =>
                          prev === "asc" ? "desc" : "asc",
                        );
                      }}
                      className="sortable-th"
                    >
                      <div className="flex items-center gap-2">
                        <ArrowUpDown
                          size={13}
                          className={
                            sortField === "tags" ? "opacity-100" : "opacity-40"
                          }
                        />
                        Tags
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {sortedQuotes.map((q: any, index: number) => (
                    <TableRow key={q.id}>
                      <TableCell>{(page - 1) * limit + index + 1}</TableCell>

                      <TableCell className="max-w-md">
                        <p className="truncate">
                          {q.quote.length > 100
                            ? q.quote.slice(0, 100) + "..."
                            : q.quote}
                        </p>
                      </TableCell>

                      <TableCell>{q.author}</TableCell>

                      <TableCell>
                        {q.QuoteTags?.map((t: any) => t.title).join(", ") ||
                          "—"}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => navigate(`/quotes/view/${q.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => navigate(`/quotes/edit/${q.id}`)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => handleDelete(q.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* PAGINATION */}
              <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </p>

                <div className="flex items-center gap-1 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Prev
                  </Button>

                  {getPageNumbers().map((p, index) =>
                    p === "..." ? (
                      <span key={index} className="px-2">
                        ...
                      </span>
                    ) : (
                      <Button
                        key={p}
                        size="sm"
                        variant={page === p ? "default" : "outline"}
                        onClick={() => setPage(Number(p))}
                      >
                        {p}
                      </Button>
                    ),
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>

                  <Input
                    type="number"
                    placeholder="Go"
                    className="w-20 ml-2"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const val = Number(
                          (e.target as HTMLInputElement).value,
                        );
                        if (val >= 1 && val <= totalPages) {
                          setPage(val);
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {showInstructions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg p-6 w-full max-w-[650px] max-h-[80vh] overflow-y-auto shadow-xl">
            {/* HEADER */}
            <h2 className="text-xl font-bold mb-4">
              📘 How to Upload Quotes CSV
            </h2>

            {/* STEPS */}
            <div className="space-y-2 text-sm mb-5">
              <p>
                <strong>Step 1:</strong> Download the sample CSV file
              </p>
              <p>
                <strong>Step 2:</strong> Add your quotes in the same format
              </p>
              <p>
                <strong>Step 3:</strong> Upload the file using "Upload CSV"
              </p>
            </div>

            {/* DOWNLOAD BUTTON */}
            <Button
              variant="outline"
              className="mb-5"
              onClick={downloadSampleCSV}
            >
              ⬇️ Download Sample CSV
            </Button>

            {/* FORMAT */}

            <div className="mb-5">
              <h3 className="font-semibold mb-2">📄 Required Format</h3>

              <div className="bg-muted p-3 rounded text-xs font-mono whitespace-pre leading-relaxed">
                {`author,quote,tags
John Doe,"Life is short, make it count.","Motivation|Life"
Jane Smith,"Stay strong and keep going.","Success|Growth"`}
              </div>
            </div>

            {/* RULES */}
            <div className="mb-5">
              <h3 className="font-semibold mb-2">📌 Rules</h3>

              <ul className="text-sm space-y-2 leading-relaxed">
                <li>
                  • The CSV file must include the header row exactly as:
                  author,quote,tags.
                </li>
                <li> • Do not rename or remove any column headers</li>
                <li>
                  • <strong>author</strong> → Name of the author
                </li>
                <li>
                  • <strong>quote</strong> → Required (main text)
                </li>
                <li>
                  • <strong>tags</strong> → Optional
                </li>
                <li>
                  • Use <strong>|</strong> to separate multiple tags
                </li>
                <li>
                  • Example: <code>Motivation|Success|Life</code>
                </li>
                <li>
                  • Wrap tags in <strong>" "</strong> if using multiple values
                </li>
                <li>
                  • Quotes must be wrapped in <strong>" "</strong> if they
                  contain commas
                </li>
                <li>• Description is generated automatically</li>
                <li>• New tags will be created automatically</li>
              </ul>
            </div>

            {/* FOOTER */}
            <div className="flex justify-end">
              <Button onClick={() => setShowInstructions(false)}>
                Got it 👍
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
