/** @format */

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ArrowUpDown } from "lucide-react";
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

import { Pencil, Plus } from "lucide-react";
import {
  AddQuoteTagAPI,
  GetAllQuoteTagsAPI,
  UpdateQuoteTagAPI,
} from "@/services/Api/QuoteApi";

export default function QuoteTagsPage() {
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tagTitle, setTagTitle] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortField, setSortField] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const { toast } = useToast();
  const navigate = useNavigate();

  // 🔥 DEBOUNCE SEARCH
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  // LOAD TAGS
  const loadTags = async () => {
    try {
      setLoading(true);

      const res = await GetAllQuoteTagsAPI({
        page: 1,
        search: debouncedSearch,
      });

      setTags(res.data?.data?.data || []);
    } catch (error: any) {
      if (
        error.response?.data?.message ===
        "You are not authorized to access this route"
      ) {
        return navigate("/unauthorized");
      }

      toast({
        title: "Failed to load quote tags",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTags();
  }, [debouncedSearch]);

  // OPEN ADD
  const openAddTag = () => {
    setEditId(null);
    setTagTitle("");
    setIsModalOpen(true);
  };

  // OPEN EDIT
  const openEditTag = (tag: any) => {
    setEditId(tag.id);
    setTagTitle(tag.title);
    setIsModalOpen(true);
  };

  // SAVE (ADD / UPDATE)
  const handleSave = async () => {
    if (!tagTitle.trim()) {
      return toast({
        title: "Title required",
        description: "Tag title cannot be empty.",
        variant: "destructive",
      });
    }

    try {
      setSaving(true);

      const payload = {
        title: tagTitle.trim(),
      };

      if (editId) {
        await UpdateQuoteTagAPI(editId, payload);
        toast({ title: "Quote tag updated successfully" });
      } else {
        await AddQuoteTagAPI(payload);
        toast({ title: "Quote tag added successfully" });
      }

      // RESET
      setIsModalOpen(false);
      setTagTitle("");
      setEditId(null);

      // RELOAD
      loadTags();
    } catch (error: any) {
      if (
        error.response?.data?.message ===
        "You are not authorized to access this route"
      ) {
        return navigate("/unauthorized");
      }

      toast({
        title: "Action failed",
        description: error.response?.data?.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const sortedTags = [...tags].sort((a, b) => {
    let valA: any;
    let valB: any;

    switch (sortField) {
      case "name":
        valA = a.title || "";
        valB = b.title || "";
        return sortOrder === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);

      case "id":
        valA = a.id;
        valB = b.id;
        return sortOrder === "asc" ? valA - valB : valB - valA;

      default:
        return 0;
    }
  });

  return (
    <div className="max-w-6xl space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quote Tags</h1>
          <p className="text-muted-foreground mt-1">
            Manage tags used in quote requests and categorization.
          </p>
        </div>

        <div className="flex gap-4">
          <Input
            placeholder="Search tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />

          <Button onClick={openAddTag} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Tag
          </Button>
        </div>
      </div>

      {/* TABLE */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">#</TableHead>
                  <TableHead
                    onClick={() => {
                      setSortField("name");
                      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
                    }}
                    className="sortable-th"
                  >
                    <div className="flex items-center gap-2">
                      <ArrowUpDown
                        size={13}
                        className={
                          sortField === "name" ? "opacity-100" : "opacity-40"
                        }
                      />
                      Name
                    </div>
                  </TableHead>
                  <TableHead className="text-right w-[150px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {sortedTags.map((tag: any, index: number) => (
                  <TableRow key={tag.id}>
                    <TableCell>{index + 1}</TableCell>

                    <TableCell className="font-medium">{tag.title}</TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openEditTag(tag)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {tags.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center text-muted-foreground py-4"
                    >
                      No tags found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* MODAL */}
      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);

          if (!open) {
            setTagTitle("");
            setEditId(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Tag" : "Add Tag"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            <label className="text-sm font-medium">Tag Title</label>
            <Input
              autoFocus
              placeholder="Enter tag title"
              value={tagTitle}
              onChange={(e) => setTagTitle(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>

            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editId ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
