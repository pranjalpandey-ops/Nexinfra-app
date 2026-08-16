import React, { useState, useEffect } from "react";
import {
  Search,
  Bell,
  Radio,
  User,
  AlertTriangle,
  CheckCircle2,
  Plane,
  Activity,
  FileText,
  Clock,
} from "lucide-react";

import { subscribeToDashboard } from "../services/dashboardService";

export default function DashboardView({
  setActivePage,
  onOpenDispatchModal,
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    today: 0,
    recent: [],
  });

  useEffect(() => {
    const unsubscribe = subscribeToDashboard((data) => {
      setStats(data);
    });

    return unsubscribe;
  }, []);

  const openIncident = (complaint) => {
    localStorage.setItem(
      "selectedComplaint",
      JSON.stringify(complaint)
    );

    setActivePage("incident-detail");
  };

  return (
    <div className="flex-1 bg-[#070A10] text-slate-100 p-6 space-y-6 overflow-y-auto">

      {/* Header */}

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-800 pb-4">

        <div className="relative w-full sm:w-96">

          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />

          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search complaints..."
            className="w-full bg-[#0E131F] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white"
          />

        </div>

        <div className="flex items-center gap-3">

          <div className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-400 text-xs font-bold">
            ● Live System
          </div>

          <button className="p-2 rounded-lg bg-slate-900 border border-slate-700">
            <Radio className="w-5 h-5" />
          </button>

          <button className="p-2 rounded-lg bg-slate-900 border border-slate-700 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400"></span>
          </button>

          <button
            onClick={() => setActivePage("signup")}
            className="p-2 rounded-full bg-slate-800 border border-slate-700"
          >
            <User className="w-5 h-5 text-cyan-400" />
          </button>

        </div>

      </div>

      {/* LIVE METRICS */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        <MetricCard
          icon={<Activity className="text-cyan-400" />}
          title="Total Complaints"
          value={stats.total}
          color="text-cyan-400"
        />

        <MetricCard
          icon={<AlertTriangle className="text-amber-400" />}
          title="Pending"
          value={stats.pending}
          color="text-amber-400"
        />

        <MetricCard
          icon={<Clock className="text-orange-400" />}
          title="In Progress"
          value={stats.inProgress}
          color="text-orange-400"
        />

        <MetricCard
          icon={<CheckCircle2 className="text-emerald-400" />}
          title="Resolved"
          value={stats.resolved}
          color="text-emerald-400"
        />

      </div>

      {/* MAIN SECTION */}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Recent Complaints */}

        <div className="lg:col-span-8 bg-[#0C101A] border border-slate-800 rounded-2xl p-6">

          <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-5">

            <h3 className="font-bold text-white">
              Live Complaint Feed
            </h3>

            <span className="text-cyan-400 text-sm">
              {stats.recent.length} Recent
            </span>

          </div>

          <div className="space-y-4">

            {stats.recent.length === 0 ? (

              <div className="text-center text-slate-500 py-16">
                No complaints submitted yet.
              </div>

            ) : (

              stats.recent.map((complaint) => (
                <div
                  key={complaint.id}
                  onClick={() => openIncident(complaint)}
                  className="bg-[#070A12] border border-slate-800 hover:border-cyan-500 rounded-xl p-4 flex gap-4 cursor-pointer transition"
                >

                  {complaint.imageUrl ? (
                    <img
                      src={complaint.imageUrl}
                      alt="Complaint"
                      className="w-28 h-28 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500">
                      No Image
                    </div>
                  )}

                  <div className="flex-1 space-y-2">

                    <div className="flex justify-between">

                      <h4 className="font-bold text-white">
                        {complaint.title}
                      </h4>

                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          complaint.priority === "High"
                            ? "bg-red-900 text-red-300"
                            : complaint.priority === "Medium"
                            ? "bg-amber-900 text-amber-300"
                            : "bg-green-900 text-green-300"
                        }`}
                      >
                        {complaint.priority}
                      </span>

                    </div>

                    <p className="text-sm text-slate-400 line-clamp-2">
                      {complaint.description}
                    </p>

                    <p className="text-xs text-cyan-400">
                      📍 {complaint.address}
                    </p>

                  </div>

                </div>
              ))

            )}

          </div>

        </div>

        {/* Right Panel */}

        <div className="lg:col-span-4 bg-[#0C101A] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">

          <div className="space-y-5">

            <h3 className="font-bold text-white">
              Live Overview
            </h3>

            <OverviewRow
              label="Today's Complaints"
              value={stats.today}
              color="text-cyan-400"
            />

            <OverviewRow
              label="Pending"
              value={stats.pending}
              color="text-amber-400"
            />

            <OverviewRow
              label="Resolved"
              value={stats.resolved}
              color="text-emerald-400"
            />

            <OverviewRow
              label="Active Reports"
              value={stats.total}
              color="text-white"
            />

          </div>

          <button
            onClick={() =>
              alert("Live report generation coming next.")
            }
            className="mt-8 w-full py-3 rounded-xl border border-cyan-500 bg-cyan-950/40 text-cyan-300 font-bold flex justify-center items-center gap-2"
          >

            <FileText className="w-4 h-4" />

            Generate Report

          </button>

        </div>

      </div>

    </div>
  );
}

function MetricCard({ icon, title, value, color }) {
  return (
    <div className="bg-[#0C101A] border border-slate-800 rounded-2xl p-6">

      <div className="flex items-center gap-2 text-slate-300 text-sm">

        {icon}

        {title}

      </div>

      <div className={`text-4xl font-bold mt-3 ${color}`}>
        {value}
      </div>

    </div>
  );
}

function OverviewRow({ label, value, color }) {
  return (
    <div className="flex justify-between border-b border-slate-800 pb-3">

      <span className="text-slate-400">
        {label}
      </span>

      <span className={`font-bold ${color}`}>
        {value}
      </span>

    </div>
  );
}