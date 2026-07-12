"use client";

import React, { useState, useTransition } from "react";
import { User, Building2, Bell, Shield, Key, Mail, Sun, Moon } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { updateProfile } from "@/actions/users";

interface SettingsClientProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
  };
}

export function SettingsClient({ user }: SettingsClientProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [activeSection, setActiveSection] = useState<"profile" | "company" | "notifications" | "security">("profile");

  // Profile Form State
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Company Form State (mocked)
  const [companyName, setCompanyName] = useState("LogiLink Logistics Inc.");
  const [companyAddress, setCompanyAddress] = useState("540 industrial Parkway, Suite 10, New York, NY");
  const [currency, setCurrency] = useState("USD ($)");
  const [unitSystem, setUnitSystem] = useState("metric"); // metric or imperial

  // Notifications State
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [expiryReminders, setExpiryReminders] = useState(true);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email) {
      toast("Name and email are required.", "warning");
      return;
    }

    if (password && password !== confirmPassword) {
      toast("Passwords do not match.", "error");
      return;
    }

    startTransition(async () => {
      const res = await updateProfile({ name, email, password: password || undefined });
      if (res.error) {
        toast(res.error, "error");
      } else {
        toast("Profile settings updated successfully!", "success");
        setPassword("");
        setConfirmPassword("");
        // Reload page to refresh header session
        window.location.reload();
      }
    });
  };

  const handleCompanySave = (e: React.FormEvent) => {
    e.preventDefault();
    toast("Company settings saved (development mock).", "success");
  };

  const handleNotificationsSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast("Notification preferences saved successfully.", "success");
  };

  return (
    <div className="flex flex-col gap-6 text-slate-900 dark:text-slate-100 w-full">
      {/* Header Banner */}
      <div className="pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <h2 className="text-xl font-bold tracking-tight">System Settings</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Customize profile variables, manage alert protocols, and configure company settings.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Side Selector menu */}
        <div className="w-full lg:w-64 shrink-0 flex flex-col gap-1 bg-white dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <button
            onClick={() => setActiveSection("profile")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
              activeSection === "profile"
                ? "bg-blue-600 text-white shadow shadow-blue-500/25"
                : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-850"
            }`}
          >
            <User className="h-4.5 w-4.5" />
            My User Profile
          </button>
          <button
            onClick={() => setActiveSection("company")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
              activeSection === "company"
                ? "bg-blue-600 text-white shadow shadow-blue-500/25"
                : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-850"
            }`}
          >
            <Building2 className="h-4.5 w-4.5" />
            Company details
          </button>
          <button
            onClick={() => setActiveSection("notifications")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
              activeSection === "notifications"
                ? "bg-blue-600 text-white shadow shadow-blue-500/25"
                : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-850"
            }`}
          >
            <Bell className="h-4.5 w-4.5" />
            Notification Rules
          </button>
        </div>

        {/* Right Side Settings form */}
        <div className="flex-1 w-full bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6">
          {/* Profile Section */}
          {activeSection === "profile" && (
            <form onSubmit={handleProfileSave} className="flex flex-col gap-5 text-xs font-medium">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                User Account Profile
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 font-semibold uppercase tracking-wide">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 font-semibold uppercase tracking-wide">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 font-semibold uppercase tracking-wide">New Password</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Leave blank to keep same"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 font-semibold uppercase tracking-wide">Confirm Password</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold active:scale-95 disabled:opacity-50 transition-all shadow shadow-blue-500/10"
                >
                  {isPending ? "Updating profile..." : "Save Settings"}
                </button>
              </div>
            </form>
          )}

          {/* Company Details Tab */}
          {activeSection === "company" && (
            <form onSubmit={handleCompanySave} className="flex flex-col gap-5 text-xs font-medium">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                Logistics Corporate Settings
              </h3>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-semibold uppercase tracking-wide">Company Name</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-semibold uppercase tracking-wide">Corporate Address</label>
                <input
                  type="text"
                  required
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 font-semibold uppercase tracking-wide">Base Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                  >
                    <option value="USD ($)">USD ($) - Dollar</option>
                    <option value="EUR (€)">EUR (€) - Euro</option>
                    <option value="INR (₹)">INR (₹) - Rupee</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 font-semibold uppercase tracking-wide">Telemetry Unit System</label>
                  <select
                    value={unitSystem}
                    onChange={(e) => setUnitSystem(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                  >
                    <option value="metric">Metric (Kilometers, Kilograms)</option>
                    <option value="imperial">Imperial (Miles, Pounds)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold active:scale-95 transition-all shadow shadow-blue-500/10"
                >
                  Save Corporate details
                </button>
              </div>
            </form>
          )}

          {/* Notifications Tab */}
          {activeSection === "notifications" && (
            <form onSubmit={handleNotificationsSave} className="flex flex-col gap-5 text-xs font-medium">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                Notification Protocols
              </h3>

              <div className="flex flex-col gap-4">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="h-4 w-4 text-blue-600 bg-slate-900 rounded border-slate-350 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-sm text-slate-800 dark:text-slate-200">Email Dispatches</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Send transaction email receipts on dispatch actions</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={expiryReminders}
                    onChange={(e) => setExpiryReminders(e.target.checked)}
                    className="h-4 w-4 text-blue-600 bg-slate-900 rounded border-slate-350 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-sm text-slate-800 dark:text-slate-200">License Expiry Warning Reminders</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Warn dispatchers 60 days before commercial driver license expiration dates</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={smsAlerts}
                    onChange={(e) => setSmsAlerts(e.target.checked)}
                    className="h-4 w-4 text-blue-600 bg-slate-900 rounded border-slate-350 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-sm text-slate-800 dark:text-slate-200">SMS Telemetries alerts</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Ping drivers on duty via cellular SMS when dispatches close</p>
                  </div>
                </label>
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold active:scale-95 transition-all shadow shadow-blue-500/10"
                >
                  Save Preferences
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
