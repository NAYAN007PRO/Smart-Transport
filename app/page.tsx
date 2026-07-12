"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Truck,
  Shield,
  Gauge,
  Calendar,
  DollarSign,
  TrendingUp,
  MapPin,
  CheckCircle,
  ArrowRight,
  Menu,
  X,
  Zap,
  Globe,
  Database
} from "lucide-react";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
  } as const;

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-900 text-slate-100 selection:bg-blue-500 selection:text-white">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 h-[600px] w-[600px] translate-x-1/2 rounded-full bg-indigo-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      {/* Navigation Bar */}
      <nav className="sticky top-0 z-40 w-full glass-nav backdrop-blur-md bg-slate-950/80 border-b border-slate-800/60 px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-500/30">
              <Truck className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Transit<span className="text-blue-500">Ops</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Features</a>
            <a href="#benefits" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Benefits</a>
            <a href="#pricing" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Pricing</a>
            <a href="#testimonials" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Testimonials</a>
          </div>

          <div className="hidden items-center gap-4 md:flex">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/login?signup=true"
              className="flex items-center gap-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 hover:shadow-blue-500/30 active:scale-95 transition-all"
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white md:hidden transition-colors"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 w-full border-b border-slate-800 bg-slate-950 px-6 py-6 md:hidden">
            <div className="flex flex-col gap-5">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-slate-300 hover:text-white"
              >
                Features
              </a>
              <a
                href="#benefits"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-slate-300 hover:text-white"
              >
                Benefits
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-slate-300 hover:text-white"
              >
                Pricing
              </a>
              <a
                href="#testimonials"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-slate-300 hover:text-white"
              >
                Testimonials
              </a>
              <hr className="border-slate-800" />
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center text-base font-medium text-slate-300 hover:text-white"
              >
                Sign In
              </Link>
              <Link
                href="/login?signup=true"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-base font-semibold text-white"
              >
                Start Free Trial
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-6 pt-20 pb-24 text-center lg:pt-32">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm font-semibold text-blue-400">
            <Zap className="h-4 w-4 fill-blue-400" />
            Enterprise Fleet Management Reimagined
          </div>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-6xl leading-[1.15]">
            Digitize & Automate Your{" "}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
              Transport Operations
            </span>
          </h1>
          <p className="mt-6 text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
            TransitOps is a centralized fleet intelligence platform that enforces compliance, optimizes dispatches, reduces fuel waste, and tracks asset performance.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 hover:shadow-blue-500/30 active:scale-95 transition-all"
            >
              Access Platform Dashboard
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#features"
              className="rounded-xl border border-slate-700 bg-slate-800/40 px-6 py-3.5 text-base font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              Explore Features
            </a>
          </div>
        </motion.div>

        {/* Dashboard Graphic */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mt-16 sm:mt-20 mx-auto max-w-5xl rounded-2xl border border-slate-800 bg-slate-950 p-3 shadow-2xl relative"
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 opacity-30 pointer-events-none" />
          <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-900 aspect-[16/9] flex items-center justify-center p-6 relative">
            {/* Visual SaaS Mock */}
            <div className="w-full h-full flex flex-col gap-6 text-left">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div className="flex gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                </div>
                <div className="h-5 w-40 rounded bg-slate-800" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="h-24 rounded-xl bg-slate-950/60 border border-slate-800 p-4 flex flex-col justify-between">
                  <span className="text-xs text-slate-500">ACTIVE FLEET UTILIZATION</span>
                  <span className="text-2xl font-bold text-blue-400">89.4%</span>
                </div>
                <div className="h-24 rounded-xl bg-slate-950/60 border border-slate-800 p-4 flex flex-col justify-between">
                  <span className="text-xs text-slate-500">OPERATIONAL EFFICIENCY</span>
                  <span className="text-2xl font-bold text-emerald-400">96.8%</span>
                </div>
                <div className="h-24 rounded-xl bg-slate-950/60 border border-slate-800 p-4 flex flex-col justify-between">
                  <span className="text-xs text-slate-500">FUEL SAVED (MONTH)</span>
                  <span className="text-2xl font-bold text-indigo-400">+14,250L</span>
                </div>
              </div>
              <div className="flex-1 rounded-xl bg-slate-950/60 border border-slate-800 p-4 flex items-center justify-center">
                <div className="flex flex-col items-center text-center gap-2">
                  <Gauge className="h-10 w-10 text-slate-600 animate-pulse" />
                  <span className="text-xs text-slate-500">Interactive live dispatch dashboard maps, telemetry widgets, and real-time alerts.</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-slate-950 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              All-In-One Operations Dashboard
            </h2>
            <p className="mt-4 text-slate-400">
              Powerful tools designed to manage logistics friction points, enforce rules, and automate workflows.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            {/* Card 1 */}
            <motion.div variants={itemVariants} className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/50 p-8 hover:border-slate-700 transition-all hover:-translate-y-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/20 text-blue-500">
                <Truck className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-lg font-bold text-white">Smart Vehicle Management</h3>
              <p className="mt-2 flex-1 text-sm text-slate-400 leading-relaxed">
                Log odometer readings, acquisition logs, load capacities, status trackers, and manage maintenance logs seamlessly.
              </p>
            </motion.div>

            {/* Card 2 */}
            <motion.div variants={itemVariants} className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/50 p-8 hover:border-slate-700 transition-all hover:-translate-y-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-500">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-lg font-bold text-white">Compliant Driver Registry</h3>
              <p className="mt-2 flex-1 text-sm text-slate-400 leading-relaxed">
                Monitor safety scores, phone details, status, and enforce strict license expiration checks preventing illegal dispatches.
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div variants={itemVariants} className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/50 p-8 hover:border-slate-700 transition-all hover:-translate-y-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600/20 text-emerald-500">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-lg font-bold text-white">Dispatch Trip Wizard</h3>
              <p className="mt-2 flex-1 text-sm text-slate-400 leading-relaxed">
                Enforce automatic state transitions: vehicle/driver status toggles to ON_TRIP on dispatch, and RESTORES to AVAILABLE on completion.
              </p>
            </motion.div>

            {/* Card 4 */}
            <motion.div variants={itemVariants} className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/50 p-8 hover:border-slate-700 transition-all hover:-translate-y-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-600/20 text-amber-500">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-lg font-bold text-white">Preventative Maintenance</h3>
              <p className="mt-2 flex-1 text-sm text-slate-400 leading-relaxed">
                Set vehicles to In Shop, record workshop notes, track maintenance bills, and automatically log maintenance expenses.
              </p>
            </motion.div>

            {/* Card 5 */}
            <motion.div variants={itemVariants} className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/50 p-8 hover:border-slate-700 transition-all hover:-translate-y-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-600/20 text-red-500">
                <DollarSign className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-lg font-bold text-white">Fuel & Expense Audits</h3>
              <p className="mt-2 flex-1 text-sm text-slate-400 leading-relaxed">
                Record refuels, auto-compute fuel efficiency, log highway toll expenses, insurance fees, and audit total fleet cash flows.
              </p>
            </motion.div>

            {/* Card 6 */}
            <motion.div variants={itemVariants} className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/50 p-8 hover:border-slate-700 transition-all hover:-translate-y-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600/20 text-purple-500">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-lg font-bold text-white">Fleet ROI Analytics</h3>
              <p className="mt-2 flex-1 text-sm text-slate-400 leading-relaxed">
                Visualize total utilization percentages, analyze monthly operational costs, driver score logs, and generate CSV reports.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Enforcing Business Rules, Mitigating Operational Risk
              </h2>
              <p className="mt-6 text-slate-300 leading-relaxed">
                TransitOps prevents expensive mistakes at dispatch by running automated server-side guards. Ensure your cargo always goes out with valid vehicles and safe drivers.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-white">Prevent Expired Dispatch</h4>
                    <p className="text-sm text-slate-400 mt-0.5">Locks drivers with expired commercial licenses from trip assignments.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-white">Verify Vehicle Health</h4>
                    <p className="text-sm text-slate-400 mt-0.5">Flags and blocks vehicles marked as Retired or currently In Shop from being routed.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-white">Guard Cargo Weight Capacity</h4>
                    <p className="text-sm text-slate-400 mt-0.5">Mathematically prevents dispatching load weight that exceeds the vehicle's safe load capacity.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
              <h4 className="text-sm font-semibold tracking-wide text-blue-500 uppercase">Operational Insights</h4>
              <div className="mt-6 space-y-6">
                <div>
                  <div className="flex justify-between text-sm text-slate-400 font-medium">
                    <span>Average Safety Score</span>
                    <span className="text-white">94.8%</span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full w-[94.8%] bg-blue-500 rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm text-slate-400 font-medium">
                    <span>Active Vehicle Utilization</span>
                    <span className="text-white">82.3%</span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full w-[82.3%] bg-emerald-500 rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm text-slate-400 font-medium">
                    <span>Budget Maintenance Compliance</span>
                    <span className="text-white">98.1%</span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full w-[98.1%] bg-indigo-500 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-slate-950 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Transparent Fleet Plans</h2>
            <p className="mt-4 text-slate-400">Scale the platform to fit your operations, whether you have 5 vans or 500 trucks.</p>
          </div>

          <div className="mx-auto mt-16 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {/* Starter */}
            <div className="flex flex-col rounded-3xl border border-slate-800 bg-slate-900/40 p-8">
              <h3 className="text-lg font-semibold text-white">Starter</h3>
              <p className="mt-4 text-sm text-slate-400">Perfect for localized delivery operations.</p>
              <p className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">$149</span>
                <span className="text-sm font-semibold text-slate-400">/month</span>
              </p>
              <ul className="mt-8 space-y-3 text-sm text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> Up to 10 Vehicles</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> Up to 15 Drivers</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> Core Dispatch Wizard</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> Basic Fuel & Expense Logs</li>
              </ul>
              <Link href="/login?signup=true" className="mt-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-center py-2.5 text-sm font-semibold text-white transition-colors">Start Trial</Link>
            </div>

            {/* Pro */}
            <div className="flex flex-col rounded-3xl border-2 border-blue-500 bg-slate-900 p-8 relative shadow-xl shadow-blue-500/5">
              <div className="absolute top-0 right-8 -translate-y-1/2 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white uppercase tracking-wider">Most Popular</div>
              <h3 className="text-lg font-semibold text-white">Professional</h3>
              <p className="mt-4 text-sm text-slate-400">Enterprise operational suite for mid-size carriers.</p>
              <p className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">$399</span>
                <span className="text-sm font-semibold text-slate-400">/month</span>
              </p>
              <ul className="mt-8 space-y-3 text-sm text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> Up to 75 Vehicles</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> Up to 100 Drivers</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> Business Rules Automation</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> Advanced Expense & ROI Analytics</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> CSV/PDF Data Exports</li>
              </ul>
              <Link href="/login?signup=true" className="mt-8 rounded-xl bg-blue-600 hover:bg-blue-500 text-center py-2.5 text-sm font-semibold text-white transition-colors">Start Trial</Link>
            </div>

            {/* Enterprise */}
            <div className="flex flex-col rounded-3xl border border-slate-800 bg-slate-900/40 p-8">
              <h3 className="text-lg font-semibold text-white">Enterprise</h3>
              <p className="mt-4 text-sm text-slate-400">Custom logistics configurations for major fleets.</p>
              <p className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">Custom</span>
              </p>
              <ul className="mt-8 space-y-3 text-sm text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> Unlimited Vehicles & Drivers</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> Dedicated Account Manager</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> AI Fleet Assistant API</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> Custom System Integrations</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> 99.9% Uptime SLA</li>
              </ul>
              <Link href="mailto:sales@transitops.com" className="mt-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-center py-2.5 text-sm font-semibold text-white transition-colors">Contact Sales</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Trusted by Logistics Leaders</h2>
          </div>

          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-8">
              <p className="text-slate-300">
                "Implementing TransitOps completely resolved our dispatch compliance issues. The license expiry blocker alone has saved us thousands in potential compliance fines."
              </p>
              <h4 className="mt-6 font-bold text-white">George Sterling</h4>
              <p className="text-xs text-slate-400">VP of Logistics, Sterling Carrier Corp</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-8">
              <p className="text-slate-300">
                "Our fuel logging is now entirely audited. The system automatically computes vehicle ROI, showing which trucks are draining our margin. Absolute game changer."
              </p>
              <h4 className="mt-6 font-bold text-white">Elena Vance</h4>
              <p className="text-xs text-slate-400">Director of Operations, SwiftFlow Logistics</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-8">
              <p className="text-slate-300">
                "TransitOps provides the perfect balance between beautiful modern design and heavy-duty compliance rules. Our dispatchers picked it up in 10 minutes."
              </p>
              <h4 className="mt-6 font-bold text-white">David Chen</h4>
              <p className="text-xs text-slate-400">Founder, Apex Transit Systems</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-850 bg-slate-950 py-12 px-6">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <Truck className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">TransitOps</span>
          </div>
          <p className="text-xs text-slate-400">&copy; {new Date().getFullYear()} TransitOps Technologies Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
