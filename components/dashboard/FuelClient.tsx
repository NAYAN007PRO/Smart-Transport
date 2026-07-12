"use client";

import React, { useState, useTransition } from "react";
import { Plus, Search, Calendar, DollarSign, Fuel, ArrowLeftRight, Activity } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { createFuelLog } from "@/actions/financials";

interface Vehicle {
  id: string;
  name: string;
  regNumber: string;
}

interface Trip {
  id: string;
  source: string;
  destination: string;
  vehicle: Vehicle;
}

interface FuelLog {
  id: string;
  vehicleId: string;
  vehicle: Vehicle;
  tripId: string | null;
  trip: Trip | null;
  fuelQuantity: number;
  fuelCost: number;
  odometerReading: number;
  date: string;
}

interface FuelClientProps {
  initialFuelLogs: any[];
  vehicles: any[];
  activeTrips: any[];
  userRole: string;
}

export function FuelClient({
  initialFuelLogs,
  vehicles,
  activeTrips,
  userRole,
}: FuelClientProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [logs, setLogs] = useState<FuelLog[]>(initialFuelLogs as FuelLog[]);
  const [searchQuery, setSearchQuery] = useState("");

  // Create Form State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [vehicleId, setVehicleId] = useState("");
  const [tripId, setTripId] = useState("");
  const [fuelQuantity, setFuelQuantity] = useState("");
  const [fuelCost, setFuelCost] = useState("");
  const [odometerReading, setOdometerReading] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Aggregate Fuel Statistics
  const totalLiters = logs.reduce((acc, curr) => acc + curr.fuelQuantity, 0);
  const totalCost = logs.reduce((acc, curr) => acc + curr.fuelCost, 0);
  const avgPricePerLiter = totalLiters > 0 ? totalCost / totalLiters : 0;

  const openCreateModal = () => {
    setVehicleId(vehicles[0]?.id || "");
    setTripId("");
    setFuelQuantity("");
    setFuelCost("");
    setOdometerReading("");
    setDate(new Date().toISOString().split("T")[0]);
    setIsCreateOpen(true);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();

    if (!vehicleId || !fuelQuantity || !fuelCost || !odometerReading || !date) {
      toast("Please fill in all required fields.", "warning");
      return;
    }

    const payload = {
      vehicleId,
      tripId: tripId || null,
      fuelQuantity: Number(fuelQuantity),
      fuelCost: Number(fuelCost),
      odometerReading: Number(odometerReading),
      date: new Date(date),
    };

    startTransition(async () => {
      const res = await createFuelLog(payload);
      if (res.error) {
        toast(res.error, "error");
      } else if (res.success && res.fuelLog) {
        toast("Fuel refuel log successfully created!", "success");
        setIsCreateOpen(false);
        window.location.reload();
      }
    });
  };

  // Filter & Search
  const filteredLogs = logs.filter((l) => {
    return (
      l.vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.vehicle.regNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.trip && l.trip.destination.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  // Pagination Calculation
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex flex-col gap-6 text-slate-900 dark:text-slate-100 w-full">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Fuel Log Audits</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Log fuel purchases, monitor usage metrics, and audit fuel efficiency aggregates.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm hover:shadow active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="h-4.5 w-4.5" />
          Log Fuel Purchase
        </button>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Fuel Purchased</span>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5 flex items-baseline gap-1">
            {totalLiters.toFixed(1)} <span className="text-xs font-bold text-slate-400">Liters</span>
          </h3>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Fuel cost</span>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">
            ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Fuel Price</span>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">
            ${avgPricePerLiter.toFixed(2)} / Litre
          </h3>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="relative max-w-md w-full bg-white dark:bg-slate-900/40 p-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
        <Search className="absolute left-4 top-4.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by registration number, vehicle name..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:text-white"
        />
      </div>

      {/* Logs Table */}
      <div className="border border-slate-200/80 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 text-slate-400 font-bold uppercase">
                <th className="p-4">Purchase Date</th>
                <th className="p-4">Vehicle</th>
                <th className="p-4">Linked Active Trip</th>
                <th className="p-4">Odometer</th>
                <th className="p-4">Fuel Quantity</th>
                <th className="p-4">Total Cost</th>
                <th className="p-4 text-right">Unit Price</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.map((l) => (
                <tr
                  key={l.id}
                  className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/20 dark:hover:bg-slate-900/10 font-medium"
                >
                  <td className="p-4 text-slate-500 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    {new Date(l.date).toLocaleDateString()}
                  </td>
                  <td className="p-4 font-bold text-slate-800 dark:text-slate-100">
                    <div className="flex flex-col">
                      <span>{l.vehicle.regNumber}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{l.vehicle.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-400">
                    {l.trip ? `Route: ${l.trip.destination.split(",")[0]}` : "No trip linked"}
                  </td>
                  <td className="p-4 text-slate-500">
                    <span className="flex items-center gap-1">
                      <ArrowLeftRight className="h-3.5 w-3.5 text-slate-400" />
                      {l.odometerReading.toLocaleString()} km
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1">
                      <Fuel className="h-3.5 w-3.5 text-slate-400" />
                      {l.fuelQuantity} L
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-0.5">
                      <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                      {l.fuelCost.toLocaleString()}
                    </span>
                  </td>
                  <td className="p-4 text-right font-mono font-semibold text-slate-500">
                    ${(l.fuelCost / l.fuelQuantity).toFixed(2)} / L
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                    No fuel purchase logs found matching search filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-400 font-semibold">
              Page {currentPage} of {totalPages} ({filteredLogs.length} total entries)
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((c) => Math.max(c - 1, 1))}
                className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-850 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((c) => Math.min(c + 1, totalPages))}
                className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-850 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Log Refuel Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Log Fuel Purchase"
        size="md"
      >
        <form onSubmit={handleCreate} className="flex flex-col gap-4 text-xs font-medium">
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400 font-semibold uppercase tracking-wide">Select Vehicle</label>
            <select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  🚛 {v.regNumber} - {v.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400 font-semibold uppercase tracking-wide">Link active trip (Optional)</label>
            <select
              value={tripId}
              onChange={(e) => setTripId(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
            >
              <option value="">-- No trip association --</option>
              {activeTrips.map((t) => (
                <option key={t.id} value={t.id}>
                  📍 {t.vehicle.regNumber} to {t.destination.split(",")[0]} ({t.driver.name})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 font-semibold uppercase tracking-wide">Fuel Quantity (Liters)</label>
              <input
                type="number"
                step="0.01"
                required
                value={fuelQuantity}
                onChange={(e) => setFuelQuantity(e.target.value)}
                placeholder="120.5"
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 font-semibold uppercase tracking-wide">Total Fuel Cost ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={fuelCost}
                onChange={(e) => setFuelCost(e.target.value)}
                placeholder="155.8"
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 font-semibold uppercase tracking-wide">Current Odometer reading (km)</label>
              <input
                type="number"
                required
                value={odometerReading}
                onChange={(e) => setOdometerReading(e.target.value)}
                placeholder="120650"
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 font-semibold uppercase tracking-wide">Refuel Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-850"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || vehicles.length === 0}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold active:scale-95 disabled:opacity-50 transition-all"
            >
              {isPending ? "Logging..." : "Log Fuel Purchase"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
