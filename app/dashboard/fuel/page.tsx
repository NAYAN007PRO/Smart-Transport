import React from "react";
import { getFuelLogs } from "@/actions/financials";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { FuelClient } from "@/components/dashboard/FuelClient";

export default async function FuelPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  const fuelLogs = await getFuelLogs();

  // Load vehicles and trips to associate with logs
  const vehicles = await prisma.vehicle.findMany({
    where: { NOT: { status: "RETIRED" } },
  });

  const activeTrips = await prisma.trip.findMany({
    where: { status: "DISPATCHED" },
    include: { vehicle: true, driver: true },
  });

  return (
    <FuelClient
      initialFuelLogs={fuelLogs}
      vehicles={vehicles}
      activeTrips={activeTrips}
      userRole={currentUser.role}
    />
  );
}
