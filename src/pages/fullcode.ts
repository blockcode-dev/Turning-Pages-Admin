import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowLeft, 
  FileText, 
  User, 
  Calendar, 
  Hash, 
  Mail, 
  Shield, 
  Edit3,
  Upload,
  Download,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  UserCheck,
  Eye,
  BookOpen,
  Activity
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

// Mock project data
const mockProject = {
  id: 1,
  title: "The Digital Renaissance",
  author: {
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    avatar: "/api/placeholder/48/48",
    bio: "Sarah is a technology writer with over 10 years of experience in digital transformation and AI. She has authored three previous books on emerging technologies.",
    accountStatus: "verified",
    joinDate: "2023-05-15",
    totalManuscripts: 4
  },
  wordCount: 89500,
  genre: "Technology",
  submissionDate: "2024-01-15",
  status: "in-progress",
  assignedEditor: {
    name: "Dr. Emily Carter",
    role: "Super Admin",
    email: "emily.carter@turningpages.com",
    avatar: "/api/placeholder/48/48"
  },
  chapters: [
    { id: 1, title: "Chapter 1: The Dawn of Digital Age", wordCount: 3500 },
    { id: 2, title: "Chapter 2: AI and Human Creativity", wordCount: 4200 },
    { id: 3, title: "Chapter 3: The Future of Work", wordCount: 3800 },
    { id: 4, title: "Chapter 4: Digital Ethics", wordCount: 4100 },
    { id: 5, title: "Chapter 5: Conclusion", wordCount: 2900 }
  ],
  otherManuscripts: [
    { id: 2, title: "Machine Learning Basics", status: "completed", date: "2023-08-20" },
    { id: 3, title: "The Future of AI", status: "delivered", date: "2023-11-15" },
    { id: 4, title: "Digital Transformation Guide", status: "in-progress", date: "2024-01-10" }
  ],
  timeline: [
    { id: 1, event: "Manuscript Submitted", date: "2024-01-15", time: "09:30 AM", type: "submitted" },
    { id: 2, event: "Assigned to Dr. Emily Carter", date: "2024-01-16", time: "02:15 PM", type: "assigned" },
    { id: 3, event: "Editorial review started", date: "2024-01-18", time: "10:00 AM", type: "editing" },
    { id: 4, event: "Chapter 1-3 completed", date: "2024-01-25", time: "04:30 PM", type: "progress" },
    { id: 5, event: "Author feedback requested", date: "2024-01-28", time: "11:20 AM", type: "feedback" }
  ],
  permissions: {
    viewOnly: false,
    edit: true,
    deliver: true
  },
  notes: "Author is very responsive to feedback. Prefers detailed explanations for suggested changes. Technical accuracy is important - verify all AI-related claims.",
  deliverables: [
    { id: 1, name: "manuscript_draft_v1.docx", size: "2.3 MB", uploadDate: "2024-01-15" },
    { id: 2, name: "edited_manuscript_v2.docx", size: "2.4 MB", uploadDate: "2024-01-25" }
  ],
  editorRemarks: "Excellent technical content. Made significant improvements to structure and flow. Ready for final review before delivery."
};

const editors = [
  { name: "Dr. Emily Carter", role: "Super Admin" },
  { name: "Marcus Rodriguez", role: "Senior Editor" },
  { name: "Jessica Chen", role: "Senior Editor" },
  { name: "David Thompson", role: "Assistant Editor" },
  { name: "Lisa Wang", role: "Assistant Editor" }
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "submitted":
      return <Badge variant="secondary" className="bg-muted text-muted-foreground">Submitted</Badge>;
    case "in-progress":
      return <Badge className="bg-info text-info-foreground">In Progress</Badge>;
    case "completed":
      return <Badge className="bg-success text-success-foreground">Completed</Badge>;
    case "delivered":
      return <Badge className="bg-primary text-primary-foreground">Delivered</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const getRoleBadge = (role: string) => {
  switch (role) {
    case "Super Admin":
      return <Badge variant="destructive">Super Admin</Badge>;
    case "Senior Editor":
      return <Badge variant="default">Senior Editor</Badge>;
    case "Assistant Editor":
      return <Badge variant="secondary">Assistant Editor</Badge>;
    default:
      return <Badge variant="outline">{role}</Badge>;
  }
};

const getTimelineIcon = (type: string) => {
  switch (type) {
    case "submitted":
      return <Upload className="h-4 w-4 text-blue-600" />;
    case "assigned":
      return <UserCheck className="h-4 w-4 text-green-600" />;
    case "editing":
      return <Edit3 className="h-4 w-4 text-orange-600" />;
    case "progress":
      return <Clock className="h-4 w-4 text-primary" />;
    case "feedback":
      return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    default:
      return <Activity className="h-4 w-4 text-muted-foreground" />;
  }
};

const ProjectDetails = () => {
  const [selectedEditor, setSelectedEditor] = useState(mockProject.assignedEditor.name);
  const [permissions, setPermissions] = useState(mockProject.permissions);
  const [notes, setNotes] = useState(mockProject.notes);
  const [editorRemarks, setEditorRemarks] = useState(mockProject.editorRemarks);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("id") || "1";

  const handleBack = () => {
    navigate("/projects");
  };

  const handleOpenEditorial = () => {
    navigate(`/editorial-suite?id=${projectId}`);
  };

  const handleReassignEditor = () => {
    toast({
      title: "Editor Reassigned",
      description: `Project has been reassigned to ${selectedEditor}.`,
    });
  };

  const handleSaveNotes = () => {
    toast({
      title: "Notes Saved",
      description: "Internal notes have been updated successfully.",
    });
  };

  const handleDeliverManuscript = () => {
    navigate(`/deliver-manuscript?id=${projectId}`);
  };

  const handleDownloadFile = (fileName: string) => {
    toast({
      title: "Download Started",
      description: `Downloading ${fileName}...`,
    });
  };

  const formatFileSize = (bytes: string) => bytes;

  return (
    <div className="space-y-6 max-w-7xl">
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
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">{mockProject.title}</h1>
          <p className="text-muted-foreground mt-1">Project Details & Management</p>
        </div>
      </div>

      {/* Header Section */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold">{mockProject.title}</h2>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {mockProject.author.name}
                  </div>
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {mockProject.author.email}
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    {mockProject.author.accountStatus}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-1">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{mockProject.wordCount.toLocaleString()}</span>
                  <span className="text-muted-foreground">words</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>{mockProject.genre}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{format(new Date(mockProject.submissionDate), "MMM dd, yyyy")}</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              {getStatusBadge(mockProject.status)}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="manuscript" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="manuscript">Manuscript</TabsTrigger>
          <TabsTrigger value="user-info">User Info</TabsTrigger>
          <TabsTrigger value="editors">Editors & Access</TabsTrigger>
          {/* <TabsTrigger value="activity">Activity & Notes</TabsTrigger>
          <TabsTrigger value="deliverables">Deliverables</TabsTrigger> */}
        </TabsList>

        {/* Manuscript Tab */}
        <TabsContent value="manuscript" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Chapter Structure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockProject.chapters.map((chapter, index) => (
                  <div key={chapter.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{chapter.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {chapter.wordCount.toLocaleString()} words
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Chapter {index + 1}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t">
                <Button onClick={handleOpenEditorial} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Open in Editorial Suite
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Info Tab */}
        <TabsContent value="user-info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Author Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={mockProject.author.avatar} />
                  <AvatarFallback>{mockProject.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{mockProject.author.name}</h3>
                  <p className="text-muted-foreground">{mockProject.author.email}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Member since {format(new Date(mockProject.author.joinDate), "MMM yyyy")}
                  </p>
                  <p className="mt-3 text-sm">{mockProject.author.bio}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Other Manuscripts by {mockProject.author.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockProject.otherManuscripts.map((manuscript) => (
                  <div key={manuscript.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{manuscript.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        Submitted {format(new Date(manuscript.date), "MMM dd, yyyy")}
                      </p>
                    </div>
                    {getStatusBadge(manuscript.status)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Editors & Access Tab */}
        <TabsContent value="editors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Editor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4 mb-6">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={mockProject.assignedEditor.avatar} />
                  <AvatarFallback>{mockProject.assignedEditor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold">{mockProject.assignedEditor.name}</h3>
                  <p className="text-sm text-muted-foreground">{mockProject.assignedEditor.email}</p>
                  <div className="mt-2">
                    {getRoleBadge(mockProject.assignedEditor.role)}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="reassign-editor" className="text-sm font-medium">
                    Reassign Editor
                  </Label>
                  <div className="flex gap-2 mt-2">
                    <Select value={selectedEditor} onValueChange={setSelectedEditor}>
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border border-border z-50">
                        {editors.map((editor) => (
                          <SelectItem key={editor.name} value={editor.name} className="hover:bg-muted cursor-pointer">
                            <div className="flex items-center justify-between w-full">
                              <span>{editor.name}</span>
                              <Badge variant="outline" className="ml-2 text-xs">
                                {editor.role}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleReassignEditor} variant="outline">
                      Reassign
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* <Card>
            <CardHeader>
              <CardTitle>Access Control</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="view-only">View Only</Label>
                    <p className="text-sm text-muted-foreground">Can only view the manuscript</p>
                  </div>
                  <Switch
                    id="view-only"
                    checked={permissions.viewOnly}
                    onCheckedChange={(checked) => 
                      setPermissions(prev => ({ ...prev, viewOnly: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="edit">Edit Permission</Label>
                    <p className="text-sm text-muted-foreground">Can edit the manuscript</p>
                  </div>
                  <Switch
                    id="edit"
                    checked={permissions.edit}
                    onCheckedChange={(checked) => 
                      setPermissions(prev => ({ ...prev, edit: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="deliver">Deliver Permission</Label>
                    <p className="text-sm text-muted-foreground">Can deliver final manuscript</p>
                  </div>
                  <Switch
                    id="deliver"
                    checked={permissions.deliver}
                    onCheckedChange={(checked) => 
                      setPermissions(prev => ({ ...prev, deliver: checked }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card> */}
        </TabsContent>

        {/* Activity & Notes Tab */}
        {/* <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-4">
                  {mockProject.timeline.map((item, index) => (
                    <div key={item.id} className="flex items-start gap-3">
                      <div className="mt-1">
                        {getTimelineIcon(item.type)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.event}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(item.date), "MMM dd, yyyy")} at {item.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Internal Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add internal notes about this project..."
                  rows={6}
                  className="resize-none"
                />
                <Button onClick={handleSaveNotes} variant="outline">
                  Save Notes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent> */}

        {/* Deliverables Tab */}
        {/* <TabsContent value="deliverables" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manuscript Files</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockProject.deliverables.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {file.size} • Uploaded {format(new Date(file.uploadDate), "MMM dd, yyyy")}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadFile(file.name)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 border-2 border-dashed rounded-lg text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Upload additional files (DOCX, PDF, EPUB)
                </p>
                <Button variant="outline" size="sm">
                  Choose Files
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Editor Remarks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  value={editorRemarks}
                  onChange={(e) => setEditorRemarks(e.target.value)}
                  placeholder="Add remarks about the editing process..."
                  rows={4}
                  className="resize-none"
                />
                
                <div className="flex gap-3">
                  <Button 
                    onClick={handleDeliverManuscript}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Deliver to Author
                  </Button>
                  <Button variant="outline">
                    Save Remarks
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent> */}
      </Tabs>
    </div>
  );
};

export default ProjectDetails;