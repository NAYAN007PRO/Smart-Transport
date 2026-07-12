"use client";

import React, { useState, useTransition } from "react";
import { Plus, Search, Edit2, Trash2, SlidersHorizontal, ShieldAlert, Phone, Award, Calendar } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { upsertDriver, deleteDriver } from "@/actions/drivers";

interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiry: string;
  phone: string;
  safetyScore: number;
  status: "AVAILABLE" | "ON_TRIP" | "OFF_DUTY" | "SUSPENDED";
}

interface DriversClientProps {
  initialDrivers: any[];
  userRole: string;
}

export function DriversClient({ initialDrivers, userRole }: DriversClientProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers as unknown as Driver[]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseCategory, setLicenseCategory] = useState("Class A CDL");
  const [licenseExpiry, setLicenseExpiry] = useState("");
  const [phone, setPhone] = useState("");
  const [safetyScore, setSafetyScore] = useState("100");
  const [status, setStatus] = useState<any>("AVAILABLE");

  const openAddModal = () => {
    setSelectedDriver(null);
    setName("");
    setLicenseNumber("");
    setLicenseCategory("Class A CDL");
    setLicenseExpiry("");
    setPhone("");
    setSafetyScore("100");
    setStatus("AVAILABLE");
    setIsFormOpen(true);
  };

  const openEditModal = (d: Driver) => {
    setSelectedDriver(d);
    setName(d.name);
    setLicenseNumber(d.licenseNumber);
    setLicenseCategory(d.licenseCategory);
    // Format date string to YYYY-MM-DD
    const dateObj = new Date(d.licenseExpiry);
    const dateFormatted = dateObj.toISOString().split("T")[0];
    setLicenseExpiry(dateFormatted);
    setPhone(d.phone);
    setSafetyScore(d.safetyScore.toString());
    setStatus(d.status);
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !licenseNumber || !licenseCategory || !licenseExpiry || !phone || !safetyScore) {
      toast("All fields are required.", "warning");
      return;
    }

    const payload = {
      id: selectedDriver?.id,
      name,
      licenseNumber,
      licenseCategory,
      licenseExpiry: new Date(licenseExpiry),
      phone,
      safetyScore: Number(safetyScore),
      status,
    };

    startTransition(async () => {
      const res = await upsertDriver(payload);
      if (res.error) {
        toast(res.error, "error");
      } else if (res.success && res.driver) {
        toast(
          `Driver profile ${selectedDriver ? "updated" : "created"} successfully!`,
          "success"
        );
        setIsFormOpen(false);

        // Update list
        const updated = res.driver as unknown as Driver;
        if (selectedDriver) {
          setDrivers((prev) =>
            prev.map((d) => (d.id === updated.id ? updated : d))
          );
        } else {
          setDrivers((prev) => [updated, ...prev]);
        }
      }
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete driver profile: ${name}?`)) return;

    startTransition(async () => {
      const res = await deleteDriver(id);
      if (res.error) {
        toast(res.error, "error");
      } else {
        toast("Driver profile deleted successfully.", "success");
        setDrivers((prev) => prev.filter((d) => d.id !== id));
      }
    });
  };

  // Filter & Search
  const filteredDrivers = drivers.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.phone.includes(searchQuery);

    const matchesStatus = statusFilter === "ALL" || d.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredDrivers.length / itemsPerPage);
  const paginatedDrivers = filteredDrivers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const canManage = ["ADMIN", "MANAGER"].includes(userRole);
  const canDelete = userRole === "ADMIN";

  // License Expiry Visual Helper
  const getLicenseExpiryStatus = (expiryDateString: string) => {
    const expiry = new Date(expiryDateString);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: "EXPIRED", color: "text-red-600 bg-red-500/10 border-red-500/20", critical: true };
    } else if (diffDays <= 60) {
      return { label: `EXPIRING (${diffDays}d)`, color: "text-amber-600 bg-amber-500/10 border-amber-500/20", critical: true };
    }
    return { label: "VALID", color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20", critical: false };
  };

  return (
    <div className="flex flex-col gap-6 text-slate-900 dark:text-slate-100 w-full">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Driver Registry</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage dispatch statuses, monitor safety scores, and audit commercial driver licensing.
          </p>
        </div>
        {canManage && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm hover:shadow active:scale-95 transition-all self-start sm:self-auto"
          >
            <Plus className="h-4.5 w-4.5" />
            Add Driver
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-white dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by driver name, license number, phone..."
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
            <option value="OFF_DUTY">Off Duty</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      {/* Drivers Table */}
      <div className="border border-slate-200/80 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 text-slate-400 font-bold uppercase">
                <th className="p-4">Driver Name</th>
                <th className="p-4">License Code</th>
                <th className="p-4">License Type</th>
                <th className="p-4">License Expiry</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Safety Score</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDrivers.map((d) => {
                const expiryInfo = getLicenseExpiryStatus(d.licenseExpiry);

                return (
                  <tr
                    key={d.id}
                    className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/20 dark:hover:bg-slate-900/10 font-medium"
                  >
                    <td className="p-4 font-bold text-slate-800 dark:text-slate-100">{d.name}</td>
                    <td className="p-4 text-slate-500 font-mono">{d.licenseNumber}</td>
                    <td className="p-4">
                      <span className="bg-slate-100 dark:bg-slate-800 text-[10px] font-bold px-2 py-0.5 rounded text-slate-500 uppercase tracking-wide">
                        {d.licenseCategory}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {new Date(d.licenseExpiry).toLocaleDateString()}
                        </span>
                        <span
                          className={`inline-block self-start text-[8px] font-extrabold px-1.5 py-0.5 rounded border ${expiryInfo.color}`}
                        >
                          {expiryInfo.label}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-500">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        {d.phone}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <Award className="h-4 w-4 text-yellow-500" />
                        <span
                          className={`font-bold ${
                            d.safetyScore >= 95
                              ? "text-emerald-500"
                              : d.safetyScore >= 80
                              ? "text-amber-500"
                              : "text-red-500"
                          }`}
                        >
                          {d.safetyScore.toFixed(1)}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                          d.status === "AVAILABLE"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : d.status === "ON_TRIP"
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            : d.status === "OFF_DUTY"
                            ? "bg-slate-200/40 text-slate-500 dark:bg-slate-800"
                            : "bg-red-500/10 text-red-600 dark:text-red-400"
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {canManage && (
                          <button
                            onClick={() => openEditModal(d)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(d.id, d.name)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredDrivers.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">
                    No drivers found matching search filters.
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
              Page {currentPage} of {totalPages} ({filteredDrivers.length} total entries)
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

      {/* Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedDriver ? "Edit Driver Profile" : "Register New Driver"}
        size="md"
      >
        <form onSubmit={handleSave} className="flex flex-col gap-4 text-xs font-medium">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 font-semibold uppercase tracking-wide">Driver Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Marcus Brody"
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 font-semibold uppercase tracking-wide">License Number</label>
              <input
                type="text"
                required
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                placeholder="DL-NY89231"
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 font-semibold uppercase tracking-wide">License Category</label>
              <select
                value={licenseCategory}
                onChange={(e) => setLicenseCategory(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
              >
                <option value="Class A CDL">Class A CDL (Heavy Combinations)</option>
                <option value="Class B CDL">Class B CDL (Single Heavy Trucks)</option>
                <option value="Class C CDL">Class C CDL (Light Delivery / Hazmat)</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 font-semibold uppercase tracking-wide font-mono">License Expiration Date</label>
              <input
                type="date"
                required
                value={licenseExpiry}
                onChange={(e) => setLicenseExpiry(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 font-semibold uppercase tracking-wide">Contact Phone</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 font-semibold uppercase tracking-wide">Safety Rating Score (0 - 100)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                required
                value={safetyScore}
                onChange={(e) => setSafetyScore(e.target.value)}
                placeholder="98.5"
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {selectedDriver && (
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 font-semibold uppercase tracking-wide">Duty Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
              >
                <option value="AVAILABLE">Available</option>
                <option value="ON_TRIP">On Trip</option>
                <option value="OFF_DUTY">Off Duty</option>
                <option value="SUSPENDED">Suspended</option>
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
              {isPending ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
