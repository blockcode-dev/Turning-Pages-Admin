/** @format */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { CalendarIcon, Eye, Filter } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import axios from "axios";
import { GetAllEditingQueueAPI } from "@/services/Api/ProjectApi";


const statuses = ["All Statuses", "draft", "in-editing", "completed"];

const getStatusBadge = (status: string) => {
  const formatted =
    status === "in-editing"
      ? "In Editing"
      : status.charAt(0).toUpperCase() + status.slice(1);

  switch (status) {
    case "draft":
      return <Badge className="bg-muted text-muted-foreground">{formatted}</Badge>;
    case "in-editing":
      return <Badge className="bg-blue-500 text-white">{formatted}</Badge>;
    case "completed":
      return <Badge className="bg-green-600 text-white">{formatted}</Badge>;
    default:
      return <Badge>{formatted}</Badge>;
  }
};


const EditingQueue = () => {
  const [manuscripts, setManuscripts] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);

  const [genres, setGenres] = useState<string[]>(["All Genres"]);

  const [selectedGenre, setSelectedGenre] = useState("All Genres");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [selectedDate, setSelectedDate] = useState<Date>();

  const [selectedManuscript, setSelectedManuscript] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();

  const loadManuscripts = async () => {
    try {
      const res = await GetAllEditingQueueAPI()

      const list = res.data.data || [];

      setManuscripts(list);

      // collect genres dynamically
      const g = list.map((b: any) => b.book_genre?.title).filter(Boolean);
      setGenres(["All Genres", ...new Set(g)]);

      setFiltered(list);
    } catch (err: any) {
      if (
        err.response?.data?.message === "You are not authorized to access this route"
      ) {
        return navigate("/unauthorized");
      }
      console.error(err);
    }
  };

  useEffect(() => {
    loadManuscripts();
  }, []);

  useEffect(() => {
    let result = manuscripts;

    if (selectedGenre !== "All Genres") {
      result = result.filter((m) => m.book_genre?.title === selectedGenre);
    }

    if (selectedStatus !== "All Statuses") {
      result = result.filter((m) => m.status === selectedStatus);
    }

    if (selectedDate) {
      const ds = format(selectedDate, "yyyy-MM-dd");
      result = result.filter((m) => m.created_at?.startsWith(ds));
    }

    setFiltered(result);
  }, [selectedGenre, selectedStatus, selectedDate, manuscripts]);


  const handleViewManuscript = (m: any) => {
    setSelectedManuscript(m);
    setIsModalOpen(true);
  };

  const formatWordCount = (count: number) => count?.toLocaleString() || "0";

  const formatStatus = (status: string) => {
  if (status === "All Statuses") return status;
  if (status === "in-editing") return "In Editing";

  return status.charAt(0).toUpperCase() + status.slice(1);
};


  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Editing Queue</h1>
        <p className="text-muted-foreground mt-2">
          Manage and track manuscripts in the editorial pipeline
        </p>
      </div>

      {/* FILTERS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" /> Filters
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex flex-wrap gap-4">
            {/* GENRE FILTER */}
            <div>
              <label className="text-sm font-medium">Genre</label>
              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {genres.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* STATUS FILTER */}
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s} value={s}>
                   {formatStatus(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* DATE FILTER */}
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Submission Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-48 justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* CLEAR BUTTON */}
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedGenre("All Genres");
                  setSelectedStatus("All Statuses");
                  setSelectedDate(undefined);
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Manuscripts ({filtered.length})</CardTitle>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Book Title</TableHead>
                <TableHead>Author Name</TableHead>
                <TableHead>Genre</TableHead>
                <TableHead>Word Count</TableHead>
                <TableHead>Submission Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.title}</TableCell>
                  <TableCell>{m.book_user?.user_profile?.name || "Unknown"}</TableCell>
                  <TableCell>{m.book_genre?.title || "-"}</TableCell>
                  <TableCell>{formatWordCount(m.word_count)}</TableCell>
                  <TableCell>
                    {format(new Date(m.created_at), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>{getStatusBadge(m.status)}</TableCell>

                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewManuscript(m)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View Manuscript
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No manuscripts found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* MODAL */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manuscript Details</DialogTitle>
          </DialogHeader>

          {selectedManuscript && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Title</label>
                  <p className="text-lg font-semibold">{selectedManuscript.title}</p>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">Author</label>
                  <p className="text-lg font-semibold">
                    {selectedManuscript.book_user?.user_profile?.name}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">Genre</label>
                  <p>{selectedManuscript.book_genre?.title}</p>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">Word Count</label>
                  <p>{formatWordCount(selectedManuscript.word_count)} words</p>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">
                    Submission Date
                  </label>
                  <p>
                    {format(new Date(selectedManuscript.created_at), "MMMM dd, yyyy")}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedManuscript.status)}</div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => {
                    setIsModalOpen(false);
                    navigate(`/assign-project?id=${selectedManuscript.id}`);
                  }}
                  className="bg-primary text-primary-foreground"
                >
                  Assign Project
                </Button>

                <Button variant="outline">Open in Editorial Suite</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditingQueue;
