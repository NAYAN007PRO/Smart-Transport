"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import {
  Truck,
  Users,
  MapPin,
  Wrench,
  Fuel,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  Sparkles,
  Map,
  Navigation,
  ShieldAlert,
  ChevronRight,
  BellRing
} from "lucide-react";

interface DashboardOverviewProps {
  userRole: string;
  userName: string;
  kpis: {
    activeVehicles: number;
    availableVehicles: number;
    inShopVehicles: number;
    retiredVehicles: number;
    totalVehicles: number;
    activeDrivers: number;
    availableDrivers: number;
    suspendedDrivers: number;
    totalDrivers: number;
    activeTripsCount: number;
    pendingTripsCount: number;
    completedTripsCount: number;
    fleetUtilization: number;
    totalFuelLiters: number;
    totalFuelCost: number;
    totalExpensesCost: number;
    avgSafetyScore: number;
  };
  expensesByCategory: Array<{ category: string; amount: number }>;
  recentTrips: Array<any>;
  maintenanceAlerts: Array<any>;
  expiringDrivers: Array<{ id: string; name: string; expiryDate: Date; isExpired: boolean }>;
  notifications: Array<any>;
  activities: Array<{ id: string; userName: string; action: string; details: string; createdAt: Date }>;
}

export function DashboardOverview({
  userRole,
  userName,
  kpis,
  expensesByCategory,
  recentTrips,
  maintenanceAlerts,
  expiringDrivers,
  notifications,
  activities,
}: DashboardOverviewProps) {
  // AI Assistant State
  const [aiInput, setAiInput] = useState("");
  const [aiChat, setAiChat] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    {
      sender: "ai",
      text: "Hello! I am your AI Fleet Assistant. Ask me about predictive maintenance, route optimizations, or vehicle ROI analyses.",
    },
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Live Map tracking state
  const [selectedTrackVehicle, setSelectedTrackVehicle] = useState<any>(
    recentTrips.find((t) => t.status === "DISPATCHED")?.vehicle || null
  );

  const handleAiSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    const userMsg = aiInput.trim();
    setAiChat((prev) => [...prev, { sender: "user", text: userMsg }]);
    setAiInput("");
    setIsAiLoading(true);

    setTimeout(() => {
      let aiResponse = "I can analyze your fleet operations database to answer that. Let me look at your vehicles.";
      const msgLower = userMsg.toLowerCase();

      if (msgLower.includes("maintenance") || msgLower.includes("predictive")) {
        aiResponse =
          "Predictive analysis shows Scania R500 (CA-S456-R) requires belt replacements within 1,200 km. Volvo FH16 (NY-V123-FH) is operating efficiently but has an upcoming scheduled service in 9,500 km. Van TX-M789-SP is currently in maintenance with Open status.";
      } else if (msgLower.includes("route") || msgLower.includes("optimize")) {
        aiResponse =
          "Traffic alerts indicate delays on I-95 North heading to Boston. For future Boston trips, routing via US-1 South to bypass construction will save approximately 35 minutes and 12 liters of fuel.";
      } else if (msgLower.includes("roi") || msgLower.includes("efficiency") || msgLower.includes("cost")) {
        aiResponse = `Analyzing expenses ($${kpis.totalExpensesCost}) and fuel consumption (${kpis.totalFuelLiters.toFixed(1)}L). Volvo FH16 has a strong ROI, operating at $0.43/km. Mercedes Sprinter has high relative maintenance costs ($1,200) for its size - monitor fuel efficiency closely once it is released from In Shop status.`;
      } else {
        aiResponse = `Regarding your query: '${userMsg}', I recommend checking the Analytics tab to view total operational costs ($${kpis.totalExpensesCost}) and the current Fleet Utilization (${kpis.fleetUtilization.toFixed(1)}%). We currently have ${kpis.activeVehicles} active vehicles on routes.`;
      }

      setAiChat((prev) => [...prev, { sender: "ai", text: aiResponse }]);
      setIsAiLoading(false);
    }, 1000);
  };

  // Chart configs
  const chartColors = ["#3b82f6", "#6366f1", "#10b981", "#f59e0b", "#ef4444", "#a855f7"];

  const vehicleStatusData = [
    { name: "Available", value: kpis.availableVehicles, color: "#10b981" },
    { name: "On Trip", value: kpis.activeVehicles, color: "#3b82f6" },
    { name: "In Shop", value: kpis.inShopVehicles, color: "#f59e0b" },
    { name: "Retired", value: kpis.retiredVehicles, color: "#ef4444" },
  ].filter((item) => item.value > 0);

  return (
    <div className="flex flex-col gap-6 w-full text-slate-900 dark:text-slate-100 pb-12">
      {/* Top Greeting Panel */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 backdrop-blur-md"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Welcome, {userName}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Here is your fleet overview for today. Role: <span className="text-blue-600 dark:text-blue-400 font-semibold">{userRole}</span>. Status: All dispatch systems online.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs bg-slate-100 dark:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-200/40 dark:border-slate-700/40 font-semibold self-start md:self-auto">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>LIVE TELEMETRY ACTIVE</span>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 hover:shadow-md transition-all hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fleet Utilization</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">{kpis.fleetUtilization.toFixed(1)}%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span className="text-blue-600 dark:text-blue-400 font-bold">{kpis.activeVehicles} active</span>
            <span>/ {kpis.totalVehicles - kpis.retiredVehicles} total vehicles</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 hover:shadow-md transition-all hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Trips</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">{kpis.activeTripsCount}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <MapPin className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{kpis.pendingTripsCount} draft</span>
            <span>/ {kpis.completedTripsCount} completed</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 hover:shadow-md transition-all hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vehicles in Shop</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">{kpis.inShopVehicles}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Wrench className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span className="text-amber-600 dark:text-amber-400 font-bold">{kpis.availableVehicles} available</span>
            <span>vehicles currently ready</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 hover:shadow-md transition-all hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Operational Expenses</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">${kpis.totalExpensesCost.toLocaleString()}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span className="text-purple-600 dark:text-purple-400 font-bold">{kpis.totalFuelLiters.toFixed(0)}L fuel</span>
            <span>consumed overall</span>
          </div>
        </div>
      </div>

      {/* Main Charts & Telemetry Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analytics Expense Bar Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Operations Expense Structure</h3>
          <div className="h-80 w-full">
            {expensesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={expensesByCategory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                  <XAxis dataKey="category" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(15, 23, 42, 0.9)",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    formatter={(v) => [`$${v}`, "Total Expensed"]}
                  />
                  <Bar dataKey="amount" fill="#3b82f6" radius={[6, 6, 0, 0]}>
                    {expensesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Bar>
                </ReBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-slate-400">No expensed accounts available.</div>
            )}
          </div>
        </div>

        {/* Fleet Status Pie Chart */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Fleet Status Breakdown</h3>
            <div className="h-60 w-full flex items-center justify-center">
              {vehicleStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={vehicleStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {vehicleStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [v, "Vehicles"]} />
                  </RePieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-sm text-slate-400">No status data.</div>
              )}
            </div>
          </div>
          {/* Custom Legends */}
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold pt-4 border-t border-slate-100 dark:border-slate-800">
            {vehicleStatusData.map((v) => (
              <div key={v.name} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: v.color }} />
                <span>{v.name}: {v.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Map Widget & AI Assistant */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Tracking Map Widget */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 flex flex-col gap-4">
          <div className="flex justify-between items-center pb-2">
            <div className="flex items-center gap-2">
              <Map className="h-5 w-5 text-blue-500" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Live Vehicle Tracking</h3>
            </div>
            <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold px-2 py-0.5 rounded">
              {selectedTrackVehicle ? selectedTrackVehicle.regNumber : "No vehicle tracked"}
            </span>
          </div>

          <div className="relative flex-1 rounded-xl bg-slate-950/90 h-[280px] overflow-hidden border border-slate-800 flex items-center justify-center select-none">
            {/* Grid overlay for map appearance */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            {selectedTrackVehicle ? (
              <div className="absolute inset-0 flex flex-col justify-between p-4 z-10 text-white">
                <div className="flex justify-between items-start">
                  <div className="bg-slate-900/85 backdrop-blur-md p-3 rounded-lg border border-slate-800 text-xs">
                    <p className="font-bold text-blue-400">{selectedTrackVehicle.name}</p>
                    <p className="text-slate-400 mt-1">Odometer: {selectedTrackVehicle.odometer} km</p>
                    <p className="text-slate-400">Type: {selectedTrackVehicle.type}</p>
                  </div>
                  <div className="bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded border border-slate-800 text-[10px] font-bold text-emerald-400 animate-pulse">
                    RECEIVING GPS
                  </div>
                </div>

                {/* Radar tracking circle graphic */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                  <div className="h-28 w-28 rounded-full border border-blue-500/20 pulse-ring absolute" />
                  <div className="h-16 w-16 rounded-full border border-blue-500/40 pulse-ring absolute" />
                  <Navigation className="h-6 w-6 text-blue-500 rotate-45 shrink-0" />
                </div>

                <div className="bg-slate-900/85 backdrop-blur-md p-3 rounded-lg border border-slate-800 text-xs self-start">
                  <p className="font-semibold text-slate-300">Active Coordinates</p>
                  <p className="font-mono text-slate-400 mt-0.5">Lat: 40.7128° N, Lon: 74.0060° W</p>
                  <p className="text-[10px] text-blue-400 font-semibold mt-1">Route: NYC Hub &rarr; Boston Logan</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-slate-500">
                <Navigation className="h-12 w-12 text-slate-700 rotate-45" />
                <span className="text-sm">Select a vehicle below to launch tracking telemetries</span>
              </div>
            )}
          </div>

          {/* Selector List */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {recentTrips
              .filter((t) => t.status === "DISPATCHED")
              .map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTrackVehicle(t.vehicle)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border shrink-0 transition-all ${
                    selectedTrackVehicle?.id === t.vehicle.id
                      ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-55 dark:hover:bg-slate-800 text-slate-500"
                  }`}
                >
                  🚚 {t.vehicle.regNumber} ({t.driver.name})
                </button>
              ))}
            {recentTrips.filter((t) => t.status === "DISPATCHED").length === 0 && (
              <span className="text-xs text-slate-400 font-medium py-1">No dispatched trips currently active to map coordinates.</span>
            )}
          </div>
        </div>

        {/* AI Assistant Chat Widget */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 flex flex-col justify-between h-[450px]">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Sparkles className="h-5 w-5 text-blue-500 fill-blue-500/20" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">AI Fleet Assistant</h3>
            </div>
            {/* Chat Messages */}
            <div className="flex flex-col gap-3.5 h-[280px] overflow-y-auto mt-4 px-1 no-scrollbar">
              {aiChat.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white rounded-br-none self-end shadow-sm"
                      : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 rounded-bl-none self-start border border-slate-200/20 dark:border-slate-700/20"
                  }`}
                >
                  <span className="font-semibold mb-0.5 uppercase tracking-wide text-[9px] text-slate-400">
                    {msg.sender === "user" ? "You" : "Fleet Assistant"}
                  </span>
                  <p>{msg.text}</p>
                </div>
              ))}
              {isAiLoading && (
                <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-bl-none p-3 text-xs self-start max-w-[80%] border border-slate-200/20 animate-pulse">
                  <span className="font-semibold text-[9px] text-slate-400 uppercase tracking-wide">Assistant is reading DB...</span>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleAiSend} className="flex gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <input
              type="text"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder="Ask about predictive maintenance..."
              className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2 text-xs border border-transparent focus:border-blue-500 focus:outline-none dark:text-white"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white active:scale-95 transition-all shadow shadow-blue-500/10"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Recent Trips Table & Activity logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Trips */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Recent Operations</h3>
              <Link href="/dashboard/trips" className="text-xs font-bold text-blue-500 hover:text-blue-400 flex items-center gap-1">
                View All <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase">
                    <th className="py-2.5">Route</th>
                    <th className="py-2.5">Vehicle</th>
                    <th className="py-2.5">Driver</th>
                    <th className="py-2.5">Distance</th>
                    <th className="py-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTrips.map((t) => (
                    <tr key={t.id} className="border-b border-slate-100 dark:border-slate-800 font-medium">
                      <td className="py-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 dark:text-slate-100 truncate max-w-[140px]">{t.destination.split(",")[0]}</span>
                          <span className="text-[10px] text-slate-400">from {t.source.split(",")[0]}</span>
                        </div>
                      </td>
                      <td className="py-3 text-slate-500">{t.vehicle.regNumber}</td>
                      <td className="py-3 text-slate-500">{t.driver.name}</td>
                      <td className="py-3 text-slate-500">{t.distance} km</td>
                      <td className="py-3 text-right">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                            t.status === "COMPLETED"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : t.status === "DISPATCHED"
                              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                              : t.status === "CANCELLED"
                              ? "bg-red-500/10 text-red-600 dark:text-red-400"
                              : "bg-slate-200/40 text-slate-500 dark:bg-slate-800"
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {recentTrips.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400">No operational trips recorded.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Alerts & Notifications log */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <BellRing className="h-5 w-5 text-amber-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Critical Flags</h3>
          </div>

          <div className="flex flex-col gap-3 overflow-y-auto max-h-[300px] no-scrollbar">
            {/* Expiry alerts */}
            {expiringDrivers.map((d) => (
              <div
                key={d.id}
                className="flex items-start gap-3 p-3 rounded-xl border border-red-500/10 bg-red-500/5 text-xs text-red-800 dark:text-red-200"
              >
                <ShieldAlert className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">License Expiry Warning</p>
                  <p className="mt-0.5 text-slate-500" suppressHydrationWarning>
                    Driver {d.name}'s license {d.isExpired ? "expired on" : "will expire on"}{" "}
                    {new Date(d.expiryDate).toLocaleDateString()}.
                  </p>
                </div>
              </div>
            ))}

            {/* Maintenance alerts */}
            {maintenanceAlerts.map((m) => (
              <div
                key={m.id}
                className="flex items-start gap-3 p-3 rounded-xl border border-amber-500/10 bg-amber-500/5 text-xs text-amber-800 dark:text-amber-200"
              >
                <AlertTriangle className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Vehicle in Workshop</p>
                  <p className="mt-0.5 text-slate-500">
                    {m.vehicle.name} ({m.vehicle.regNumber}) requires: {m.description}.
                  </p>
                </div>
              </div>
            ))}

            {/* Notifications alerts */}
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`flex items-start gap-3 p-3 rounded-xl border text-xs ${
                  n.type === "DANGER"
                    ? "border-red-500/10 bg-red-500/5 text-red-800 dark:text-red-200"
                    : n.type === "WARNING"
                    ? "border-amber-500/10 bg-amber-500/5 text-amber-800 dark:text-amber-200"
                    : "border-blue-500/10 bg-blue-500/5 text-blue-800 dark:text-blue-200"
                }`}
              >
                {n.type === "DANGER" && <ShieldAlert className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />}
                {n.type === "WARNING" && <AlertTriangle className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />}
                {n.type !== "DANGER" && n.type !== "WARNING" && <CheckCircle2 className="h-4.5 w-4.5 text-blue-500 shrink-0 mt-0.5" />}
                <div>
                  <p className="font-bold">{n.message}</p>
                  <p className="mt-0.5 text-[10px] text-slate-400 font-semibold" suppressHydrationWarning>{new Date(n.createdAt).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}

            {expiringDrivers.length === 0 && maintenanceAlerts.length === 0 && notifications.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-6 text-slate-400 text-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                <span>All driver licensing, telemetry channels, and vehicle operations are fully compliant.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity Logs (Audit Trail) */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
          <Clock className="h-5 w-5 text-slate-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">System Activity Audit Trail</h3>
        </div>

        <div className="mt-4 flex flex-col gap-3.5">
          {activities.map((a) => (
            <div key={a.id} className="flex justify-between items-center text-xs border-b border-slate-50 dark:border-slate-800/20 pb-3 font-medium">
              <div className="flex items-start gap-4">
                <span className="font-bold text-slate-800 dark:text-slate-100 shrink-0">{a.userName}</span>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200/25 dark:border-slate-700/25 text-slate-500 font-semibold shrink-0 uppercase tracking-wider">
                  {a.action}
                </span>
                <span className="text-slate-500 text-left line-clamp-1">{a.details}</span>
              </div>
              <span className="text-[10px] text-slate-400 shrink-0">{new Date(a.createdAt).toLocaleString()}</span>
            </div>
          ))}
          {activities.length === 0 && (
            <div className="py-6 text-center text-slate-400">No activity logged.</div>
          )}
        </div>
      </div>
    </div>
  );
}
