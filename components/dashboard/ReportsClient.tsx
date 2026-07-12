"use client";

import React, { useState } from "react";
import { Download, FileDown, Search, Filter, Calendar } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface ReportsClientProps {
  vehicles: any[];
  drivers: any[];
  trips: any[];
  expenses: any[];
  fuelLogs: any[];
}

export function ReportsClient({
  vehicles,
  drivers,
  trips,
  expenses,
  fuelLogs,
}: ReportsClientProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"vehicles" | "drivers" | "trips" | "expenses" | "fuel">("trips");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Get current active collection
  const getActiveData = () => {
    switch (activeTab) {
      case "vehicles":
        return vehicles;
      case "drivers":
        return drivers;
      case "trips":
        return trips;
      case "expenses":
        return expenses;
      case "fuel":
        return fuelLogs;
      default:
        return [];
    }
  };

  const rawData = getActiveData();

  // Search filter
  const filteredData = rawData.filter((row: any) => {
    const values = Object.values(row).map((v) => String(v).toLowerCase());
    const matchesSearch = values.some((val) => val.includes(searchQuery.toLowerCase()));

    if (activeTab === "vehicles" && statusFilter !== "ALL") {
      return matchesSearch && row.status === statusFilter;
    }
    if (activeTab === "drivers" && statusFilter !== "ALL") {
      return matchesSearch && row.status === statusFilter;
    }
    if (activeTab === "trips" && statusFilter !== "ALL") {
      return matchesSearch && row.status === statusFilter;
    }
    if (activeTab === "expenses" && statusFilter !== "ALL") {
      return matchesSearch && row.category === statusFilter;
    }

    return matchesSearch;
  });

  // CSV Export Utility
  const handleExportCSV = () => {
    if (filteredData.length === 0) {
      toast("No data available to export.", "warning");
      return;
    }

    // Clean up IDs and unwanted keys for CSV
    const cleanData = filteredData.map(({ id, passwordHash, ...rest }) => rest);
    const csvHeaders = Object.keys(cleanData[0]).join(",");
    const csvRows = cleanData.map((row) =>
      Object.values(row)
        .map((val) => {
          let strVal = String(val);
          // Format Date instances
          if (strVal.includes("GMT") || (strVal.includes("-") && !isNaN(Date.parse(strVal)))) {
            strVal = new Date(strVal).toLocaleDateString();
          }
          return `"${strVal.replace(/"/g, '""')}"`;
        })
        .join(",")
    );

    const csvString = [csvHeaders, ...csvRows].join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `transitops_${activeTab}_report.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast(`Exported ${cleanData.length} records to CSV successfully!`, "success");
  };

  // PDF Export Utility (triggers print-ready styled view or simulated layout)
  const handleExportPDF = () => {
    if (filteredData.length === 0) {
      toast("No data available to export.", "warning");
      return;
    }
    
    // Simulate compilation of PDF report and prompt print
    toast("Generating printable PDF template report...", "info");
    setTimeout(() => {
      window.print();
    }, 500);
  };

  return (
    <div className="flex flex-col gap-6 text-slate-900 dark:text-slate-100 w-full print:p-0">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800 print:hidden">
        <div>
          <h2 className="text-xl font-bold tracking-tight">System Report Generator</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Build custom reports, filter operations databases, and download audits as CSV or PDF files.
          </p>
        </div>
        <div className="flex gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center justify-center gap-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-sm hover:shadow active:scale-95 transition-all"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-sm hover:shadow active:scale-95 transition-all"
          >
            <FileDown className="h-4 w-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Tabs Selector Bar */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1 pb-1 overflow-x-auto no-scrollbar print:hidden">
        <button
          onClick={() => {
            setActiveTab("trips");
            setStatusFilter("ALL");
          }}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === "trips"
              ? "bg-blue-600 text-white shadow shadow-blue-500/20"
              : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900"
          }`}
        >
          📍 Active Trips
        </button>
        <button
          onClick={() => {
            setActiveTab("vehicles");
            setStatusFilter("ALL");
          }}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === "vehicles"
              ? "bg-blue-600 text-white shadow shadow-blue-500/20"
              : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900"
          }`}
        >
          🚛 Vehicles
        </button>
        <button
          onClick={() => {
            setActiveTab("drivers");
            setStatusFilter("ALL");
          }}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === "drivers"
              ? "bg-blue-600 text-white shadow shadow-blue-500/20"
              : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900"
          }`}
        >
          👤 Drivers
        </button>
        <button
          onClick={() => {
            setActiveTab("expenses");
            setStatusFilter("ALL");
          }}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === "expenses"
              ? "bg-blue-600 text-white shadow shadow-blue-500/20"
              : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900"
          }`}
        >
          💵 Expense Ledger
        </button>
        <button
          onClick={() => {
            setActiveTab("fuel");
            setStatusFilter("ALL");
          }}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === "fuel"
              ? "bg-blue-600 text-white shadow shadow-blue-500/20"
              : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900"
          }`}
        >
          ⛽ Fuel Log
        </button>
      </div>

      {/* Filter Options */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-white dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 print:hidden">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={`Search raw ${activeTab} fields...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:text-white"
          />
        </div>

        {/* Dynamic filter selectors depending on tab selection */}
        {activeTab === "vehicles" && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none dark:text-white font-mono"
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="ON_TRIP">On Trip</option>
            <option value="IN_SHOP">In Shop</option>
          </select>
        )}

        {activeTab === "drivers" && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none dark:text-white font-mono"
          >
            <option value="ALL">All Duty Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="ON_TRIP">On Trip</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        )}

        {activeTab === "trips" && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none dark:text-white font-mono"
          >
            <option value="ALL">All Trip Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="DISPATCHED">Dispatched</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        )}

        {activeTab === "expenses" && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none dark:text-white font-mono"
          >
            <option value="ALL">All Categories</option>
            <option value="FUEL">Fuel</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="TOLL">Toll</option>
            <option value="INSURANCE">Insurance</option>
          </select>
        )}
      </div>

      {/* Printable Report Page Content Wrap */}
      <div className="border border-slate-200/80 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/60 shadow-sm overflow-hidden p-6 print:border-none print:shadow-none print:bg-transparent">
        {/* Printable Header */}
        <div className="hidden print:flex flex-col border-b border-slate-800 pb-4 mb-6">
          <h1 className="text-xl font-bold uppercase tracking-wide">TransitOps - Smart Transport Systems</h1>
          <p className="text-xs text-slate-500 mt-1">Audit Type: {activeTab.toUpperCase()} | Generated: {new Date().toLocaleString()}</p>
        </div>

        <div className="overflow-x-auto w-full font-medium">
          <table className="w-full text-left text-[11px] border-collapse print:text-xs">
            <thead>
              {/* Dynamic Headers */}
              {activeTab === "trips" && (
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase">
                  <th className="py-3">Created Date</th>
                  <th className="py-3">Departing</th>
                  <th className="py-3">Destination</th>
                  <th className="py-3">Vehicle</th>
                  <th className="py-3">Driver</th>
                  <th className="py-3">Distance</th>
                  <th className="py-3">Cargo Weight</th>
                  <th className="py-3 text-right">Status</th>
                </tr>
              )}
              {activeTab === "vehicles" && (
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase">
                  <th className="py-3">Plate</th>
                  <th className="py-3">Name</th>
                  <th className="py-3">Type</th>
                  <th className="py-3">Model</th>
                  <th className="py-3">Capacity</th>
                  <th className="py-3">Odometer</th>
                  <th className="py-3 text-right">Status</th>
                </tr>
              )}
              {activeTab === "drivers" && (
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase">
                  <th className="py-3">Driver Name</th>
                  <th className="py-3">License Number</th>
                  <th className="py-3">License Type</th>
                  <th className="py-3">Phone</th>
                  <th className="py-3">Safety Score</th>
                  <th className="py-3 text-right">Status</th>
                </tr>
              )}
              {activeTab === "expenses" && (
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase">
                  <th className="py-3">Date</th>
                  <th className="py-3">Vehicle</th>
                  <th className="py-3">Category</th>
                  <th className="py-3">Description</th>
                  <th className="py-3 text-right">Amount</th>
                </tr>
              )}
              {activeTab === "fuel" && (
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase">
                  <th className="py-3">Date</th>
                  <th className="py-3">Vehicle</th>
                  <th className="py-3">Odometer</th>
                  <th className="py-3">Quantity (Liters)</th>
                  <th className="py-3 text-right">Cost</th>
                </tr>
              )}
            </thead>
            <tbody>
              {/* Dynamic Rows */}
              {activeTab === "trips" &&
                filteredData.map((t) => (
                  <tr key={t.id} className="border-b border-slate-100 dark:border-slate-800/60 py-2.5">
                    <td className="py-2.5 text-slate-500">{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td className="py-2.5 font-bold text-slate-800 dark:text-slate-100">{t.source.split(",")[0]}</td>
                    <td className="py-2.5 font-bold text-slate-800 dark:text-slate-100">{t.destination.split(",")[0]}</td>
                    <td className="py-2.5 text-slate-500">{t.vehicleReg}</td>
                    <td className="py-2.5 text-slate-500">{t.driverName}</td>
                    <td className="py-2.5 text-slate-500">{t.distance} km</td>
                    <td className="py-2.5 text-slate-500">{(t.cargoWeight / 1000).toFixed(1)} t</td>
                    <td className="py-2.5 text-right font-bold text-slate-800 dark:text-slate-200">{t.status}</td>
                  </tr>
                ))}

              {activeTab === "vehicles" &&
                filteredData.map((v) => (
                  <tr key={v.id} className="border-b border-slate-100 dark:border-slate-800/60 py-2.5">
                    <td className="py-2.5 font-bold text-slate-800 dark:text-slate-100">{v.regNumber}</td>
                    <td className="py-2.5 text-slate-800 dark:text-slate-200">{v.name}</td>
                    <td className="py-2.5 text-slate-500">{v.type}</td>
                    <td className="py-2.5 text-slate-500">{v.model}</td>
                    <td className="py-2.5 text-slate-500">{(v.loadCapacity / 1000).toFixed(1)} t</td>
                    <td className="py-2.5 text-slate-500">{v.odometer.toLocaleString()} km</td>
                    <td className="py-2.5 text-right font-bold text-slate-800 dark:text-slate-200">{v.status}</td>
                  </tr>
                ))}

              {activeTab === "drivers" &&
                filteredData.map((d) => (
                  <tr key={d.id} className="border-b border-slate-100 dark:border-slate-800/60 py-2.5">
                    <td className="py-2.5 font-bold text-slate-800 dark:text-slate-100">{d.name}</td>
                    <td className="py-2.5 text-slate-500">{d.licenseNumber}</td>
                    <td className="py-2.5 text-slate-500">{d.licenseCategory}</td>
                    <td className="py-2.5 text-slate-500">{d.phone}</td>
                    <td className="py-2.5 text-slate-500 font-bold">{d.safetyScore.toFixed(1)}%</td>
                    <td className="py-2.5 text-right font-bold text-slate-800 dark:text-slate-200">{d.status}</td>
                  </tr>
                ))}

              {activeTab === "expenses" &&
                filteredData.map((e) => (
                  <tr key={e.id} className="border-b border-slate-100 dark:border-slate-800/60 py-2.5">
                    <td className="py-2.5 text-slate-500">{new Date(e.date).toLocaleDateString()}</td>
                    <td className="py-2.5 text-slate-800 dark:text-slate-200">{e.vehicleReg}</td>
                    <td className="py-2.5 font-bold text-slate-800 dark:text-slate-100">{e.category}</td>
                    <td className="py-2.5 text-slate-500">{e.description}</td>
                    <td className="py-2.5 text-right font-bold text-slate-800 dark:text-slate-100">${e.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}

              {activeTab === "fuel" &&
                filteredData.map((f) => (
                  <tr key={f.id} className="border-b border-slate-100 dark:border-slate-800/60 py-2.5">
                    <td className="py-2.5 text-slate-500">{new Date(f.date).toLocaleDateString()}</td>
                    <td className="py-2.5 text-slate-800 dark:text-slate-200">{f.vehicleReg}</td>
                    <td className="py-2.5 text-slate-500">{f.odometerReading.toLocaleString()} km</td>
                    <td className="py-2.5 text-slate-500 font-semibold">{f.fuelQuantity} L</td>
                    <td className="py-2.5 text-right font-bold text-slate-800 dark:text-slate-100">${f.fuelCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}

              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">
                    No data records matching selected reporting parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
