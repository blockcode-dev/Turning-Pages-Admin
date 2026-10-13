/** @format */
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ChangePasswordAPI } from "@/services/Api/AuthApi";

export default function AdminChangePassword() {
  const { toast } = useToast();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({ title: "All fields are required", variant: "destructive" });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await ChangePasswordAPI({
        old_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
        token,
      });

      if (res.data?.success) {
        toast({
          title: "Password Updated",
          description: "You can now log in with your new password.",
        });

        setTimeout(() => (window.location.href = "/"), 1500);
      }
    } catch (err: any) {
      toast({
        title: "Failed to update password",
        description: err.response?.data?.message || "Unexpected error.",
        variant: "destructive",
      });
    }
  };

  return (
   <div className="w-full flex justify-center items-start py-2 sm:py-8">
  <div className="w-full max-w-xl">
    <Card className="shadow-md border border-border rounded-xl overflow-hidden">

      <CardHeader className="bg-accent/60 border-b py-6">
        <CardTitle className="flex items-center gap-3 text-foreground text-xl">
          <Key className="h-6 w-6 text-primary" />
          Change Password
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Update your password to keep your account secure
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-8 py-8 px-6">

        {/* Current Password */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            Current Password
          </Label>
          <div className="relative">
            <Input
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="h-11 rounded-md pr-12"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
            >
              {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* New & Confirm Password */}
        <div className="grid gap-6 md:grid-cols-2">

          {/* New Password */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">New Password</Label>
            <div className="relative">
              <Input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="h-11 rounded-md pr-12"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">Confirm New Password</Label>
            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="h-11 rounded-md pr-12"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Button */}
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleChangePassword}
            className="px-6 h-11"
          >
            <Key className="h-4 w-4 mr-2" />
            Change Password
          </Button>
        </div>

      </CardContent>
    </Card>
  </div>
</div>

  );
}
