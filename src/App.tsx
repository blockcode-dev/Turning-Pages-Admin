import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import EditingQueue from "./pages/EditingQueue";
import EditorialSuite from "./pages/EditorialSuite/EditorialSuite";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import Users from "./pages/User/Users";
import Editors from "./pages/Editors/Editors";
import Analytics from "./pages/Analytics";
import AdminSettings from "./pages/AdminSettings";
import AssignProject from "./pages/AssignProject";
import CoverGenerator from "./pages/CoverGenerator";
import DeliverManuscript from "./pages/DeliverManuscript";
import NotFound from "./pages/NotFound";
import { AdminLayout } from "./components/AdminLayout";
import AdminForgotPassword from "./components/AdminForgotPassword";
import AdminChangePassword from "./components/AdminChangePassword";
import AdminProfile from "./pages/AdminProfile";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import GenresPage from "./pages/Genre/GenresPage";
import QuoteTagsPage from "./pages/QuoteTags";
import QuotesPage from "./pages/Quote/Quote";
import QuoteViewPage from "./pages/Quote/QuotesViewPage";
import AddQuotePage from "./pages/Quote/AddQuotePage";
import EditQuotePage from "./pages/Quote/EditQuotePage";
import PaymentHistoryPage from "./pages/PaymentHistoryPage";
import FeedViewPage from "./pages/Feed/FeedViewPage";
import FeedsPage from "./pages/Feed/FeedsPage";
import TicketsPage from "./pages/Ticket/TicketPage";
import Chat from "./pages/Chat/Chat";
import SubscriptionPage from "./pages/SubscriptionListPage";
import TavTest from "./pages/TavTest";
import TavAnalysisPage from "./pages/Tavanalysispage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/forgot-password" element={<AdminForgotPassword />} />
          
          <Route path="/dashboard" element={
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          } />

           <Route path="/tav-test" element={
            <AdminLayout>
              <TavTest />
            </AdminLayout>
          } />

           <Route path="/tav-analysis" element={
            <AdminLayout>
              <TavAnalysisPage />
            </AdminLayout>
          } />





          <Route path="/change-password" element={
            <AdminLayout>
              <AdminChangePassword />
            </AdminLayout>
          } />

          <Route path="/admin/profile" element={
            <AdminLayout>
              <AdminProfile />
            </AdminLayout>
          } />

          <Route path="/editing-queue" element={
            <AdminLayout>
              <EditingQueue />
            </AdminLayout>
          } />
          <Route path="/editorial-suite" element={
            <AdminLayout>
              <EditorialSuite />
            </AdminLayout>
          } />
          <Route path="/projects" element={
            <AdminLayout>
              <Projects />
            </AdminLayout>
          } />
          <Route path="/project-details" element={
            <AdminLayout>
              <ProjectDetails />
            </AdminLayout>
          } />
          <Route path="/users" element={
            <AdminLayout>
              <Users />
            </AdminLayout>
          } />
          <Route path="/editors" element={
            <AdminLayout>
              <Editors />
            </AdminLayout>
          } />
           <Route path="/genres" element={
            <AdminLayout>
              <GenresPage />
            </AdminLayout>
          } />
          <Route path="/analytics" element={
            <AdminLayout>
              <Analytics />
            </AdminLayout>
          } />
          <Route path="/settings" element={
            <AdminLayout>
              <AdminSettings />
            </AdminLayout>
          } />
          <Route path="/assign-project" element={
            <AdminLayout>
              <AssignProject />
            </AdminLayout>
          } />
          <Route path="/cover-generator" element={
            <AdminLayout>
              <CoverGenerator />
            </AdminLayout>
          } />
          {/* quote */}
          <Route path="/quote-tags" element={
            <AdminLayout>
              <QuoteTagsPage />
            </AdminLayout>
          } />
           <Route path="/quotes" element={
            <AdminLayout>
              <QuotesPage />
            </AdminLayout>
          } />
           <Route path="/quotes/view/:id" element={
            <AdminLayout>
              <QuoteViewPage />
            </AdminLayout>
          } />
          <Route path="/quotes/edit/:id" element={
            <AdminLayout>
              <EditQuotePage />
            </AdminLayout>
          } />
          {/* feeds */}
          <Route path="/feeds" element={
            <AdminLayout>
              <FeedsPage />
            </AdminLayout>
          } />
          <Route path="/feeds/view/:id" element={
            <AdminLayout>
              <FeedViewPage />
            </AdminLayout>
          } />
           <Route path="/chat" element={
            // <AdminLayout>
              <Chat />
            // </AdminLayout>
          } />
          {/* TICKETS */}
          <Route path="/tickets" element={
            <AdminLayout>
              <TicketsPage />
            </AdminLayout>
          } />
          {/* payment */}
           <Route path="/payment-history" element={
            <AdminLayout>
              <PaymentHistoryPage />
            </AdminLayout>
          } />
          <Route path="/subscriptions" element={
            <AdminLayout>
              <SubscriptionPage />
            </AdminLayout>
          } />
          <Route path="/quotes/add" element={
            <AdminLayout>
              <AddQuotePage />
            </AdminLayout>
          } />
          <Route path="/deliver-manuscript" element={
            <AdminLayout>
              <DeliverManuscript />
            </AdminLayout>
          } />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
