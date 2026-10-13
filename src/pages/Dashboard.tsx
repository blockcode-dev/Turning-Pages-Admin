/** @format */

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router";
import {
  FileText,
  Clock,
  CheckCircle,
  Users,
  ArrowRight,
  ExternalLink,
  Activity,
} from "lucide-react";

import { GetAdminDashboardAPI } from "@/services/Api/AdminDashboardApi";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<any>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await GetAdminDashboardAPI();

      if (res.data?.success) {
        const data = res.data.data.dashboard;

        setDashboard(data);

        // Merge recent activity from users + manuscripts
        const merged = [
          // USERS
          ...data.recentActivity.userRegistration.map((u: any) => ({
            id: u.id,
            type: "user",
            title: `New user registered: ${u.user_profile?.name}`,
            author: u.user_profile?.name,
            status: "info",
            timestamp: u.user_profile?.created_at,
            link: "/editors",
          })),

          // MANUSCRIPTS
          ...data.recentActivity.manuscriptSubmited.map((m: any) => ({
            id: m.id,
            type: "manuscript",
            title: `New manuscript submitted: '${m.title}'`,
            author: m.book_user?.user_profile?.name,
            status: "pending",
            timestamp: m.created_at,
            link: "/editing-queue",
          })),
        ];

        setRecentActivities(merged);
      }
    } catch (err: any) {
      toast({
        title: "Error loading dashboard",
        description: err.response?.data?.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

const handleDownloadCSV = () => {
  const rows = [
    ["Metric", "Value"],
    ["Total Manuscripts", dashboard?.totalSubmitted?.value || 0],
    ["In Progress", dashboard?.inProgress?.value || 0],
    ["Completed", dashboard?.completed?.value || 0],
    ["Total Users", dashboard?.totalUsers?.value || 0],
  ];

  // Convert to CSV string
  const csvContent = rows.map((e) => e.join(",")).join("\n");

  // Create blob
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.setAttribute("download", "dashboard-stats.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

  const handleQuickLinkClick = (path: string) => navigate(path);
  const handleActivityClick = (path: string) => navigate(path);

  if (loading) {
    return (
      <div className="p-10 text-center text-muted-foreground text-lg">
        Loading dashboard...
      </div>
    );
  }

  // KPI CARD DATA
  const kpiData = [
    {
      title: "Total Manuscripts Submitted",
      value: dashboard?.totalSubmitted?.value || 0,
      icon: FileText,
      trend: dashboard?.totalSubmitted?.change,
      description: dashboard?.totalSubmitted?.period,
      trendUp: dashboard?.totalSubmitted?.change.includes("+"),
      color: "text-blue-600",
    },
    {
      title: "In Progress",
      value: dashboard?.inProgress?.value || 0,
      icon: Clock,
      trend: dashboard?.inProgress?.change,
      description: dashboard?.inProgress?.period,
      trendUp: dashboard?.inProgress?.change.includes("+"),
      color: "text-orange-600",
    },
    {
      title: "Completed",
      value: dashboard?.completed?.value || 0,
      icon: CheckCircle,
      trend: dashboard?.completed?.change,
      description: dashboard?.completed?.period,
      trendUp: dashboard?.completed?.change.includes("+"),
      color: "text-green-600",
    },
    {
      title: "Total Users",
      value: dashboard?.totalUsers?.value || 0,
      icon: Users,
      trend: dashboard?.totalUsers?.change,
      description: dashboard?.totalUsers?.period,
      trendUp: dashboard?.totalUsers?.change.includes("+"),
      color: "text-primary",
    },
  ];

  const timeAgo = (timestamp: string) => {
  const now = new Date();
  const past = new Date(timestamp);
  const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  const intervals: any = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
  };

  for (let key in intervals) {
    const interval = Math.floor(seconds / intervals[key]);
    if (interval >= 1) {
      return `${interval} ${key}${interval > 1 ? "s" : ""} ago`;
    }
  }

  return "just now";
};


  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "completed":
        return <Badge className="bg-green-600 text-white">Completed</Badge>;
      case "approved":
        return <Badge className="bg-green-600 text-white">Approved</Badge>;
      case "info":
        return <Badge className="bg-blue-500 text-white">Info</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* TITLE */}
     <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
  <div>
    <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
    <p className="text-muted-foreground mt-2">
      Welcome to the Turning Pages Admin Panel
    </p>
  </div>

<Button onClick={handleDownloadCSV}>
  Download Stats
</Button>
</div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => (
          <Card
            key={index}
            className="hover:shadow-md transition-shadow border border-muted/40"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>

              {/* <div className="flex items-center text-xs mt-1">
                <TrendingUp
                  className={`mr-1 h-3 w-3 ${
                    kpi.trendUp ? "text-green-600" : "text-red-600 rotate-180"
                  }`}
                />
                <span className={kpi.trendUp ? "text-green-600" : "text-red-600"}>
                  {kpi.trend}
                </span>
                <span className="ml-1 text-muted-foreground">
                  {kpi.description}
                </span>
              </div> */}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* QUICK LINKS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-primary" />
            Quick Links
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={() => handleQuickLinkClick("/projects")}
              className="bg-primary text-primary-foreground flex justify-between p-4 h-auto"
            >
              <div>
                <div className="font-semibold">View All Projects</div>
                <div className="text-xs opacity-90">Manage active projects</div>
              </div>
              <ArrowRight className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              onClick={() => handleQuickLinkClick("/editors")}
              className="p-4 h-auto flex justify-between"
            >
              <div>
                <div className="font-semibold">View Users</div>
                <div className="text-xs text-muted-foreground">
                  User management
                </div>
              </div>
              <ArrowRight className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              onClick={() => handleQuickLinkClick("/editing-queue")}
              className="p-4 h-auto flex justify-between"
            >
              <div>
                <div className="font-semibold">Editing Queue</div>
                <div className="text-xs text-muted-foreground">
                  Review submissions
                </div>
              </div>
              <ArrowRight className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              onClick={() => handleQuickLinkClick("/analytics")}
              className="p-4 h-auto flex justify-between"
            >
              <div>
                <div className="font-semibold">Analytics</div>
                <div className="text-xs text-muted-foreground">View reports</div>
              </div>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* RECENT ACTIVITY */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {recentActivities.map((activity: any) => (
              <div
                key={activity.id}
                className="flex items-start justify-between p-4 border rounded-lg bg-muted/20 hover:bg-muted/40 transition cursor-pointer"
                onClick={() => handleActivityClick(activity.link)}
              >
                <div>
                  <p className="font-medium">{activity.title}</p>
                  <p className="text-sm text-muted-foreground">
                    by {activity.author}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(activity.status)}
                 <span className="text-xs text-muted-foreground">
  {timeAgo(activity.timestamp)}
</span>

                  <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
