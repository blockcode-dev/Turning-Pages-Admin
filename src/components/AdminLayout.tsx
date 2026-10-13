import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { PageLoader } from "./PageLoader";

// Rendered once as a layout route, so the sidebar and header stay mounted
// (and don't refetch) while navigating between admin pages.
export function AdminLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-svh w-full bg-background">
        <AdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminHeader />
          <main className="min-w-0 flex-1 p-4 sm:p-6">
            <div className="mx-auto w-full max-w-[1440px]">
              <Suspense fallback={<PageLoader />}>
                <Outlet />
              </Suspense>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
