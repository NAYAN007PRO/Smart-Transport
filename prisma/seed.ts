import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";
import bcrypt from "bcryptjs";

const dbPath = path.join(process.cwd(), "prisma", "dev.db");
const adapter = new PrismaBetterSqlite3({
  url: `file:${dbPath}`,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting database seeding...");

  // 1. Clear database
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.vehicleDocument.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.fuelLog.deleteMany();
  await prisma.maintenanceLog.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();

  console.log("Database cleared.");

  // 2. Seed Users
  const salt = bcrypt.genSaltSync(10);
  const adminPassword = bcrypt.hashSync("admin123", salt);
  const dispatcherPassword = bcrypt.hashSync("dispatch123", salt);
  const managerPassword = bcrypt.hashSync("manager123", salt);
  const driverPassword = bcrypt.hashSync("driver123", salt);

  const admin = await prisma.user.create({
    data: {
      name: "Alex Carter",
      email: "admin@transitops.com",
      passwordHash: adminPassword,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  const dispatcher = await prisma.user.create({
    data: {
      name: "Marcus Brody",
      email: "dispatcher@transitops.com",
      passwordHash: dispatcherPassword,
      role: "DISPATCHER",
      status: "ACTIVE",
    },
  });

  const manager = await prisma.user.create({
    data: {
      name: "Sarah Jenkins",
      email: "manager@transitops.com",
      passwordHash: managerPassword,
      role: "MANAGER",
      status: "ACTIVE",
    },
  });

  const driverUser = await prisma.user.create({
    data: {
      name: "John Doe",
      email: "driver@transitops.com",
      passwordHash: driverPassword,
      role: "DRIVER",
      status: "ACTIVE",
    },
  });

  console.log("Users seeded.");

  // 3. Seed Vehicles
  const v1 = await prisma.vehicle.create({
    data: {
      name: "Volvo FH16 Globetrotter",
      regNumber: "NY-V123-FH",
      model: "2024 Heavy Duty",
      type: "TRUCK",
      loadCapacity: 25000, // 25 tons
      odometer: 120500,
      acquisitionCost: 145000,
      status: "AVAILABLE",
    },
  });

  const v2 = await prisma.vehicle.create({
    data: {
      name: "Scania R500 V8",
      regNumber: "CA-S456-R",
      model: "2023 Long Haul",
      type: "TRUCK",
      loadCapacity: 24000, // 24 tons
      odometer: 85200,
      acquisitionCost: 138000,
      status: "ON_TRIP",
    },
  });

  const v3 = await prisma.vehicle.create({
    data: {
      name: "Mercedes-Benz Sprinter 519",
      regNumber: "TX-M789-SP",
      model: "2022 Cargo Van",
      type: "VAN",
      loadCapacity: 3500, // 3.5 tons
      odometer: 45600,
      acquisitionCost: 65000,
      status: "IN_SHOP",
    },
  });

  const v4 = await prisma.vehicle.create({
    data: {
      name: "Ford Transit High Roof",
      regNumber: "FL-F234-TR",
      model: "2023 Delivery Van",
      type: "VAN",
      loadCapacity: 3000,
      odometer: 98100,
      acquisitionCost: 58000,
      status: "AVAILABLE",
    },
  });

  const v5 = await prisma.vehicle.create({
    data: {
      name: "Isuzu FTR Medium Duty",
      regNumber: "IL-I567-FT",
      model: "2018 Urban Truck",
      type: "TRUCK",
      loadCapacity: 15000,
      odometer: 215400,
      acquisitionCost: 85000,
      status: "RETIRED",
    },
  });

  console.log("Vehicles seeded.");

  // 4. Seed Drivers
  const d1 = await prisma.driver.create({
    data: {
      name: "John Doe",
      licenseNumber: "DL-NY89231",
      licenseCategory: "Class A CDL",
      licenseExpiry: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 2), // 2 years expiry
      phone: "+1 (555) 123-4567",
      safetyScore: 95.8,
      status: "AVAILABLE",
    },
  });

  const d2 = await prisma.driver.create({
    data: {
      name: "Jane Smith",
      licenseNumber: "DL-CA47382",
      licenseCategory: "Class A CDL",
      licenseExpiry: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365), // 1 year expiry
      phone: "+1 (555) 987-6543",
      safetyScore: 98.4,
      status: "ON_TRIP",
    },
  });

  const d3 = await prisma.driver.create({
    data: {
      name: "Robert Johnson",
      licenseNumber: "DL-TX12948",
      licenseCategory: "Class B CDL",
      licenseExpiry: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180), // 6 months expiry
      phone: "+1 (555) 456-7890",
      safetyScore: 89.0,
      status: "AVAILABLE",
    },
  });

  // Drivers for validations
  const d4 = await prisma.driver.create({
    data: {
      name: "Michael Brown (Expired License)",
      licenseNumber: "DL-FL58392",
      licenseCategory: "Class B CDL",
      licenseExpiry: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 30 days expired
      phone: "+1 (555) 234-5678",
      safetyScore: 91.2,
      status: "OFF_DUTY",
    },
  });

  const d5 = await prisma.driver.create({
    data: {
      name: "William Davis (Suspended)",
      licenseNumber: "DL-IL93821",
      licenseCategory: "Class A CDL",
      licenseExpiry: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 3), // 3 years expiry
      phone: "+1 (555) 345-6789",
      safetyScore: 62.5,
      status: "SUSPENDED",
    },
  });

  console.log("Drivers seeded.");

  // 5. Seed Trips
  // Completed Trip
  const trip1 = await prisma.trip.create({
    data: {
      source: "New York Port, NY",
      destination: "Logan Logistics Park, Boston, MA",
      cargoWeight: 18500,
      distance: 350.5,
      status: "COMPLETED",
      vehicleId: v1.id,
      driverId: d1.id,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
    },
  });

  // Active Trip
  const trip2 = await prisma.trip.create({
    data: {
      source: "LA Depot, Los Angeles, CA",
      destination: "SFO Transit Center, San Francisco, CA",
      cargoWeight: 14000,
      distance: 615.2,
      status: "DISPATCHED",
      vehicleId: v2.id,
      driverId: d2.id,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
    },
  });

  // Draft Trip
  const trip3 = await prisma.trip.create({
    data: {
      source: "Miami Hub, FL",
      destination: "Atlanta Depot, GA",
      cargoWeight: 2800,
      distance: 1060.0,
      status: "DRAFT",
      vehicleId: v4.id,
      driverId: d3.id,
    },
  });

  console.log("Trips seeded.");

  // 6. Fuel Logs
  const f1 = await prisma.fuelLog.create({
    data: {
      vehicleId: v1.id,
      tripId: trip1.id,
      fuelQuantity: 116.8, // 30L/100km avg
      fuelCost: 152.5,
      odometerReading: 120150,
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    },
  });

  const f2 = await prisma.fuelLog.create({
    data: {
      vehicleId: v2.id,
      tripId: trip2.id,
      fuelQuantity: 195.0,
      fuelCost: 260.0,
      odometerReading: 84900,
      date: new Date(Date.now() - 1000 * 60 * 60 * 10),
    },
  });

  console.log("Fuel Logs seeded.");

  // 7. Expenses
  await prisma.expense.create({
    data: {
      vehicleId: v1.id,
      tripId: trip1.id,
      amount: 152.5,
      category: "FUEL",
      description: "Refuel at Shell Station",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    },
  });

  await prisma.expense.create({
    data: {
      vehicleId: v1.id,
      tripId: trip1.id,
      amount: 45.0,
      category: "TOLL",
      description: "I-95 Highway Tolls",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    },
  });

  await prisma.expense.create({
    data: {
      vehicleId: v2.id,
      tripId: trip2.id,
      amount: 260.0,
      category: "FUEL",
      description: "Refuel Chevron LA",
      date: new Date(Date.now() - 1000 * 60 * 60 * 10),
    },
  });

  await prisma.expense.create({
    data: {
      vehicleId: v3.id,
      amount: 1200.0,
      category: "MAINTENANCE",
      description: "Engine diagnosis & brake pad replacement",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    },
  });

  await prisma.expense.create({
    data: {
      vehicleId: v1.id,
      amount: 850.0,
      category: "INSURANCE",
      description: "Quarterly fleet insurance payment",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
    },
  });

  console.log("Expenses seeded.");

  // 8. Maintenance Logs
  await prisma.maintenanceLog.create({
    data: {
      vehicleId: v1.id,
      description: "Periodic 120k Oil Change and Filter Replacement",
      cost: 150.0,
      openedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
      closedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9),
      status: "CLOSED",
      notes: "All filters replaced. Engine performance clean.",
    },
  });

  await prisma.maintenanceLog.create({
    data: {
      vehicleId: v3.id,
      description: "Engine misfire diagnosis and transmission fluid change",
      cost: 1200.0,
      openedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      status: "OPEN",
      notes: "Waiting on replacement sparks plugs from supplier.",
    },
  });

  console.log("Maintenance logs seeded.");

  // 9. Documents
  await prisma.vehicleDocument.create({
    data: {
      vehicleId: v1.id,
      name: "NY Registration Certificate",
      documentType: "REGISTRATION",
      filePath: "/uploads/NY-V123-FH-reg.pdf",
      expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 120), // 4 months
    },
  });

  await prisma.vehicleDocument.create({
    data: {
      vehicleId: v1.id,
      name: "Commercial Liability Insurance",
      documentType: "INSURANCE",
      filePath: "/uploads/NY-V123-FH-ins.pdf",
      expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 270), // 9 months
    },
  });

  console.log("Documents seeded.");

  // 10. Notifications & Activity Logs
  await prisma.notification.create({
    data: {
      message: "Driver Michael Brown's commercial driving license has expired.",
      type: "DANGER",
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      message: "Predictive maintenance trigger: Scania R500 (CA-S456-R) is approaching scheduled belt replacement in 1,200 km.",
      type: "WARNING",
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      message: "Trip #2 has been successfully dispatched to driver Jane Smith.",
      type: "SUCCESS",
      isRead: true,
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: admin.id,
      action: "DATABASE_SEED",
      details: "Database populated with initial development dataset.",
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: dispatcher.id,
      action: "TRIP_DISPATCH",
      details: `Dispatched Trip from LA to SF with Vehicle ${v2.regNumber} and Driver ${d2.name}`,
    },
  });

  console.log("Notifications & Activity logs seeded.");
  console.log("Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
