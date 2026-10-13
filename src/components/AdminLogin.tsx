/** @format */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AdminLoginAPI } from "@/services/Api/AuthApi";
import logo from "@/assets/logo.png";

const AdminLogin = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const { toast } = useToast();
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (submitting) return;
		setSubmitting(true);

		try {
			const res = await AdminLoginAPI(email, password);

			if (res.data?.success) {
				const token = res.data?.data?.token || "";
				const roleId = res.data?.data?.role_id || null;
				const adminId = res.data?.data?.id || null;

				// Save token & role
				localStorage.setItem("token", token);
				localStorage.setItem("role_id", roleId);
				localStorage.setItem("admin_id", adminId);
				localStorage.setItem("isAdmin", roleId === 1 ? "true" : "false");
				sessionStorage.removeItem("admin_name");

				toast({
					title: "Welcome back!",
					description: "You've successfully logged in.",
				});

				navigate("/dashboard", { replace: true });
			} else {
				toast({
					title: "Login Failed",
					description: res.data?.message || "Invalid credentials.",
					variant: "destructive",
				});
			}
		} catch (err: any) {
			toast({
				title: "Login Failed",
				description: err.response?.data?.message || "Something went wrong.",
				variant: "destructive",
			});
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="flex min-h-svh items-center justify-center bg-background px-4 py-10">
			<Card className="w-full max-w-md border-border/70 shadow-lg">
				<CardHeader className="items-center space-y-3 pb-6 text-center">
					<img src={logo} alt="Turning Pages" className="h-20 w-auto" />
					<div className="space-y-1">
						<CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
						<CardDescription>Sign in to manage Turning Pages</CardDescription>
					</div>
				</CardHeader>

				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								autoComplete="email"
								placeholder="Enter your email address"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								className="h-11"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<div className="relative">
								<Input
									id="password"
									type={showPassword ? "text" : "password"}
									autoComplete="current-password"
									placeholder="Enter your password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									className="h-11 pr-10"
								/>
								<button
									type="button"
									onClick={() => setShowPassword((v) => !v)}
									aria-label={showPassword ? "Hide password" : "Show password"}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
								>
									{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
								</button>
							</div>
						</div>

						<Button type="submit" disabled={submitting} className="mt-6 h-11 w-full font-medium">
							{submitting && <Loader2 className="h-4 w-4 animate-spin" />}
							Login
						</Button>
					</form>

					<div className="mt-6 text-center">
						<Link to="/forgot-password" className="text-sm font-medium text-primary hover:text-primary-hover">
							Forgot Password?
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default AdminLogin;
