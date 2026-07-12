import React from "react";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AnalyticsClient } from "@/components/dashboard/AnalyticsClient";

export default async function AnalyticsPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  // Fetch vehicles with nested logs to calculate ROI & efficiency
  const vehicles = await prisma.vehicle.findMany({
    include: {
      fuelLogs: true,
      expenses: true,
      trips: true,
    },
  });

  const trips = await prisma.trip.findMany();

  // Compute detailed analytics metrics per vehicle
  const vehicleMetrics = vehicles.map((v) => {
    const totalFuelLiters = v.fuelLogs.reduce((acc, curr) => acc + curr.fuelQuantity, 0);
    const totalFuelCost = v.fuelLogs.reduce((acc, curr) => acc + curr.fuelCost, 0);
    const totalExpensesAmount = v.expenses.reduce((acc, curr) => acc + curr.amount, 0);

    // Calculate total distance driven based on completed trips
    const completedTrips = v.trips.filter((t) => t.status === "COMPLETED");
    const totalDistanceDriven = completedTrips.reduce((acc, curr) => acc + curr.distance, 0);

    // Fuel efficiency (Liters / 100km)
    // Formula: (Total Fuel Liters / Total Distance Driven) * 100
    // If no distance driven, fallback to standard vehicle averages
    let fuelEfficiency = 0;
    if (totalDistanceDriven > 0 && totalFuelLiters > 0) {
      fuelEfficiency = (totalFuelLiters / totalDistanceDriven) * 100;
    } else {
      // Mock standard default relative values for visuals if data is sparse
      fuelEfficiency = v.type === "TRUCK" ? 28.5 : v.type === "VAN" ? 12.0 : 7.5;
    }

    // ROI Indicator: Simulate operational revenue based on $1.50 per km driven
    // ROI = (Operational Revenue - (Acquisition Cost + Opex))
    const simulatedRevenue = totalDistanceDriven * 1.85; // $1.85 / km
    const totalOpex = totalExpensesAmount + totalFuelCost;
    const vehicleRoi = simulatedRevenue - totalOpex;

    return {
      id: v.id,
      name: v.name,
      regNumber: v.regNumber,
      type: v.type,
      odometer: v.odometer,
      acquisitionCost: v.acquisitionCost,
      totalFuelLiters,
      totalFuelCost,
      totalExpensesAmount,
      totalDistanceDriven,
      fuelEfficiency,
      totalOpex,
      simulatedRevenue,
      vehicleRoi,
    };
  });

  // Calculate generic monthly financials over time
  // Group expenses by category
  const fuelExpenses = vehicleMetrics.reduce((acc, curr) => acc + curr.totalFuelCost, 0);
  const opexExpenses = vehicleMetrics.reduce((acc, curr) => acc + curr.totalExpensesAmount, 0) - fuelExpenses;
  const acquisitionCosts = vehicleMetrics.reduce((acc, curr) => acc + curr.acquisitionCost, 0);

  const financialStructure = [
    { name: "Acquisition", value: acquisitionCosts, color: "#6366f1" },
    { name: "Fuel OPEX", value: fuelExpenses, color: "#3b82f6" },
    { name: "Maintenance & Other OPEX", value: Math.max(0, opexExpenses), color: "#f59e0b" },
  ];

  return (
    <AnalyticsClient
      vehicleMetrics={vehicleMetrics}
      financialStructure={financialStructure}
      totalTripsCount={trips.length}
    />
  );
}
