import React from "react";
import { getMaintenanceLogs } from "@/actions/maintenance";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MaintenanceClient } from "@/components/dashboard/MaintenanceClient";

export default async function MaintenancePage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  const logs = await getMaintenanceLogs();

  // Load all vehicles to select for maintenance
  const vehicles = await prisma.vehicle.findMany({
    where: {
      NOT: { status: "RETIRED" },
    },
  });

  return (
    <MaintenanceClient
      initialLogs={logs}
      vehicles={vehicles}
      userRole={currentUser.role}
    />
  );
}
