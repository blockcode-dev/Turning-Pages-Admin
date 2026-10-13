import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AdminLayout } from "./components/AdminLayout";
import { PageLoader } from "./components/PageLoader";

// Route-level code splitting: each page is downloaded only when visited.
const Index = lazy(() => import("./pages/Index"));
const AdminForgotPassword = lazy(() => import("./components/AdminForgotPassword"));
const AdminChangePassword = lazy(() => import("./components/AdminChangePassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const EditingQueue = lazy(() => import("./pages/EditingQueue"));
const EditorialSuite = lazy(() => import("./pages/EditorialSuite/EditorialSuite"));
const Projects = lazy(() => import("./pages/Projects"));
const ProjectDetails = lazy(() => import("./pages/ProjectDetails"));
const Users = lazy(() => import("./pages/User/Users"));
const AddUser = lazy(() => import("./pages/User/Adduser"));
const Editors = lazy(() => import("./pages/Editors/Editors"));
const Analytics = lazy(() => import("./pages/Analytics"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));
const AssignProject = lazy(() => import("./pages/AssignProject"));
const CoverGenerator = lazy(() => import("./pages/CoverGenerator"));
const DeliverManuscript = lazy(() => import("./pages/DeliverManuscript"));
const AdminProfile = lazy(() => import("./pages/AdminProfile"));
const GenresPage = lazy(() => import("./pages/Genre/GenresPage"));
const QuoteTagsPage = lazy(() => import("./pages/QuoteTags"));
const QuotesPage = lazy(() => import("./pages/Quote/Quote"));
const QuoteViewPage = lazy(() => import("./pages/Quote/QuotesViewPage"));
const AddQuotePage = lazy(() => import("./pages/Quote/AddQuotePage"));
const EditQuotePage = lazy(() => import("./pages/Quote/EditQuotePage"));
const FeedsPage = lazy(() => import("./pages/Feed/FeedsPage"));
const FeedViewPage = lazy(() => import("./pages/Feed/FeedViewPage"));
const TicketsPage = lazy(() => import("./pages/Ticket/TicketPage"));
const PaymentHistoryPage = lazy(() => import("./pages/PaymentHistoryPage"));
const SubscriptionPage = lazy(() => import("./pages/SubscriptionListPage"));
const TavTest = lazy(() => import("./pages/TavTest"));
const TavAnalysisPage = lazy(() => import("./pages/Tavanalysispage"));
const Chat = lazy(() => import("./pages/Chat/Chat"));
const UnauthorizedPage = lazy(() => import("./pages/UnauthorizedPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const App = () => (
  <>
    <Toaster />
    <BrowserRouter>
      <Suspense fallback={<PageLoader fullScreen />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/forgot-password" element={<AdminForgotPassword />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Pages rendered inside the persistent sidebar + header shell */}
          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tav-test" element={<TavTest />} />
            <Route path="/tav-analysis" element={<TavAnalysisPage />} />
            <Route path="/change-password" element={<AdminChangePassword />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
            <Route path="/editing-queue" element={<EditingQueue />} />
            <Route path="/editorial-suite" element={<EditorialSuite />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/project-details" element={<ProjectDetails />} />
            <Route path="/users" element={<Users />} />
            <Route path="/users/add" element={<AddUser />} />
            <Route path="/editors" element={<Editors />} />
            <Route path="/genres" element={<GenresPage />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<AdminSettings />} />
            <Route path="/assign-project" element={<AssignProject />} />
            <Route path="/cover-generator" element={<CoverGenerator />} />
            <Route path="/quote-tags" element={<QuoteTagsPage />} />
            <Route path="/quotes" element={<QuotesPage />} />
            <Route path="/quotes/add" element={<AddQuotePage />} />
            <Route path="/quotes/view/:id" element={<QuoteViewPage />} />
            <Route path="/quotes/edit/:id" element={<EditQuotePage />} />
            <Route path="/feeds" element={<FeedsPage />} />
            <Route path="/feeds/view/:id" element={<FeedViewPage />} />
            <Route path="/tickets" element={<TicketsPage />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/payment-history" element={<PaymentHistoryPage />} />
            <Route path="/subscriptions" element={<SubscriptionPage />} />
            <Route path="/deliver-manuscript" element={<DeliverManuscript />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </>
);

export default App;
