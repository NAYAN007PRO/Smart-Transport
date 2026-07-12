"use client";

import React, { useState, useTransition } from "react";
import { Plus, UserCheck, Shield, Mail, Key, Edit2, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { upsertUser, deleteUser } from "@/actions/users";

interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "DISPATCHER" | "MANAGER" | "DRIVER";
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  createdAt: string;
}

interface UsersClientProps {
  initialUsers: any[];
  currentUser: {
    userId: string;
    role: string;
  };
}

export function UsersClient({ initialUsers, currentUser }: UsersClientProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [users, setUsers] = useState<User[]>(initialUsers as User[]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<any>("DISPATCHER");
  const [status, setStatus] = useState<any>("ACTIVE");

  const openAddModal = () => {
    setSelectedUser(null);
    setName("");
    setEmail("");
    setPassword("");
    setRole("DISPATCHER");
    setStatus("ACTIVE");
    setIsFormOpen(true);
  };

  const openEditModal = (u: User) => {
    setSelectedUser(u);
    setName(u.name);
    setEmail(u.email);
    setPassword("");
    setRole(u.role);
    setStatus(u.status);
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email) {
      toast("Name and email are required.", "warning");
      return;
    }

    if (!selectedUser && !password) {
      toast("Password is required for new users.", "warning");
      return;
    }

    const payload = {
      id: selectedUser?.id,
      name,
      email,
      password,
      role,
      status,
    };

    startTransition(async () => {
      const res = await upsertUser(payload);
      if (res.error) {
        toast(res.error, "error");
      } else {
        toast(`User account successfully ${selectedUser ? "updated" : "created"}!`, "success");
        setIsFormOpen(false);
        // Refresh page to load updated database states
        window.location.reload();
      }
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (id === currentUser.userId) {
      toast("You cannot delete your own account.", "error");
      return;
    }

    if (!window.confirm(`Are you sure you want to permanently delete user account: ${name}?`)) return;

    startTransition(async () => {
      const res = await deleteUser(id);
      if (res.error) {
        toast(res.error, "error");
      } else {
        toast("User account permanently deleted.", "success");
        setUsers((prev) => prev.filter((u) => u.id !== id));
      }
    });
  };

  const isAdmin = currentUser.role === "ADMIN";

  const getRoleBadgeStyle = (r: string) => {
    switch (r) {
      case "ADMIN":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
      case "MANAGER":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "DISPATCHER":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      default:
        return "bg-slate-100 text-slate-650 dark:bg-slate-800 border-slate-700/20";
    }
  };

  const getStatusBadgeStyle = (s: string) => {
    switch (s) {
      case "ACTIVE":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
      case "INACTIVE":
        return "bg-slate-100 text-slate-500 dark:bg-slate-800";
      default:
        return "bg-red-500/10 text-red-600 dark:text-red-400 animate-pulse";
    }
  };

  return (
    <div className="flex flex-col gap-6 text-slate-900 dark:text-slate-100 w-full">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Platform Users & RBAC</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage corporate dispatcher login accounts, configure database access scopes, and adjust credentials.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm hover:shadow active:scale-95 transition-all self-start sm:self-auto"
          >
            <Plus className="h-4.5 w-4.5" />
            Add User
          </button>
        )}
      </div>

      {/* Users table */}
      <div className="border border-slate-200/80 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 text-slate-400 font-bold uppercase">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">System Role Scope</th>
                <th className="p-4">Status</th>
                <th className="p-4">Account Created</th>
                {isAdmin && <th className="p-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/20 dark:hover:bg-slate-900/10 font-medium"
                >
                  <td className="p-4 font-bold text-slate-800 dark:text-slate-100">{u.name}</td>
                  <td className="p-4 text-slate-500 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    {u.email}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded border text-[9px] font-bold tracking-wider ${getRoleBadgeStyle(
                        u.role
                      )}`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold ${getStatusBadgeStyle(
                        u.status
                      )}`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  {isAdmin && (
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        {u.id !== currentUser.userId && (
                          <button
                            onClick={() => handleDelete(u.id, u.name)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedUser ? "Modify User Account & Scope" : "Register Platform User"}
        size="md"
      >
        <form onSubmit={handleSave} className="flex flex-col gap-4 text-xs font-medium">
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400 font-semibold uppercase tracking-wide">Full Name</label>
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
            <label className="text-slate-400 font-semibold uppercase tracking-wide">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@transitops.com"
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400 font-semibold uppercase tracking-wide">
              Password {selectedUser && "(Leave blank to keep unchanged)"}
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required={!selectedUser}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={selectedUser ? "••••••••" : "At least 6 characters"}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 font-semibold uppercase tracking-wide">Access Role Scope</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
              >
                <option value="DISPATCHER">Dispatcher (Standard Access)</option>
                <option value="MANAGER">Fleet Manager (Intermediate Access)</option>
                <option value="ADMIN">System Administrator (Full Access)</option>
                <option value="DRIVER">Driver (Telemetry Access Only)</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 font-semibold uppercase tracking-wide">Account Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>

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
              {isPending ? "Saving..." : "Save Account"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
