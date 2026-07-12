import React from "react";
import { getDrivers } from "@/actions/drivers";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DriversClient } from "@/components/dashboard/DriversClient";

export default async function DriversPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  const drivers = await getDrivers();

  return <DriversClient initialDrivers={drivers} userRole={currentUser.role} />;
}
