import React from "react";
import { getUsers } from "@/actions/users";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UsersClient } from "@/components/dashboard/UsersClient";

export default async function UsersPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  // Lock out Dispatchers and Drivers from accessing RBAC User panel
  if (!["ADMIN", "MANAGER"].includes(currentUser.role)) {
    redirect("/dashboard");
  }

  const users = await getUsers();

  return <UsersClient initialUsers={users} currentUser={currentUser} />;
}
