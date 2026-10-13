import { useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  User, 
  Tag, 
  Edit, 
  X,
  CheckCircle,
  Send,
  Calendar,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock manuscript data
const manuscript = {
  id: 1,
  title: "The Art of Digital Storytelling",
  author: "Sarah Mitchell",
  genre: "Technology",
  editingType: "Comprehensive Edit",
  assignedDate: "2024-01-15",
  dueDate: "2024-02-15",
  wordCount: 85000,
  status: "in-progress"
};

interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
}

const DeliverManuscript = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [notes, setNotes] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isDelivering, setIsDelivering] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const manuscriptId = searchParams.get("id");

  const allowedFileTypes = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
    'application/pdf', // PDF
    'application/epub+zip' // EPUB
  ];

  const allowedExtensions = ['.docx', '.pdf', '.epub'];

  const validateFile = (file: File): boolean => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    return allowedFileTypes.includes(file.type) || allowedExtensions.includes(extension);
  };

  const handleFileUpload = useCallback((files: File[]) => {
    const validFiles = files.filter(validateFile);
    const invalidFiles = files.filter(file => !validateFile(file));

    if (invalidFiles.length > 0) {
      toast({
        title: "Invalid File Types",
        description: `Only DOCX, PDF, and EPUB files are allowed. ${invalidFiles.length} file(s) were rejected.`,
        variant: "destructive",
      });
    }

    const newFiles: UploadedFile[] = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: file.size,
      type: file.type
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    if (validFiles.length > 0) {
      toast({
        title: "Files Uploaded",
        description: `${validFiles.length} file(s) uploaded successfully.`,
      });
    }
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFileUpload(files);
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    toast({
      title: "File Removed",
      description: "File has been removed from the delivery.",
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDeliverManuscript = () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "No Files Uploaded",
        description: "Please upload at least one file before delivering the manuscript.",
        variant: "destructive",
      });
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmDelivery = async () => {
    setIsDelivering(true);
    setShowConfirmModal(false);

    // Simulate delivery process
    setTimeout(() => {
      setIsDelivering(false);
      toast({
        title: "Manuscript Delivered!",
        description: `"${manuscript.title}" has been successfully delivered to ${manuscript.author}.`,
      });
      navigate("/editing-queue");
    }, 2000);
  };

  const handleBack = () => {
    navigate("/editing-queue");
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return <FileText className="h-5 w-5 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleBack}
          className="hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Deliver Manuscript</h1>
          <p className="text-muted-foreground mt-1">
            Complete the editing process and deliver to author
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Manuscript Details */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Manuscript Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Title</p>
                    <p className="font-semibold">{manuscript.title}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Author</p>
                    <p className="font-semibold">{manuscript.author}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Tag className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Genre</p>
                    <Badge variant="outline">{manuscript.genre}</Badge>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Edit className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Editing Type</p>
                    <Badge variant="secondary">{manuscript.editingType}</Badge>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Due Date</p>
                    <p className="font-semibold">
                      {new Date(manuscript.dueDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Word Count</p>
                    <p className="font-semibold">{manuscript.wordCount.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Upload and Notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* File Upload Area */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Final Manuscript Files
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragOver
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-muted-foreground/50"
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">Upload Final Files</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Drag and drop files here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  Supported formats: DOCX, PDF, EPUB (Max 20MB per file)
                </p>
                <input
                  type="file"
                  multiple
                  accept=".docx,.pdf,.epub,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf,application/epub+zip"
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-upload"
                />
                <Label htmlFor="file-upload">
                  <Button variant="outline" className="cursor-pointer" asChild>
                    <span>Choose Files</span>
                  </Button>
                </Label>
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h4 className="font-medium text-sm">Uploaded Files ({uploadedFiles.length})</h4>
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getFileIcon(file.name)}
                        <div>
                          <p className="font-medium text-sm">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes Section */}
          <Card>
            <CardHeader>
              <CardTitle>Editor's Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="notes">Comments for Author</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any final comments, suggestions, or notes for the author..."
                  rows={6}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  These notes will be included in the delivery email to the author.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={handleDeliverManuscript}
              disabled={isDelivering}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              size="lg"
            >
              {isDelivering ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2 animate-pulse" />
                  Delivering...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Deliver to Author
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isDelivering}
              size="lg"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Manuscript Delivery</DialogTitle>
            <DialogDescription>
              Are you sure you want to deliver this manuscript to the author? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Manuscript:</span>
                <span className="font-medium">{manuscript.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Author:</span>
                <span className="font-medium">{manuscript.author}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Files:</span>
                <span className="font-medium">{uploadedFiles.length} file(s)</span>
              </div>
              {notes && (
                <div>
                  <span className="text-muted-foreground">Notes included:</span>
                  <p className="text-xs bg-muted/30 p-2 rounded mt-1 max-h-20 overflow-y-auto">
                    {notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmDelivery}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Send className="h-4 w-4 mr-2" />
              Confirm Delivery
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeliverManuscript;