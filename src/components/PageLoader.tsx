import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageLoader({ fullScreen = false }: { fullScreen?: boolean }) {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-center text-primary",
        fullScreen ? "min-h-svh" : "min-h-[50vh]",
      )}
      role="status"
      aria-label="Loading"
    >
      <Loader2 className="h-7 w-7 animate-spin" />
    </div>
  );
}
