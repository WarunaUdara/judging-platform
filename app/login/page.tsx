"use client";

import type { AuthError } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showEmailLogin, setShowEmailLogin] = useState(false);

  const createSession = async () => {
    const response = await fetch("/api/auth/session", { method: "POST" });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to create session");
    }

    return data;
  };

  const redirectByRole = (role: string) => {
    // Use window.location for hard redirect to ensure session cookie is sent
    switch (role) {
      case "superadmin":
      case "organizer":
        window.location.href = "/admin";
        break;
      case "evaluator":
        window.location.href = "/judge/dashboard";
        break;
      case "pending":
        toast.error("Your account is pending approval. Contact an organizer.");
        window.location.href = "/";
        break;
      default:
        window.location.href = "/";
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      const sessionData = await createSession();

      toast.success("Welcome back!");
      redirectByRole(sessionData.role);
    } catch (error: unknown) {
      console.error("Email login error:", error);

      const errorCode = (error as AuthError)?.code;
      let message = "Failed to sign in";

      switch (errorCode) {
        case "invalid_credentials":
          message = "Invalid email or password";
          break;
        case "email_not_confirmed":
          message = "Please verify your email before signing in";
          break;
        case "invalid_email":
          message = "Invalid email address";
          break;
        case "user_disabled":
          message = "This account has been disabled";
          break;
        case "over_request_rate_limit":
          message = "Too many attempts. Please try again later.";
          break;
        case "request_timeout":
          message = "Network error. Please check your connection.";
          break;
        default:
          if (error instanceof Error) {
            message = error.message;
          }
      }

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);

    try {
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          queryParams: {
            prompt: "select_account",
          },
          redirectTo,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error: unknown) {
      console.error("Google sign-in error:", error);

      const errorCode = (error as AuthError)?.code;
      let message = "Failed to sign in with Google";

      switch (errorCode) {
        case "oauth_popup_closed":
          message = "Sign in was cancelled";
          break;
        case "oauth_popup_failed":
          message = "Popup was blocked. Please allow popups for this site.";
          break;
        case "request_timeout":
          message = "Network error. Please check your connection.";
          break;
        default:
          if (error instanceof Error) {
            message = error.message;
          }
      }

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      {/* Header */}
      <header className="border-[#333333] border-b bg-black">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link className="flex items-center gap-3" href="/">
            <Image
              alt="CryptX Logo"
              className="object-contain"
              height={36}
              src="/logo.webp"
              width={36}
            />
            <span className="font-semibold text-xl tracking-tight">CryptX</span>
            <span className="text-[#333333]">/</span>
            <span className="text-[#888888]">Judging</span>
          </Link>
        </div>
      </header>

      {/* Login Form */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-center text-2xl">Sign In</CardTitle>
            <CardDescription className="text-center text-[#a1a1aa]">
              Access the judging platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {showEmailLogin ? (
              <>
                {/* Email/Password Form */}
                <form className="space-y-4" onSubmit={handleEmailLogin}>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      className="h-12"
                      disabled={loading}
                      id="email"
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                      type="email"
                      value={email}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      className="h-12"
                      disabled={loading}
                      id="password"
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      type="password"
                      value={password}
                    />
                  </div>
                  <Button
                    className="h-12 w-full"
                    disabled={loading}
                    size="lg"
                    type="submit"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg
                          aria-hidden="true"
                          className="h-4 w-4 animate-spin"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            fill="none"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            fill="currentColor"
                          />
                        </svg>
                        Signing in...
                      </span>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-[#333333] border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-[#0a0a0a] px-4 text-[#71717a] uppercase tracking-wider">
                      Or
                    </span>
                  </div>
                </div>

                <Button
                  className="h-12 w-full"
                  onClick={() => setShowEmailLogin(false)}
                  size="lg"
                  type="button"
                  variant="ghost"
                >
                  Back to Google Sign In
                </Button>
              </>
            ) : (
              <>
                {/* Google Sign In - Primary method */}
                <Button
                  className="h-12 w-full"
                  disabled={loading}
                  onClick={handleGoogleLogin}
                  size="lg"
                  type="button"
                  variant="outline"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg
                        aria-hidden="true"
                        className="h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          fill="none"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          fill="currentColor"
                        />
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    <>
                      <svg
                        aria-hidden="true"
                        className="mr-2 h-5 w-5"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="currentColor"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="currentColor"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="currentColor"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="currentColor"
                        />
                      </svg>
                      Continue with Google
                    </>
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-[#333333] border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-[#0a0a0a] px-4 text-[#71717a] uppercase tracking-wider">
                      Or
                    </span>
                  </div>
                </div>

                {/* Email/Password Login (for test users) */}
                <Button
                  className="h-12 w-full"
                  onClick={() => setShowEmailLogin(true)}
                  size="lg"
                  type="button"
                  variant="ghost"
                >
                  Sign in with Email
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-[#333333] border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-[#0a0a0a] px-4 text-[#71717a] uppercase tracking-wider">
                      Info
                    </span>
                  </div>
                </div>

                <div className="space-y-3 text-center">
                  <p className="text-[#a1a1aa] text-sm">
                    New users will be created with pending status.
                  </p>
                  <p className="text-[#71717a] text-sm">
                    Contact your event organizer for access approval or use an
                    invitation link.
                  </p>
                </div>

                <div className="border-[#333333] border-t pt-4">
                  <p className="text-center text-[#71717a] text-xs">
                    Have an invitation link?{" "}
                    <span className="text-[#a1a1aa]">
                      Click it to join a competition directly.
                    </span>
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-[#333333] border-t bg-black py-6">
        <div className="container mx-auto px-4 text-center text-[#71717a] text-sm">
          <Link className="transition-colors hover:text-white" href="/">
            Back to Home
          </Link>
        </div>
      </footer>
    </div>
  );
}
