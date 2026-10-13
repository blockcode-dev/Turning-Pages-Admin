/** @format */

import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { Lock } from "lucide-react";

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-svh text-center px-4">
      <Lock className="h-16 w-16 text-primary mb-4" />

      <h1 className="text-2xl sm:text-3xl font-bold mb-2">Access Denied</h1>

      <p className="text-muted-foreground max-w-md mb-6">
        You are not authorized to access this page.  
        Please contact the system administrator if you believe this is a mistake.
      </p>

      <Button onClick={() => navigate("/dashboard")}>
        Go to Dashboard
      </Button>
    </div>
  );
};

export default UnauthorizedPage;
