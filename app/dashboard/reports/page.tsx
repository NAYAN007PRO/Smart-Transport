import React from "react";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReportsClient } from "@/components/dashboard/ReportsClient";

export default async function ReportsPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  // Fetch full data catalogs
  const [vehicles, drivers, trips, expenses, fuelLogs] = await Promise.all([
    prisma.vehicle.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.driver.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.trip.findMany({
      include: { vehicle: true, driver: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.expense.findMany({
      include: { vehicle: true, trip: true },
      orderBy: { date: "desc" },
    }),
    prisma.fuelLog.findMany({
      include: { vehicle: true },
      orderBy: { date: "desc" },
    }),
  ]);

  return (
    <ReportsClient
      vehicles={vehicles}
      drivers={drivers}
      trips={trips.map((t) => ({
        id: t.id,
        source: t.source,
        destination: t.destination,
        cargoWeight: t.cargoWeight,
        distance: t.distance,
        status: t.status,
        vehicleReg: t.vehicle.regNumber,
        driverName: t.driver.name,
        createdAt: t.createdAt,
      }))}
      expenses={expenses.map((e) => ({
        id: e.id,
        vehicleReg: e.vehicle.regNumber,
        tripDestination: e.trip ? e.trip.destination : "N/A",
        amount: e.amount,
        category: e.category,
        description: e.description,
        date: e.date,
      }))}
      fuelLogs={fuelLogs.map((f) => ({
        id: f.id,
        vehicleReg: f.vehicle.regNumber,
        fuelQuantity: f.fuelQuantity,
        fuelCost: f.fuelCost,
        odometerReading: f.odometerReading,
        date: f.date,
      }))}
    />
  );
}
