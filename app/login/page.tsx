"use client";

import React, { useState, useEffect, useTransition, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Truck, Mail, Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { login } from "@/lib/auth";
import { signupUser } from "@/actions/auth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Forms State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // Check if signup param is present in URL
  useEffect(() => {
    if (searchParams.get("signup") === "true") {
      setIsSignup(true);
    } else {
      setIsSignup(false);
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast("Please fill in all required fields", "warning");
      return;
    }

    if (isSignup && !name) {
      toast("Name is required to sign up", "warning");
      return;
    }

    startTransition(async () => {
      if (isSignup) {
        // Sign Up Flow
        const res = (await signupUser({ name, email, password })) as any;
        if (res?.error) {
          toast(res.error, "error");
        } else if (res?.success) {
          toast("Account created successfully!", "success");
          router.push("/dashboard");
          router.refresh();
        }
      } else {
        // Login Flow
        const res = (await login(email, password)) as any;
        if (res?.error) {
          toast(res.error, "error");
        } else if (res?.success) {
          toast("Logged in successfully!", "success");
          router.push("/dashboard");
          router.refresh();
        }
      }
    });
  };

  const autofillDemo = (role: "admin" | "dispatch" | "manager") => {
    if (role === "admin") {
      setEmail("admin@transitops.com");
      setPassword("admin123");
    } else if (role === "dispatch") {
      setEmail("dispatcher@transitops.com");
      setPassword("dispatch123");
    } else {
      setEmail("manager@transitops.com");
      setPassword("manager123");
    }
    setIsSignup(false);
    toast(`Demo credentials loaded for ${role.toUpperCase()}`, "info");
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-950 p-4 select-none">
      {/* Background Orbs */}
      <div className="absolute top-10 left-1/4 h-[350px] w-[350px] rounded-full bg-blue-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 h-[350px] w-[350px] rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-lg z-10 flex flex-col gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-500/30">
            <Truck className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            Transit<span className="text-blue-500">Ops</span>
          </span>
        </Link>

        {/* Card */}
        <div className="w-full rounded-2xl border border-slate-800 bg-slate-900/50 p-8 shadow-2xl backdrop-blur-md glass">
          <div className="flex flex-col gap-2 text-center pb-6 border-b border-slate-800/80">
            <h2 className="text-2xl font-bold text-white">
              {isSignup ? "Create an account" : "Welcome back"}
            </h2>
            <p className="text-sm text-slate-400">
              {isSignup
                ? "Register a dispatcher credentials to manage operations"
                : "Sign in to manage your transport logistics"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-6">
            {isSignup && (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Marcus Brody"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@transitops.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Password</label>
                {!isSignup && (
                  <button
                    type="button"
                    onClick={() => toast("Contact your system administrator to reset passwords.", "info")}
                    className="text-xs font-semibold text-blue-500 hover:text-blue-400"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-10 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="mt-2 flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 text-sm font-bold shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-55 transition-all"
            >
              {isPending
                ? "Processing Request..."
                : isSignup
                ? "Register Dispatcher Account"
                : "Sign In"}
              {!isPending && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          {/* Toggle Tab */}
          <div className="mt-6 text-center text-sm">
            <span className="text-slate-400">
              {isSignup ? "Already have an account?" : "Need a dispatcher account?"}{" "}
            </span>
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="font-semibold text-blue-500 hover:text-blue-400"
            >
              {isSignup ? "Sign In" : "Register"}
            </button>
          </div>
        </div>

        {/* Demo Credentials Callout */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-950 p-4 text-center">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2.5">
            Quick Demo Autofill
          </span>
          <div className="flex gap-2.5 justify-center">
            <button
              onClick={() => autofillDemo("admin")}
              className="bg-slate-900 border border-slate-800 hover:border-blue-500 text-xs font-medium text-slate-200 px-3 py-1.5 rounded-lg transition-all"
            >
              Admin Portal
            </button>
            <button
              onClick={() => autofillDemo("dispatch")}
              className="bg-slate-900 border border-slate-800 hover:border-indigo-500 text-xs font-medium text-slate-200 px-3 py-1.5 rounded-lg transition-all"
            >
              Dispatcher
            </button>
            <button
              onClick={() => autofillDemo("manager")}
              className="bg-slate-900 border border-slate-800 hover:border-emerald-500 text-xs font-medium text-slate-200 px-3 py-1.5 rounded-lg transition-all"
            >
              Fleet Manager
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white font-semibold text-xs tracking-wide">
        Loading authentication systems...
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
