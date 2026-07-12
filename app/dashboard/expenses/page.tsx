import React from "react";
import { getExpenses } from "@/actions/financials";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ExpensesClient } from "@/components/dashboard/ExpensesClient";

export default async function ExpensesPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  const expenses = await getExpenses();

  // Load vehicles and trips to associate with expenses
  const vehicles = await prisma.vehicle.findMany({
    where: { NOT: { status: "RETIRED" } },
  });

  const trips = await prisma.trip.findMany({
    orderBy: { createdAt: "desc" },
    include: { vehicle: true, driver: true },
  });

  return (
    <ExpensesClient
      initialExpenses={expenses}
      vehicles={vehicles}
      trips={trips}
      userRole={currentUser.role}
    />
  );
}
