"use client";

import React, { useState, useTransition } from "react";
import { Plus, Search, Calendar, DollarSign, Tag, Trash2, Link as LinkIcon } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { createExpense, deleteExpense } from "@/actions/financials";

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

interface Expense {
  id: string;
  vehicleId: string;
  vehicle: Vehicle;
  tripId: string | null;
  trip: Trip | null;
  amount: number;
  category: "FUEL" | "MAINTENANCE" | "TOLL" | "INSURANCE" | "OTHERS";
  description: string;
  date: string;
}

interface ExpensesClientProps {
  initialExpenses: any[];
  vehicles: any[];
  trips: any[];
  userRole: string;
}

export function ExpensesClient({
  initialExpenses,
  vehicles,
  trips,
  userRole,
}: ExpensesClientProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses as Expense[]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  // Create Form State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [vehicleId, setVehicleId] = useState("");
  const [tripId, setTripId] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<any>("TOLL");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Compute stats
  const totalAmount = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const categoriesStats = expenses.reduce(
    (acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    },
    {} as Record<string, number>
  );

  const openCreateModal = () => {
    setVehicleId(vehicles[0]?.id || "");
    setTripId("");
    setAmount("");
    setCategory("TOLL");
    setDescription("");
    setDate(new Date().toISOString().split("T")[0]);
    setIsCreateOpen(true);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();

    if (!vehicleId || !amount || !category || !description || !date) {
      toast("Please fill in all required fields.", "warning");
      return;
    }

    const payload = {
      vehicleId,
      tripId: tripId || null,
      amount: Number(amount),
      category,
      description,
      date: new Date(date),
    };

    startTransition(async () => {
      const res = await createExpense(payload);
      if (res.error) {
        toast(res.error, "error");
      } else if (res.success && res.expense) {
        toast("Expense successfully logged!", "success");
        setIsCreateOpen(false);
        window.location.reload();
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this expense record?")) return;

    startTransition(async () => {
      const res = await deleteExpense(id);
      if (res.error) {
        toast(res.error, "error");
      } else {
        toast("Expense record deleted successfully.", "success");
        setExpenses((prev) => prev.filter((e) => e.id !== id));
      }
    });
  };

  // Filter & Search
  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.vehicle.regNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === "ALL" || e.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const paginatedExpenses = filteredExpenses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const canManage = ["ADMIN", "MANAGER"].includes(userRole);
  const canDelete = userRole === "ADMIN";

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "FUEL":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/15";
      case "MAINTENANCE":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/15";
      case "TOLL":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/15";
      case "INSURANCE":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/15";
      default:
        return "bg-slate-100 text-slate-600 dark:bg-slate-800 border-slate-700/15";
    }
  };

  return (
    <div className="flex flex-col gap-6 text-slate-900 dark:text-slate-100 w-full">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Expense Ledger</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track toll road bills, refuels, insurance plans, workshop tickets, and audit operating totals.
          </p>
        </div>
        {canManage && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm hover:shadow active:scale-95 transition-all self-start sm:self-auto"
          >
            <Plus className="h-4.5 w-4.5" />
            Log Expense
          </button>
        )}
      </div>

      {/* Aggregate Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 col-span-2 md:col-span-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Expensed</span>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            ${totalAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </h3>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fuel purchases</span>
          <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            ${(categoriesStats.FUEL || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </h3>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Maintenance bills</span>
          <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            ${(categoriesStats.MAINTENANCE || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </h3>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Highway Toll bills</span>
          <h3 className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">
            ${(categoriesStats.TOLL || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </h3>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fleet Insurance</span>
          <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            ${(categoriesStats.INSURANCE || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </h3>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-white dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by description, vehicle, plate..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:text-white"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none dark:text-white"
        >
          <option value="ALL">All Categories</option>
          <option value="FUEL">Fuel</option>
          <option value="MAINTENANCE">Maintenance</option>
          <option value="TOLL">Toll Road</option>
          <option value="INSURANCE">Insurance</option>
          <option value="OTHERS">Others</option>
        </select>
      </div>

      {/* Ledger Table */}
      <div className="border border-slate-200/80 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 text-slate-400 font-bold uppercase">
                <th className="p-4">Expense Date</th>
                <th className="p-4">Vehicle</th>
                <th className="p-4">Account Category</th>
                <th className="p-4">Linked Dispatch</th>
                <th className="p-4">Details Description</th>
                <th className="p-4">Amount</th>
                {canDelete && <th className="p-4 text-right">Delete</th>}
              </tr>
            </thead>
            <tbody>
              {paginatedExpenses.map((e) => (
                <tr
                  key={e.id}
                  className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/20 dark:hover:bg-slate-900/10 font-medium"
                >
                  <td className="p-4 text-slate-500 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    {new Date(e.date).toLocaleDateString()}
                  </td>
                  <td className="p-4 font-bold text-slate-800 dark:text-slate-100">{e.vehicle.regNumber}</td>
                  <td className="p-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider ${getCategoryColor(
                        e.category
                      )}`}
                    >
                      {e.category}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">
                    {e.trip ? (
                      <span className="flex items-center gap-1">
                        <LinkIcon className="h-3.5 w-3.5 text-slate-500" />
                        Trip to {e.trip.destination.split(",")[0]}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="p-4 text-slate-500 max-w-[220px] truncate">{e.description}</td>
                  <td className="p-4 font-bold text-slate-800 dark:text-slate-100">
                    <span className="flex items-center gap-0.5">
                      <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                      {e.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  {canDelete && (
                    <td className="p-4 text-right">
                      {e.category !== "FUEL" && e.category !== "MAINTENANCE" ? (
                        <button
                          onClick={() => handleDelete(e.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-normal">Auto-linked</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={canDelete ? 7 : 6} className="p-8 text-center text-slate-400 font-medium">
                    No expense transactions found matching search filters.
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
              Page {currentPage} of {totalPages} ({filteredExpenses.length} total entries)
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

      {/* Log Expense Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Log Fleet Expense"
        size="md"
      >
        <form onSubmit={handleCreate} className="flex flex-col gap-4 text-xs font-medium">
          <div className="grid grid-cols-2 gap-4">
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
              <label className="text-slate-400 font-semibold uppercase tracking-wide">Expense Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
              >
                <option value="TOLL">Toll Road fees</option>
                <option value="INSURANCE">Insurance Plan</option>
                <option value="OTHERS">Others / Office</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400 font-semibold uppercase tracking-wide">Link Trip (Optional)</label>
            <select
              value={tripId}
              onChange={(e) => setTripId(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
            >
              <option value="">-- No trip association --</option>
              {trips.map((t) => (
                <option key={t.id} value={t.id}>
                  📍 {t.vehicle.regNumber} to {t.destination.split(",")[0]}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 font-semibold uppercase tracking-wide">Expense Amount ($)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="85"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 font-semibold uppercase tracking-wide">Transaction Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400 font-semibold uppercase tracking-wide">Detailed Description</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="E.g., Highway tolls on route, quarterly vehicle permit fee"
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
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
              {isPending ? "Logging..." : "Log Expense"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
