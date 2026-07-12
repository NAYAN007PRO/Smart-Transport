"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  TrendingUp,
  Fuel,
  DollarSign,
  Activity,
  Award,
  Truck,
  Gauge,
  Briefcase
} from "lucide-react";

interface VehicleMetric {
  id: string;
  name: string;
  regNumber: string;
  type: string;
  odometer: number;
  acquisitionCost: number;
  totalFuelLiters: number;
  totalFuelCost: number;
  totalExpensesAmount: number;
  totalDistanceDriven: number;
  fuelEfficiency: number;
  totalOpex: number;
  simulatedRevenue: number;
  vehicleRoi: number;
}

interface AnalyticsClientProps {
  vehicleMetrics: VehicleMetric[];
  financialStructure: Array<{ name: string; value: number; color: string }>;
  totalTripsCount: number;
}

export function AnalyticsClient({
  vehicleMetrics,
  financialStructure,
  totalTripsCount,
}: AnalyticsClientProps) {
  // Aggregate Metrics
  const avgEfficiency =
    vehicleMetrics.reduce((acc, curr) => acc + curr.fuelEfficiency, 0) /
    vehicleMetrics.length;

  const totalOpex = vehicleMetrics.reduce((acc, curr) => acc + curr.totalOpex, 0);
  const totalRevenue = vehicleMetrics.reduce((acc, curr) => acc + curr.simulatedRevenue, 0);
  const netFleetRoi = totalRevenue - totalOpex;

  const chartColors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#a855f7"];

  // Formatted data for ROI Chart
  const roiChartData = vehicleMetrics.map((v) => ({
    name: v.regNumber,
    Opex: Math.round(v.totalOpex),
    Revenue: Math.round(v.simulatedRevenue),
    ROI: Math.round(v.vehicleRoi),
  }));

  // Formatted data for Fuel efficiency Chart
  const efficiencyChartData = vehicleMetrics.map((v) => ({
    name: v.regNumber,
    LitrePer100km: parseFloat(v.fuelEfficiency.toFixed(1)),
  }));

  return (
    <div className="flex flex-col gap-6 text-slate-900 dark:text-slate-100 w-full">
      {/* Header Banner */}
      <div className="pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <h2 className="text-xl font-bold tracking-tight">Fleet Intelligence Analytics</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Monitor operating efficiency, analyze vehicle return-on-investments (ROI), and track fuel performance.
        </p>
      </div>

      {/* Aggregate KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Fuel Efficiency</span>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5 flex items-baseline gap-1">
                {avgEfficiency.toFixed(1)} <span className="text-xs font-bold text-slate-400">L/100km</span>
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Fuel className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Simulated Operational Revenue</span>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">
                ${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Fleet ROI</span>
              <h3 className={`text-2xl font-bold mt-1.5 ${netFleetRoi >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
                ${netFleetRoi.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Operating Expenses</span>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">
                ${totalOpex.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Briefcase className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ROI comparison chart */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Vehicle ROI Breakdown (Revenue vs OPEX)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roiChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(15, 23, 42, 0.9)",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Bar dataKey="Opex" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ROI" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Financial pie structure */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Fleet capital allocation</h3>
            <div className="h-60 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={financialStructure}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {financialStructure.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`$${Number(v).toLocaleString()}`, "Capital"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Custom Legends */}
          <div className="flex flex-col gap-2 text-xs font-semibold pt-4 border-t border-slate-100 dark:border-slate-800">
            {financialStructure.map((item) => (
              <div key={item.name} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </div>
                <span>${item.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fuel efficiency by vehicle */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Liters / 100km Fuel Efficiency rating</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={efficiencyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
              <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}L`} />
              <Tooltip
                contentStyle={{
                  background: "rgba(15, 23, 42, 0.9)",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                formatter={(v) => [`${v} L/100km`, "Fuel Efficiency"]}
              />
              <Bar dataKey="LitrePer100km" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                {efficiencyChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.LitrePer100km < 15 ? "#10b981" : "#3b82f6"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Analytics Summary Table */}
      <div className="border border-slate-200/80 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/60 shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Operating Cost & Net ROI Audit Ledger</h3>
        </div>
        <div className="overflow-x-auto w-full font-medium">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 text-slate-400 font-bold uppercase">
                <th className="p-4">Vehicle</th>
                <th className="p-4">Odometer</th>
                <th className="p-4">Distance Driven</th>
                <th className="p-4">Fuel Efficiency</th>
                <th className="p-4">Total OPEX</th>
                <th className="p-4">Total Revenue</th>
                <th className="p-4 text-right">Net ROI</th>
              </tr>
            </thead>
            <tbody>
              {vehicleMetrics.map((v) => (
                <tr key={v.id} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/20 dark:hover:bg-slate-900/10">
                  <td className="p-4 font-bold text-slate-800 dark:text-slate-100">{v.regNumber}</td>
                  <td className="p-4 text-slate-500">{v.odometer.toLocaleString()} km</td>
                  <td className="p-4 text-slate-500">{v.totalDistanceDriven.toLocaleString()} km</td>
                  <td className="p-4 text-slate-700 dark:text-slate-300 font-semibold">{v.fuelEfficiency.toFixed(1)} L/100km</td>
                  <td className="p-4 text-red-500">${v.totalOpex.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  <td className="p-4 text-blue-500">${v.simulatedRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  <td className={`p-4 text-right font-bold ${v.vehicleRoi >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                    ${v.vehicleRoi.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
