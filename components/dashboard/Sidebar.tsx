"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Truck,
  Users,
  MapPin,
  Wrench,
  Fuel,
  DollarSign,
  FileText,
  LineChart,
  UserCheck,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Bell,
  Sun,
  Moon
} from "lucide-react";
import { logout } from "@/lib/auth";
import { useToast } from "@/components/ui/toast";

interface SidebarProps {
  currentUser: {
    name: string;
    email: string;
    role: string;
  };
  unreadNotifications: number;
}

export function Sidebar({ currentUser, unreadNotifications }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Sync dark mode
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setIsDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    const root = document.documentElement;
    if (root.classList.contains("dark")) {
      root.classList.remove("dark");
      setIsDarkMode(false);
    } else {
      root.classList.add("dark");
      setIsDarkMode(true);
    }
    toast(`${isDarkMode ? "Light" : "Dark"} mode enabled`, "info");
  };

  const handleLogout = async () => {
    const res = await logout();
    if (res.success) {
      toast("Successfully logged out", "success");
      router.push("/login");
      router.refresh();
    }
  };

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Vehicles", href: "/dashboard/vehicles", icon: Truck },
    { name: "Drivers", href: "/dashboard/drivers", icon: Users },
    { name: "Trips", href: "/dashboard/trips", icon: MapPin },
    { name: "Maintenance", href: "/dashboard/maintenance", icon: Wrench },
    { name: "Fuel Logs", href: "/dashboard/fuel", icon: Fuel },
    { name: "Expenses", href: "/dashboard/expenses", icon: DollarSign },
    { name: "Reports", href: "/dashboard/reports", icon: FileText },
    { name: "Analytics", href: "/dashboard/analytics", icon: LineChart },
  ];

  // Managers and Admins can see Users CRUD
  if (["ADMIN", "MANAGER"].includes(currentUser.role)) {
    navItems.push({ name: "Users", href: "/dashboard/users", icon: UserCheck });
  }

  navItems.push({ name: "Settings", href: "/dashboard/settings", icon: Settings });

  const sidebarWidth = isCollapsed ? "w-20" : "w-64";

  return (
    <>
      {/* Mobile Top Header Bar */}
      <header className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800 text-white md:hidden sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <Truck className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold tracking-tight">TransitOps</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleDarkMode}
            className="rounded-lg p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button
            onClick={() => setIsMobileOpen(true)}
            className="rounded-lg p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col h-screen shrink-0 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/90 backdrop-blur-md transition-all duration-300 relative ${sidebarWidth}`}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute top-1/2 -right-3 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 shadow-md dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors z-20"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>

        {/* Brand Logo */}
        <div className={`p-6 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 ${isCollapsed ? "justify-center" : ""}`}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-md shadow-blue-500/10">
            <Truck className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && (
            <span className="font-bold tracking-tight text-slate-950 dark:text-white">
              Transit<span className="text-blue-500">Ops</span>
            </span>
          )}
        </div>

        {/* Menu Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-1.5 no-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                } ${isCollapsed ? "justify-center" : ""}`}
              >
                <Icon className={`h-5 w-5 shrink-0`} />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer actions / Profile */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
          {/* Theme button */}
          {!isCollapsed && (
            <button
              onClick={toggleDarkMode}
              className="flex items-center gap-3 w-full px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              {isDarkMode ? (
                <>
                  <Sun className="h-4.5 w-4.5 text-amber-500" />
                  <span>Light Theme</span>
                </>
              ) : (
                <>
                  <Moon className="h-4.5 w-4.5 text-slate-400" />
                  <span>Dark Theme</span>
                </>
              )}
            </button>
          )}

          {/* User Card */}
          <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}>
            <div className="h-9 w-9 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{currentUser.name}</p>
                <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">{currentUser.role}</p>
              </div>
            )}
            {!isCollapsed && (
              <button
                onClick={handleLogout}
                className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            )}
          </div>
          {isCollapsed && (
            <button
              onClick={handleLogout}
              className="flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              <LogOut className="h-5 w-5" />
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Drawer Navigation overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            {/* Content */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
              className="relative w-72 bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col p-6 border-l border-slate-200 dark:border-slate-800"
            >
              <button
                onClick={() => setIsMobileOpen(false)}
                className="absolute top-4 left-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mt-8 flex flex-col justify-between h-full">
                <nav className="flex flex-col gap-1">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          isActive
                            ? "bg-blue-600 text-white"
                            : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{currentUser.name}</p>
                      <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">{currentUser.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 w-full border border-red-500/20 bg-red-500/5 hover:bg-red-500 text-red-600 hover:text-white dark:hover:text-slate-100 text-sm font-semibold py-2.5 rounded-xl transition-all"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
