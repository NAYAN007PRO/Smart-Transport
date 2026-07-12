import React from "react";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  // Fetch dashboard stats from DB
  const [
    vehicles,
    drivers,
    trips,
    fuelAgg,
    expenseAgg,
    expensesByCategory,
    recentTrips,
    maintenanceAlerts,
    recentNotifications,
    recentActivities,
  ] = await Promise.all([
    // Vehicles
    prisma.vehicle.findMany(),
    // Drivers
    prisma.driver.findMany(),
    // Trips
    prisma.trip.findMany({
      include: { vehicle: true, driver: true },
      orderBy: { createdAt: "desc" },
    }),
    // Fuel logs sum
    prisma.fuelLog.aggregate({
      _sum: { fuelQuantity: true, fuelCost: true },
    }),
    // Expenses sum
    prisma.expense.aggregate({
      _sum: { amount: true },
    }),
    // Expenses by Category
    prisma.expense.groupBy({
      by: ["category"],
      _sum: { amount: true },
    }),
    // Recent Trips
    prisma.trip.findMany({
      take: 5,
      include: { vehicle: true, driver: true },
      orderBy: { createdAt: "desc" },
    }),
    // Open maintenance logs
    prisma.maintenanceLog.findMany({
      where: { status: "OPEN" },
      include: { vehicle: true },
      take: 5,
    }),
    // Unread notifications
    prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    // Audit Activity Logs
    prisma.activityLog.findMany({
      take: 8,
      include: { user: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Compute stats
  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter((v) => v.status === "ON_TRIP").length;
  const availableVehicles = vehicles.filter((v) => v.status === "AVAILABLE").length;
  const inShopVehicles = vehicles.filter((v) => v.status === "IN_SHOP").length;
  const retiredVehicles = vehicles.filter((v) => v.status === "RETIRED").length;

  const totalDrivers = drivers.length;
  const activeDrivers = drivers.filter((d) => d.status === "ON_TRIP").length;
  const availableDrivers = drivers.filter((d) => d.status === "AVAILABLE").length;
  const suspendedDrivers = drivers.filter((d) => d.status === "SUSPENDED").length;

  const activeTripsCount = trips.filter((t) => t.status === "DISPATCHED").length;
  const pendingTripsCount = trips.filter((t) => t.status === "DRAFT").length;
  const completedTripsCount = trips.filter((t) => t.status === "COMPLETED").length;

  const totalFuelLiters = fuelAgg._sum.fuelQuantity || 0;
  const totalFuelCost = fuelAgg._sum.fuelCost || 0;
  const totalExpensesCost = expenseAgg._sum.amount || 0;

  // Fleet utilization percentage: Active Vehicles / (Total Active-capable Vehicles)
  const utilizableCount = totalVehicles - retiredVehicles;
  const fleetUtilization = utilizableCount > 0 ? (activeVehicles / utilizableCount) * 100 : 0;

  // Safety Score average
  const driversWithScores = drivers.filter((d) => d.safetyScore > 0);
  const avgSafetyScore =
    driversWithScores.length > 0
      ? driversWithScores.reduce((acc, curr) => acc + curr.safetyScore, 0) / driversWithScores.length
      : 100;

  // Upcoming License Expirations (within 60 days or already expired)
  const sixtyDaysFromNow = new Date();
  sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);

  const expiringDrivers = drivers
    .filter((d) => new Date(d.licenseExpiry) < sixtyDaysFromNow)
    .map((d) => ({
      id: d.id,
      name: d.name,
      expiryDate: d.licenseExpiry,
      isExpired: new Date(d.licenseExpiry) < new Date(),
    }));

  const dataProps = {
    userRole: currentUser.role,
    userName: currentUser.name,
    kpis: {
      activeVehicles,
      availableVehicles,
      inShopVehicles,
      retiredVehicles,
      totalVehicles,
      activeDrivers,
      availableDrivers,
      suspendedDrivers,
      totalDrivers,
      activeTripsCount,
      pendingTripsCount,
      completedTripsCount,
      fleetUtilization,
      totalFuelLiters,
      totalFuelCost,
      totalExpensesCost,
      avgSafetyScore,
    },
    expensesByCategory: expensesByCategory.map((e) => ({
      category: e.category,
      amount: e._sum.amount || 0,
    })),
    recentTrips,
    maintenanceAlerts,
    expiringDrivers,
    notifications: recentNotifications,
    activities: recentActivities.map((a) => ({
      id: a.id,
      userName: a.user?.name || "System",
      action: a.action,
      details: a.details,
      createdAt: a.createdAt,
    })),
  };

  return <DashboardOverview {...dataProps} />;
}
