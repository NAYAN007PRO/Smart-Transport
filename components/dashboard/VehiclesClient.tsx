"use client";

import React, { useState, useTransition } from "react";
import { Plus, Search, Edit2, Trash2, SlidersHorizontal, ArrowLeftRight, Weight } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { upsertVehicle, deleteVehicle } from "@/actions/vehicles";

interface Vehicle {
  id: string;
  name: string;
  regNumber: string;
  model: string;
  type: string;
  loadCapacity: number;
  odometer: number;
  acquisitionCost: number;
  status: "AVAILABLE" | "ON_TRIP" | "IN_SHOP" | "RETIRED";
}

interface VehiclesClientProps {
  initialVehicles: any[];
  userRole: string;
}

export function VehiclesClient({ initialVehicles, userRole }: VehiclesClientProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles as Vehicle[]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [model, setModel] = useState("");
  const [type, setType] = useState("TRUCK");
  const [loadCapacity, setLoadCapacity] = useState("");
  const [odometer, setOdometer] = useState("");
  const [acquisitionCost, setAcquisitionCost] = useState("");
  const [status, setStatus] = useState<any>("AVAILABLE");

  const openAddModal = () => {
    setSelectedVehicle(null);
    setName("");
    setRegNumber("");
    setModel("");
    setType("TRUCK");
    setLoadCapacity("");
    setOdometer("");
    setAcquisitionCost("");
    setStatus("AVAILABLE");
    setIsFormOpen(true);
  };

  const openEditModal = (v: Vehicle) => {
    setSelectedVehicle(v);
    setName(v.name);
    setRegNumber(v.regNumber);
    setModel(v.model);
    setType(v.type);
    setLoadCapacity(v.loadCapacity.toString());
    setOdometer(v.odometer.toString());
    setAcquisitionCost(v.acquisitionCost.toString());
    setStatus(v.status);
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !regNumber || !model || !type || !loadCapacity || !odometer || !acquisitionCost) {
      toast("All fields are required.", "warning");
      return;
    }

    const payload = {
      id: selectedVehicle?.id,
      name,
      regNumber,
      model,
      type,
      loadCapacity: Number(loadCapacity),
      odometer: Number(odometer),
      acquisitionCost: Number(acquisitionCost),
      status,
    };

    startTransition(async () => {
      const res = await upsertVehicle(payload);
      if (res.error) {
        toast(res.error, "error");
      } else if (res.success && res.vehicle) {
        toast(
          `Vehicle ${selectedVehicle ? "updated" : "created"} successfully!`,
          "success"
        );
        setIsFormOpen(false);

        // Update client side list
        const updatedVehicle = res.vehicle as Vehicle;
        if (selectedVehicle) {
          setVehicles((prev) =>
            prev.map((v) => (v.id === updatedVehicle.id ? updatedVehicle : v))
          );
        } else {
          setVehicles((prev) => [updatedVehicle, ...prev]);
        }
      }
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete vehicle: ${name}?`)) return;

    startTransition(async () => {
      const res = await deleteVehicle(id);
      if (res.error) {
        toast(res.error, "error");
      } else {
        toast("Vehicle deleted successfully.", "success");
        setVehicles((prev) => prev.filter((v) => v.id !== id));
      }
    });
  };

  // Filter and Search logic
  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.regNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.model.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || v.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
  const paginatedVehicles = filteredVehicles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const canManage = ["ADMIN", "MANAGER"].includes(userRole);
  const canDelete = userRole === "ADMIN";

  return (
    <div className="flex flex-col gap-6 text-slate-900 dark:text-slate-100 w-full">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Vehicle Registry</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track and update cargo load capacities, odometer readings, and telemetry status.
          </p>
        </div>
        {canManage && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm hover:shadow active:scale-95 transition-all self-start sm:self-auto"
          >
            <Plus className="h-4.5 w-4.5" />
            Add Vehicle
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-white dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by registration number, name..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-3">
          <SlidersHorizontal className="h-4.5 w-4.5 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none dark:text-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="ON_TRIP">On Trip</option>
            <option value="IN_SHOP">In Shop</option>
            <option value="RETIRED">Retired</option>
          </select>
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="border border-slate-200/80 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 text-slate-400 font-bold uppercase">
                <th className="p-4">Reg Number</th>
                <th className="p-4">Name / Model</th>
                <th className="p-4">Type</th>
                <th className="p-4">Capacity</th>
                <th className="p-4">Odometer</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedVehicles.map((v) => (
                <tr
                  key={v.id}
                  className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/20 dark:hover:bg-slate-900/10 font-medium"
                >
                  <td className="p-4 font-bold text-slate-800 dark:text-slate-100">{v.regNumber}</td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{v.name}</span>
                      <span className="text-[10px] text-slate-400">{v.model}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="bg-slate-100 dark:bg-slate-800 text-[10px] font-bold px-2 py-0.5 rounded text-slate-500 uppercase tracking-wide">
                      {v.type}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500">
                    <div className="flex items-center gap-1">
                      <Weight className="h-3.5 w-3.5 text-slate-400" />
                      {(v.loadCapacity / 1000).toFixed(1)} t
                    </div>
                  </td>
                  <td className="p-4 text-slate-500">
                    <div className="flex items-center gap-1">
                      <ArrowLeftRight className="h-3.5 w-3.5 text-slate-400" />
                      {v.odometer.toLocaleString()} km
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                        v.status === "AVAILABLE"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : v.status === "ON_TRIP"
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          : v.status === "IN_SHOP"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          : "bg-red-500/10 text-red-600 dark:text-red-400"
                      }`}
                    >
                      {v.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      {canManage && (
                        <button
                          onClick={() => openEditModal(v)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(v.id, v.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredVehicles.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                    No vehicles found matching search filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-400 font-semibold">
              Page {currentPage} of {totalPages} ({filteredVehicles.length} total entries)
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

      {/* Upsert Modal Form */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedVehicle ? "Edit Vehicle Registration" : "Register New Vehicle"}
        size="md"
      >
        <form onSubmit={handleSave} className="flex flex-col gap-4 text-xs font-medium">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 font-semibold uppercase tracking-wide">Vehicle Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Volvo FH16 Globetrotter"
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 font-semibold uppercase tracking-wide">Registration Number</label>
              <input
                type="text"
                required
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                placeholder="NY-V123-FH"
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 font-semibold uppercase tracking-wide">Model / Engine</label>
              <input
                type="text"
                required
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="2024 Heavy Duty"
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 font-semibold uppercase tracking-wide">Vehicle Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
              >
                <option value="TRUCK">Heavy Truck</option>
                <option value="VAN">Light Cargo Van</option>
                <option value="CAR">Operational Car</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 font-semibold uppercase tracking-wide">Load Capacity (kg)</label>
              <input
                type="number"
                required
                value={loadCapacity}
                onChange={(e) => setLoadCapacity(e.target.value)}
                placeholder="25000"
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 font-semibold uppercase tracking-wide">Odometer (km)</label>
              <input
                type="number"
                required
                value={odometer}
                onChange={(e) => setOdometer(e.target.value)}
                placeholder="120500"
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 font-semibold uppercase tracking-wide">Acquisition Cost ($)</label>
              <input
                type="number"
                required
                value={acquisitionCost}
                onChange={(e) => setAcquisitionCost(e.target.value)}
                placeholder="145000"
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {selectedVehicle && (
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 font-semibold uppercase tracking-wide">Operational Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
              >
                <option value="AVAILABLE">Available</option>
                <option value="ON_TRIP">On Trip</option>
                <option value="IN_SHOP">In Shop (Workshop)</option>
                <option value="RETIRED">Retired</option>
              </select>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-850"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold active:scale-95 disabled:opacity-50 transition-all"
            >
              {isPending ? "Processing..." : "Save Vehicle"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
