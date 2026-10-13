import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  Users, 
  FileText, 
  Clock, 
  CheckCircle, 
  CalendarIcon,
  TrendingUp,
  Activity,
  Timer
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Mock data
const kpiData = {
  totalUsers: 1247,
  totalManuscripts: 342,
  inProgress: 28,
  completed: 314
};

const submissionsOverTime = [
  { month: "Jan", submissions: 25 },
  { month: "Feb", submissions: 32 },
  { month: "Mar", submissions: 28 },
  { month: "Apr", submissions: 41 },
  { month: "May", submissions: 35 },
  { month: "Jun", submissions: 48 },
  { month: "Jul", submissions: 52 },
  { month: "Aug", submissions: 38 },
  { month: "Sep", submissions: 44 },
  { month: "Oct", submissions: 39 },
  { month: "Nov", submissions: 47 },
  { month: "Dec", submissions: 43 }
];

const editorWorkload = [
  { editor: "Dr. Emily Carter", manuscripts: 12, completed: 10, inProgress: 2 },
  { editor: "Marcus Rodriguez", manuscripts: 8, completed: 7, inProgress: 1 },
  { editor: "Jessica Chen", manuscripts: 15, completed: 12, inProgress: 3 },
  { editor: "David Thompson", manuscripts: 6, completed: 5, inProgress: 1 },
  { editor: "Lisa Wang", manuscripts: 9, completed: 8, inProgress: 1 }
];

const genreDistribution = [
  { name: "Fiction", value: 35, color: "#cf2631" },
  { name: "Non-Fiction", value: 25, color: "#dc2626" },
  { name: "Romance", value: 20, color: "#ef4444" },
  { name: "Mystery", value: 12, color: "#f87171" },
  { name: "Sci-Fi", value: 8, color: "#fca5a5" }
];

const turnaroundData = [
  { range: "0-7 days", count: 145 },
  { range: "8-14 days", count: 98 },
  { range: "15-21 days", count: 67 },
  { range: "22-30 days", count: 32 }
];

const genres = ["All Genres", "Fiction", "Non-Fiction", "Romance", "Mystery", "Sci-Fi", "Fantasy", "Biography"];
const editors = ["All Editors", "Dr. Emily Carter", "Marcus Rodriguez", "Jessica Chen", "David Thompson", "Lisa Wang"];

const Analytics = () => {
  const [selectedGenre, setSelectedGenre] = useState("All Genres");
  const [selectedEditor, setSelectedEditor] = useState("All Editors");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });

  const averageTurnaround = 12; // days
  
  const kpiCards = [
    {
      title: "Total Users",
      value: kpiData.totalUsers.toLocaleString(),
      icon: Users,
      trend: "+12.5%",
      trendUp: true,
      description: "from last month"
    },
    {
      title: "Manuscripts Submitted",
      value: kpiData.totalManuscripts.toLocaleString(),
      icon: FileText,
      trend: "+8.3%",
      trendUp: true,
      description: "from last month"
    },
    {
      title: "In Progress",
      value: kpiData.inProgress.toLocaleString(),
      icon: Clock,
      trend: "-5.2%",
      trendUp: false,
      description: "from last month"
    },
    {
      title: "Completed Projects",
      value: kpiData.completed.toLocaleString(),
      icon: CheckCircle,
      trend: "+15.7%",
      trendUp: true,
      description: "from last month"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Track performance metrics and insights for your editorial operations
          </p>
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-4">
          <Select value={selectedGenre} onValueChange={setSelectedGenre}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Genre" />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border z-50">
              {genres.map((genre) => (
                <SelectItem key={genre} value={genre} className="hover:bg-muted cursor-pointer">
                  {genre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedEditor} onValueChange={setSelectedEditor}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Editor" />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border z-50">
              {editors.map((editor) => (
                <SelectItem key={editor} value={editor} className="hover:bg-muted cursor-pointer">
                  {editor}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-60 justify-start text-left font-normal", !dateRange.from && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                numberOfMonths={2}
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <kpi.icon className={`h-4 w-4 ${index === 0 ? 'text-blue-600' : index === 1 ? 'text-green-600' : index === 2 ? 'text-orange-600' : 'text-primary'}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className={`mr-1 h-3 w-3 ${kpi.trendUp ? 'text-green-600' : 'text-red-600'} ${!kpi.trendUp ? 'rotate-180' : ''}`} />
                <span className={kpi.trendUp ? 'text-green-600' : 'text-red-600'}>{kpi.trend}</span>
                <span className="ml-1">{kpi.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submissions Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Submissions Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={submissionsOverTime}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-muted-foreground" />
                <YAxis className="text-muted-foreground" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="submissions" 
                  stroke="#cf2631" 
                  strokeWidth={2}
                  dot={{ fill: '#cf2631', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Genre Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Genre Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={genreDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#cf2631"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {genreDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor Workload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Editor Workload
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={editorWorkload} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-muted-foreground" />
                <YAxis dataKey="editor" type="category" width={120} className="text-muted-foreground text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Bar dataKey="completed" stackId="a" fill="#22c55e" name="Completed" />
                <Bar dataKey="inProgress" stackId="a" fill="#cf2631" name="In Progress" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Turnaround Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-primary" />
              Turnaround Time Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Average Turnaround Gauge */}
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">{averageTurnaround}</div>
                <div className="text-sm text-muted-foreground">Average Days</div>
                <div className="mt-4">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${(averageTurnaround / 30) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0</span>
                    <span>30 days</span>
                  </div>
                </div>
              </div>
              
              {/* Distribution Bars */}
              <div className="space-y-3">
                {turnaroundData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium min-w-0 flex-1">{item.range}</span>
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${(item.count / Math.max(...turnaroundData.map(d => d.count))) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground min-w-8">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">92%</div>
              <div className="text-sm text-muted-foreground">On-time Delivery Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">4.8/5</div>
              <div className="text-sm text-muted-foreground">Average Client Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">$42,500</div>
              <div className="text-sm text-muted-foreground">Monthly Revenue</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;