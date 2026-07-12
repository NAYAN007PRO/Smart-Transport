import React from "react";
import { getTrips } from "@/actions/trips";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TripsClient } from "@/components/dashboard/TripsClient";

export default async function TripsPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  const trips = await getTrips();

  // Load available vehicles for the dispatch wizard dropdown
  const availableVehicles = await prisma.vehicle.findMany({
    where: {
      status: "AVAILABLE",
    },
  });

  // Load available drivers with valid licenses
  const now = new Date();
  const availableDrivers = await prisma.driver.findMany({
    where: {
      status: "AVAILABLE",
      licenseExpiry: {
        gt: now, // License must not be expired
      },
    },
  });

  return (
    <TripsClient
      initialTrips={trips}
      availableVehicles={availableVehicles}
      availableDrivers={availableDrivers}
      userRole={currentUser.role}
    />
  );
}
