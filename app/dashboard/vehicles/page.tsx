import React from "react";
import { getVehicles } from "@/actions/vehicles";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { VehiclesClient } from "@/components/dashboard/VehiclesClient";

export default async function VehiclesPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  const vehicles = await getVehicles();

  return <VehiclesClient initialVehicles={vehicles} userRole={currentUser.role} />;
}
