"use client";

import React, { useState, useTransition } from "react";
import { Plus, Search, MapPin, Compass, Play, CheckCircle2, XCircle, ChevronDown, ChevronUp, Calendar, Navigation } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { createTrip, dispatchTrip, completeTrip, cancelTrip } from "@/actions/trips";

interface Vehicle {
  id: string;
  name: string;
  regNumber: string;
  loadCapacity: number;
  status: string;
}

interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  safetyScore: number;
  status: string;
}

interface Trip {
  id: string;
  source: string;
  destination: string;
  cargoWeight: number;
  distance: number;
  status: "DRAFT" | "DISPATCHED" | "COMPLETED" | "CANCELLED";
  vehicleId: string;
  vehicle: Vehicle;
  driverId: string;
  driver: Driver;
  createdAt: string;
  updatedAt: string;
}

interface TripsClientProps {
  initialTrips: any[];
  availableVehicles: any[];
  availableDrivers: any[];
  userRole: string;
}

export function TripsClient({
  initialTrips,
  availableVehicles,
  availableDrivers,
  userRole,
}: TripsClientProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [trips, setTrips] = useState<Trip[]>(initialTrips as Trip[]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Selection for Timeline details
  const [expandedTripId, setExpandedTripId] = useState<string | null>(null);

  // Form Modals
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // Form Wizard State
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [cargoWeight, setCargoWeight] = useState("");
  const [distance, setDistance] = useState("");
  const [tripStatus, setTripStatus] = useState<"DRAFT" | "DISPATCHED">("DRAFT");

  const openWizard = () => {
    setSource("");
    setDestination("");
    setVehicleId(availableVehicles[0]?.id || "");
    setDriverId(availableDrivers[0]?.id || "");
    setCargoWeight("");
    setDistance("");
    setTripStatus("DRAFT");
    setIsWizardOpen(true);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();

    if (!source || !destination || !vehicleId || !driverId || !cargoWeight || !distance) {
      toast("Please fill in all wizard parameters.", "warning");
      return;
    }

    const payload = {
      source,
      destination,
      vehicleId,
      driverId,
      cargoWeight: Number(cargoWeight),
      distance: Number(distance),
      status: tripStatus,
    };

    startTransition(async () => {
      const res = await createTrip(payload);
      if (res.error) {
        toast(res.error, "error");
      } else if (res.success && res.trip) {
        toast(
          `Trip successfully ${tripStatus === "DISPATCHED" ? "dispatched" : "saved as draft"}!`,
          "success"
        );
        setIsWizardOpen(false);

        // Fetch refreshed trips or append local client state
        // To be safe, reload window or refresh list since statuses of vehicles/drivers changed
        window.location.reload();
      }
    });
  };

  const handleDispatch = (id: string) => {
    startTransition(async () => {
      const res = await dispatchTrip(id);
      if (res.error) {
        toast(res.error, "error");
      } else {
        toast("Trip successfully dispatched! Driver & vehicle set to on duty.", "success");
        window.location.reload();
      }
    });
  };

  const handleComplete = (id: string) => {
    startTransition(async () => {
      const res = await completeTrip(id);
      if (res.error) {
        toast(res.error, "error");
      } else {
        toast("Trip completed successfully! Vehicle odometer updated.", "success");
        window.location.reload();
      }
    });
  };

  const handleCancel = (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this trip? Drivers and vehicles will be restored.")) return;

    startTransition(async () => {
      const res = await cancelTrip(id);
      if (res.error) {
        toast(res.error, "error");
      } else {
        toast("Trip cancelled. Assets restored.", "warning");
        window.location.reload();
      }
    });
  };

  // Filters
  const filteredTrips = trips.filter((t) => {
    const matchesSearch =
      t.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.vehicle.regNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.driver.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleExpand = (id: string) => {
    setExpandedTripId(expandedTripId === id ? null : id);
  };

  const canManage = ["ADMIN", "DISPATCHER", "MANAGER"].includes(userRole);

  return (
    <div className="flex flex-col gap-6 text-slate-900 dark:text-slate-100 w-full">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Active Dispatches</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Dispatch new trips, view routes tracking timeline, and verify driver assignments.
          </p>
        </div>
        {canManage && (
          <button
            onClick={openWizard}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm hover:shadow active:scale-95 transition-all self-start sm:self-auto"
          >
            <Plus className="h-4.5 w-4.5" />
            Dispatch Wizard
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-white dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by source, destination, vehicle, driver..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:text-white"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none dark:text-white"
        >
          <option value="ALL">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="DISPATCHED">Dispatched</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Trips list */}
      <div className="flex flex-col gap-4">
        {filteredTrips.map((t) => {
          const isExpanded = expandedTripId === t.id;

          return (
            <div
              key={t.id}
              className="border border-slate-200/85 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/50 shadow-sm overflow-hidden flex flex-col"
            >
              {/* Trip summary line */}
              <div
                onClick={() => toggleExpand(t.id)}
                className="flex flex-col md:flex-row md:items-center justify-between p-5 gap-4 cursor-pointer hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition-all select-none"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mt-0.5">
                    <Compass className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                      {t.source.split(",")[0]}
                      <span className="text-slate-400 font-normal">→</span>
                      {t.destination.split(",")[0]}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Distance: <span className="font-bold text-slate-500">{t.distance} km</span> | Load:{" "}
                      <span className="font-bold text-slate-500">{(t.cargoWeight / 1000).toFixed(1)} t</span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:flex items-center gap-6 text-xs text-slate-500">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Vehicle</span>
                    <span className="font-bold mt-0.5 text-slate-800 dark:text-slate-200">{t.vehicle.regNumber}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Driver</span>
                    <span className="font-bold mt-0.5 text-slate-800 dark:text-slate-200">{t.driver.name}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Status</span>
                    <span
                      className={`inline-block text-[9px] font-bold px-2 py-0.5 mt-0.5 rounded-full ${
                        t.status === "COMPLETED"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : t.status === "DISPATCHED"
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          : t.status === "CANCELLED"
                          ? "bg-red-500/10 text-red-600 dark:text-red-400"
                          : "bg-slate-250/50 text-slate-500 dark:bg-slate-800"
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <div className="hidden md:block">
                    {isExpanded ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                  </div>
                </div>
              </div>

              {/* Expanding Details Timeline */}
              {isExpanded && (
                <div className="px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/20 flex flex-col md:flex-row gap-8 justify-between">
                  {/* Timeline representation */}
                  <div className="flex-1">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Trip Timeline</h5>
                    <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 flex flex-col gap-6">
                      {/* Step 1: Draft */}
                      <div className="relative">
                        <div className="absolute -left-[31px] top-0.5 h-4.5 w-4.5 rounded-full border-2 border-emerald-500 bg-white dark:bg-slate-950 flex items-center justify-center">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        </div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Draft Trip Logged</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Created at {new Date(t.createdAt).toLocaleString()}</p>
                      </div>

                      {/* Step 2: Dispatched */}
                      {t.status !== "DRAFT" && (
                        <div className="relative">
                          <div className={`absolute -left-[31px] top-0.5 h-4.5 w-4.5 rounded-full border-2 bg-white dark:bg-slate-950 flex items-center justify-center ${
                            t.status === "CANCELLED" ? "border-red-500" : "border-emerald-500"
                          }`}>
                            <div className={`h-1.5 w-1.5 rounded-full ${t.status === "CANCELLED" ? "bg-red-500" : "bg-emerald-500"}`} />
                          </div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                            {t.status === "CANCELLED" ? "Trip Cancelled" : "Dispatched to Destination"}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {t.status === "CANCELLED" ? "Restored vehicle & driver" : `Vehicle ${t.vehicle.regNumber} set to On Trip`}
                          </p>
                        </div>
                      )}

                      {/* Step 3: Completed */}
                      {t.status === "COMPLETED" && (
                        <div className="relative">
                          <div className="absolute -left-[31px] top-0.5 h-4.5 w-4.5 rounded-full border-2 border-emerald-500 bg-white dark:bg-slate-950 flex items-center justify-center">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          </div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100 font-mono">Completed & Unloaded</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Odometer on vehicle updated by +{t.distance} km. Closed at {new Date(t.updatedAt).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions buttons panel */}
                  {canManage && (
                    <div className="flex md:flex-col gap-2.5 justify-end items-end shrink-0">
                      {t.status === "DRAFT" && (
                        <button
                          onClick={() => handleDispatch(t.id)}
                          disabled={isPending}
                          className="flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 px-3.5 py-2 rounded-xl transition-all"
                        >
                          <Play className="h-4 w-4 fill-white" />
                          Dispatch Route
                        </button>
                      )}
                      {t.status === "DISPATCHED" && (
                        <button
                          onClick={() => handleComplete(t.id)}
                          disabled={isPending}
                          className="flex items-center gap-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 rounded-xl transition-all"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Complete Trip
                        </button>
                      )}
                      {(t.status === "DRAFT" || t.status === "DISPATCHED") && (
                        <button
                          onClick={() => handleCancel(t.id)}
                          disabled={isPending}
                          className="flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-white border border-red-500/20 bg-red-500/5 hover:bg-red-600 px-3.5 py-2 rounded-xl transition-all"
                        >
                          <XCircle className="h-4 w-4" />
                          Cancel Trip
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {filteredTrips.length === 0 && (
          <div className="text-center py-12 border border-slate-200/80 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/40 text-slate-400 font-medium">
            No dispatch routes matching search filters.
          </div>
        )}
      </div>

      {/* Dispatch Wizard Modal */}
      <Modal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        title="Dispatch Wizard"
        size="md"
      >
        <form onSubmit={handleCreate} className="flex flex-col gap-4 text-xs font-medium">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 font-semibold uppercase tracking-wide">Departure Source</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="New York Port, NY"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 font-semibold uppercase tracking-wide">Destination Terminal</label>
              <div className="relative">
                <Navigation className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Logan Logistics, Boston, MA"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400 font-semibold uppercase tracking-wide">Select Vehicle (Only showing Available)</label>
            <select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
            >
              {availableVehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  🚛 {v.regNumber} - {v.name} (Cap: {(v.loadCapacity / 1000).toFixed(1)}t)
                </option>
              ))}
              {availableVehicles.length === 0 && (
                <option disabled value="">⚠️ No available vehicles in depot! Clear maintenance or trips first.</option>
              )}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400 font-semibold uppercase tracking-wide">Assign Driver (Only showing Available & Licensed)</label>
            <select
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
            >
              {availableDrivers.map((d) => (
                <option key={d.id} value={d.id}>
                  👤 {d.name} - Safety Score: {d.safetyScore.toFixed(1)}
                </option>
              ))}
              {availableDrivers.length === 0 && (
                <option disabled value="">⚠️ No available drivers on duty!</option>
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 font-semibold uppercase tracking-wide">Cargo weight (kg)</label>
              <input
                type="number"
                required
                value={cargoWeight}
                onChange={(e) => setCargoWeight(e.target.value)}
                placeholder="15000"
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 font-semibold uppercase tracking-wide">Odometer Distance (km)</label>
              <input
                type="number"
                required
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                placeholder="350"
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400 font-semibold uppercase tracking-wide">Wizard Dispatch State</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                type="button"
                onClick={() => setTripStatus("DRAFT")}
                className={`py-2 px-3 border rounded-xl text-xs font-semibold transition-all ${
                  tripStatus === "DRAFT"
                    ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    : "border-slate-200 dark:border-slate-800 text-slate-500"
                }`}
              >
                Save as Draft
              </button>
              <button
                type="button"
                onClick={() => setTripStatus("DISPATCHED")}
                className={`py-2 px-3 border rounded-xl text-xs font-semibold transition-all ${
                  tripStatus === "DISPATCHED"
                    ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    : "border-slate-200 dark:border-slate-800 text-slate-500"
                }`}
              >
                🚀 Dispatch Now
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsWizardOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-850"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || availableVehicles.length === 0 || availableDrivers.length === 0}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold active:scale-95 disabled:opacity-50 transition-all"
            >
              {isPending ? "Dispatching..." : tripStatus === "DISPATCHED" ? "🚀 Dispatch Route" : "Save Draft"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
