/** @format */

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sparkles,
  Save,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  GenerateCoverAPI,
  GetProjectDetailsAPI,
  UpdateBookCoverAPI,
} from "@/services/Api/ProjectApi";
import { IMAGE_BASE_URL } from "@/config/env";

const sizes = ["512x512", "768x1024", "1024x1024"];

const CoverGenerator = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("id");
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [author, setAuthor] = useState("");
  const [size, setSize] = useState("1024x1024");
  const [styleDirection, setStyleDirection] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [genreId, setGenreId] = useState<number | null>(null);
  const [coverImageName, setCoverImageName] = useState<string | null>(null);

  // -----------------------------
  // LOAD PROJECT DATA
  // -----------------------------
  const loadProject = async () => {
    try {
      const res = await GetProjectDetailsAPI(projectId);
      const p = res.data.data;

      setTitle(p.title);
      setGenre(p.book_genre?.title || "");
      setGenreId(p.book_genre?.id || null);
      setAuthor(p.book_user?.user_profile?.name || "");

      if (p.cover_img_name) {
        setCoverUrl(`${IMAGE_BASE_URL}/${p.cover_img_name}`);
      }
    } catch {
      toast({
        title: "Failed to load project",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, []);

  // -----------------------------
  // GENERATE COVER (BACKEND)
  // -----------------------------
  const handleGenerateCovers = async () => {
    if (!title || !genre || !author) {
      return toast({
        title: "Missing Required Fields",
        description: "Title, Genre, and Author are required.",
        variant: "destructive",
      });
    }

    setIsGenerating(true);

    try {
      const res = await GenerateCoverAPI({
        title,
        genre,
        author,
        size,
        direction: "vertical", 
        description: styleDirection,
      });

      const imageName = res.data?.fileName;

      if (!imageName) {
        throw new Error("No image returned");
      }
      setCoverImageName(imageName);

      setCoverUrl(`${IMAGE_BASE_URL}/${imageName}`);

      toast({
        title: "Cover Generated",
        description: "Book cover generated successfully.",
      });
    } catch {
      toast({
        title: "Generation Failed",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold">Cover Generator</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT */}
        <Card>
          <CardHeader>
            <CardTitle>Cover Details</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <Label>Book Title</Label>
              <Input value={title} disabled />
            </div>

            <div>
              <Label>Genre</Label>
              <Input value={genre} disabled />
            </div>

            <div>
              <Label>Author</Label>
              <Input value={author} disabled />
            </div>

            <div>
              <Label>Size</Label>
              <Select value={size} onValueChange={setSize}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sizes.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Cover Description</Label>
              <Textarea
                required
                value={styleDirection}
                onChange={(e) => setStyleDirection(e.target.value)}
                placeholder="Describe your cover... e.g. dark fantasy with castle, glowing wand, cinematic lighting OR minimalist pastel design OR romantic theme with hearts"
              />
            </div>

            <Button
              onClick={handleGenerateCovers}
              disabled={isGenerating}
              size="lg"
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {coverUrl ? "Regenerate Cover" : "Generate Cover"}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* RIGHT */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Cover</CardTitle>
          </CardHeader>

          <CardContent>
            {!coverUrl ? (
              <div className="text-center text-muted-foreground py-20">
                <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                No cover generated yet
              </div>
            ) : (
              <ScrollArea className="h-[600px]">
                <Card>
                  <img
                    src={coverUrl}
                    alt="Book Cover"
                    className="w-full h-auto rounded"
                  />
                  <CardContent className="space-y-2 mt-2">
                    <Button
                      size="sm"
                      onClick={async () => {
                        if (!coverImageName || !genreId) {
                          return toast({
                            title: "Missing Data",
                            description: "Please generate a cover first.",
                            variant: "destructive",
                          });
                        }

                        try {
                          await UpdateBookCoverAPI({
                            book_id: Number(projectId),
                            title,
                            author,
                            genre_id: genreId,
                            cover_img_name: coverImageName,
                            description: styleDirection,
                          });

                          toast({
                            title: "Cover Saved",
                            description:
                              "Book cover and details updated successfully.",
                          });
                        } catch {
                          toast({
                            title: "Save Failed",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      <Save className="h-3 w-3 mr-1" /> Save Cover
                    </Button>
                  </CardContent>
                </Card>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CoverGenerator;
