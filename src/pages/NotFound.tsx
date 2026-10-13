import { Link } from "react-router";
import { Button } from "@/components/ui/button";

const NotFound = () => (
  <div className="flex min-h-svh items-center justify-center bg-background px-4">
    <div className="text-center">
      <p className="text-6xl font-bold text-primary">404</p>
      <h1 className="mt-4 text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-muted-foreground">The page you're looking for doesn't exist or was moved.</p>
      <Button asChild className="mt-6">
        <Link to="/dashboard">Back to Dashboard</Link>
      </Button>
    </div>
  </div>
);

export default NotFound;
