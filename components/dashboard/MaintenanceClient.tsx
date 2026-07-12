"use client";

import React, { useState, useTransition } from "react";
import { Plus, Search, Calendar, DollarSign, PenTool, CheckCircle, FileClock } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { createMaintenance, closeMaintenance } from "@/actions/maintenance";

interface Vehicle {
  id: string;
  name: string;
  regNumber: string;
  status: string;
}

interface MaintenanceLog {
  id: string;
  vehicleId: string;
  vehicle: Vehicle;
  description: string;
  cost: number;
  openedAt: string;
  closedAt: string | null;
  status: "OPEN" | "CLOSED";
  notes: string | null;
}

interface MaintenanceClientProps {
  initialLogs: any[];
  vehicles: any[];
  userRole: string;
}

export function MaintenanceClient({
  initialLogs,
  vehicles,
  userRole,
}: MaintenanceClientProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [logs, setLogs] = useState<MaintenanceLog[]>(initialLogs as MaintenanceLog[]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCloseOpen, setIsCloseOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<MaintenanceLog | null>(null);

  // Create Form State
  const [vehicleId, setVehicleId] = useState("");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState("");
  const [notes, setNotes] = useState("");

  // Close Form State
  const [actualCost, setActualCost] = useState("");
  const [closeNotes, setCloseNotes] = useState("");

  const openCreateModal = () => {
    setVehicleId(vehicles[0]?.id || "");
    setDescription("");
    setCost("");
    setNotes("");
    setIsCreateOpen(true);
  };

  const openCloseModal = (log: MaintenanceLog) => {
    setSelectedLog(log);
    setActualCost(log.cost.toString());
    setCloseNotes(log.notes || "");
    setIsCloseOpen(true);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();

    if (!vehicleId || !description || !cost) {
      toast("Please fill in all required fields.", "warning");
      return;
    }

    const payload = {
      vehicleId,
      description,
      cost: Number(cost),
      notes,
      status: "OPEN" as const,
    };

    startTransition(async () => {
      const res = await createMaintenance(payload);
      if (res.error) {
        toast(res.error, "error");
      } else if (res.success && res.log) {
        toast("Maintenance logged successfully! Vehicle set to In Shop.", "success");
        setIsCreateOpen(false);
        window.location.reload();
      }
    });
  };

  const handleClose = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedLog) return;

    startTransition(async () => {
      const res = await closeMaintenance(
        selectedLog.id,
        closeNotes,
        actualCost ? Number(actualCost) : undefined
      );

      if (res.error) {
        toast(res.error, "error");
      } else {
        toast("Maintenance closed. Vehicle restored to Available status.", "success");
        setIsCloseOpen(false);
        window.location.reload();
      }
    });
  };

  // Filter & Search
  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      l.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.vehicle.regNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.notes && l.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const canManage = ["ADMIN", "MANAGER"].includes(userRole);

  return (
    <div className="flex flex-col gap-6 text-slate-900 dark:text-slate-100 w-full">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Workshop Maintenance</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track repairs, log diagnostics, manage workshop notes, and audit maintenance costs.
          </p>
        </div>
        {canManage && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm hover:shadow active:scale-95 transition-all self-start sm:self-auto"
          >
            <Plus className="h-4.5 w-4.5" />
            Log Maintenance
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-white dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by description, vehicle, notes..."
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
          <option value="ALL">All Logs</option>
          <option value="OPEN">Open (In Workshop)</option>
          <option value="CLOSED">Closed (Repaired)</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="border border-slate-200/80 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 text-slate-400 font-bold uppercase">
                <th className="p-4">Vehicle</th>
                <th className="p-4">Job Description</th>
                <th className="p-4">Timeline</th>
                <th className="p-4">Cost</th>
                <th className="p-4">Status</th>
                <th className="p-4">Workshop Notes</th>
                {canManage && <th className="p-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((l) => (
                <tr
                  key={l.id}
                  className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/20 dark:hover:bg-slate-900/10 font-medium"
                >
                  <td className="p-4 font-bold text-slate-800 dark:text-slate-100">
                    <div className="flex flex-col">
                      <span>{l.vehicle.regNumber}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{l.vehicle.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-800 dark:text-slate-200 max-w-[200px] truncate">{l.description}</td>
                  <td className="p-4 text-slate-500">
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        Opened: {new Date(l.openedAt).toLocaleDateString()}
                      </span>
                      {l.closedAt && (
                        <span className="text-emerald-500 flex items-center gap-1 font-bold">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                          Closed: {new Date(l.closedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-slate-500">
                    <span className="flex items-center gap-0.5 font-semibold text-slate-700 dark:text-slate-300">
                      <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                      {l.cost.toLocaleString()}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                        l.status === "OPEN"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 animate-pulse"
                          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {l.status === "OPEN" ? "IN WORKSHOP" : "REPAIRED"}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400 max-w-[180px] truncate">{l.notes || "-"}</td>
                  {canManage && (
                    <td className="p-4 text-right">
                      {l.status === "OPEN" ? (
                        <button
                          onClick={() => openCloseModal(l)}
                          className="inline-flex items-center justify-center gap-1 bg-amber-500 hover:bg-amber-400 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-xl shadow-sm transition-all"
                        >
                          <FileClock className="h-3.5 w-3.5" />
                          Release
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400">Completed</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={canManage ? 7 : 6} className="p-8 text-center text-slate-400 font-medium">
                    No workshop logs found matching search filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Maintenance Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Log Vehicle Maintenance"
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
                  🚛 {v.regNumber} - {v.name} (Status: {v.status})
                </option>
              ))}
              {vehicles.length === 0 && (
                <option disabled value="">⚠️ No vehicles registered in database.</option>
              )}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400 font-semibold uppercase tracking-wide">Job Description</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="E.g., Brake pad replacement, scheduled engine servicing"
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400 font-semibold uppercase tracking-wide">Estimated Cost ($)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="number"
                required
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="450"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400 font-semibold uppercase tracking-wide">Workshop notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Initial diagnostic details..."
              rows={3}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
            />
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
              {isPending ? "Logging..." : "Log in Shop"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Close Maintenance Modal */}
      <Modal
        isOpen={isCloseOpen}
        onClose={() => setIsCloseOpen(false)}
        title="Release Vehicle from Maintenance"
        size="md"
      >
        <form onSubmit={handleClose} className="flex flex-col gap-4 text-xs font-medium">
          <div className="bg-amber-500/10 border border-amber-500/25 text-amber-800 dark:text-amber-200 rounded-xl p-3.5 text-xs">
            <p className="font-bold flex items-center gap-1">
              <PenTool className="h-4.5 w-4.5" />
              Completing Service Job
            </p>
            {selectedLog && (
              <p className="mt-1 text-slate-500">
                You are releasing vehicle <strong>{selectedLog.vehicle.regNumber}</strong> from the workshop.
                This will automatically restore its status to <strong>Available</strong>.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400 font-semibold uppercase tracking-wide">Final Actual Cost ($)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="number"
                required
                value={actualCost}
                onChange={(e) => setActualCost(e.target.value)}
                placeholder="Final invoice amount"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400 font-semibold uppercase tracking-wide">Final Workshop Completion Notes</label>
            <textarea
              required
              value={closeNotes}
              onChange={(e) => setCloseNotes(e.target.value)}
              placeholder="Description of parts replaced, service outcome..."
              rows={3}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsCloseOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-850"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold active:scale-95 disabled:opacity-50 transition-all"
            >
              {isPending ? "Releasing..." : "Release & Set Available"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
