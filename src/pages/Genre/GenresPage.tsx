/** @format */

import { useEffect, useState } from "react";
import { Card,   CardContent } from "@/components/ui/card";
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
import { useNavigate } from "react-router";
import {
  AddGenreAPI,
  GetAllGenresAPI,
  UpdateGenreAPI,
  DeleteGenreAPI,
} from "@/services/Api/GenreApi";
import { Pencil, Trash2, Plus } from "lucide-react";

export default function GenresPage() {
  const [genres, setGenres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [genreTitle, setGenreTitle] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [sortField, setSortField] = useState<string>("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const { toast } = useToast();
  const navigate = useNavigate();

  // LOAD GENRES
  const loadGenres = async () => {
    try {
      const res = await GetAllGenresAPI();
      setGenres(res.data.data || []);
    } catch (error: any) {
      if (
        error.response?.data?.message ===
        "You are not authorized to access this route"
      ) {
        return navigate("/unauthorized");
      }

      toast({
        title: "Failed to load genres",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGenres();
  }, []);

  // OPEN ADD MODAL
  const openAddGenre = () => {
    setEditId(null);
    setGenreTitle("");
    setIsModalOpen(true);
  };

  // OPEN EDIT MODAL
  const openEditGenre = (genre: any) => {
    setEditId(genre.id);
    setGenreTitle(genre.title);
    setIsModalOpen(true);
  };

  // DELETE GENRE
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this genre?")) return;

    try {
      await DeleteGenreAPI(id);
      toast({ title: "Genre deleted successfully" });
      loadGenres();
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  // SAVE GENRE (CREATE OR UPDATE)
  const handleSave = async () => {
    if (!genreTitle.trim()) {
      return toast({
        title: "Title required",
        description: "Genre title cannot be empty.",
        variant: "destructive",
      });
    }

    try {
      if (editId) {
        await UpdateGenreAPI(editId, { title: genreTitle });
        toast({ title: "Genre updated successfully" });
      } else {
        await AddGenreAPI({ title: genreTitle });
        toast({ title: "Genre added successfully" });
      }

      setIsModalOpen(false);
      loadGenres();
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
    }
  };

  const sortedGenres = [...genres].sort((a, b) => {
    let valA: any;
    let valB: any;

    switch (sortField) {
      case "id":
        valA = a.id;
        valB = b.id;
        return sortOrder === "asc" ? valA - valB : valB - valA;

      case "name":
        valA = a.title || "";
        valB = b.title || "";
        return sortOrder === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);

      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Genre</h1>
          <p className="text-muted-foreground mt-1">
            Manage all book genres used across manuscripts.
          </p>
        </div>

        <Button onClick={openAddGenre} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Genre
        </Button>
      </div>

      {/* GENRE TABLE */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    onClick={() => {
                      setSortField("id");
                      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
                    }}
                    className="sortable-th"
                  >
                    <div className="flex items-center gap-2">
                      <ArrowUpDown
                        size={13}
                        className={
                          sortField === "id" ? "opacity-100" : "opacity-40"
                        }
                      />
                      ID
                    </div>
                  </TableHead>
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
                {sortedGenres.map((genre: any, index: number) => (
                  <TableRow key={genre.id} className="h-12">
                    <TableCell className="py-3">{index + 1}</TableCell>

                    <TableCell className="font-medium py-3">
                      {genre.title}
                    </TableCell>

                    <TableCell className="text-right py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditGenre(genre)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDelete(genre.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {genres.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center text-muted-foreground py-4"
                    >
                      No genres found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ADD / EDIT MODAL */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Genre" : "Add Genre"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            <label className="text-sm font-medium">Genre Title</label>
            <Input
              placeholder="Enter genre title"
              value={genreTitle}
              onChange={(e) => setGenreTitle(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>{editId ? "Update" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
