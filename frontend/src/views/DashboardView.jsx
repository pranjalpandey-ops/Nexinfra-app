import React, { useState, useEffect } from "react";
import {
  Search,
  Bell,
  Radio,
  User,
  AlertTriangle,
  CheckCircle2,
  Activity,
  FileText,
  Clock,
  Sparkles,
  MapPin,
  ShieldCheck,
  UserCheck
} from "lucide-react";

import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { getLocalCivicIssues } from "../services/civicDb";

export default function DashboardView({
  setActivePage,
  user,
  onOpenDispatchModal,
}) {
  const isAdmin = user?.role === "admin";
  const [searchQuery, setSearchQuery] = useState("");
  const [allComplaints, setAllComplaints] = useState(() => getLocalCivicIssues());

  const refreshIssues = () => {
    const local = getLocalCivicIssues();
    setAllComplaints((prev) => {
      const merged = [
        ...prev.filter((p) => !local.some((l) => l.id === p.id)),
        ...local
      ];
      return merged;
    });
  };

  useEffect(() => {
    // 1. Load initial local civic issues
    const local = getLocalCivicIssues();
    setAllComplaints(local);

    // 2. Real-time Firestore sync
    const q = query(collection(db, "complaints"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const firestoreData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const currentLocal = getLocalCivicIssues();
        const merged = [
          ...firestoreData,
          ...currentLocal.filter((l) => !firestoreData.some((f) => f.id === l.id))
        ];
        setAllComplaints(merged);
      },
      (error) => {
        console.warn("Firestore listener note in Dashboard:", error);
      }
    );

    // 3. Listen to instant local / cross-component status update & delete events
    const handleStatusUpdated = (e) => {
      const { id, status } = e.detail || {};
      if (id && status) {
        setAllComplaints((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status } : c))
        );
      }
      refreshIssues();
    };

    const handleIssueDeleted = (e) => {
      const { id } = e.detail || {};
      if (id) {
        setAllComplaints((prev) => prev.filter((c) => c.id !== id));
      }
      refreshIssues();
    };

    window.addEventListener("civic_issue_updated", handleStatusUpdated);
    window.addEventListener("civic_issue_deleted", handleIssueDeleted);
    window.addEventListener("storage", refreshIssues);

    return () => {
      unsubscribe();
      window.removeEventListener("civic_issue_updated", handleStatusUpdated);
      window.removeEventListener("civic_issue_deleted", handleIssueDeleted);
      window.removeEventListener("storage", refreshIssues);
    };
  }, []);

  // Filter complaints based on role
  const displayedComplaints = isAdmin
    ? allComplaints
    : allComplaints.filter((c) => c.createdBy === user?.email);

  const today = new Date().toDateString();

  const stats = {
    total: displayedComplaints.length,
    pending: displayedComplaints.filter(
      (c) => c.status === "Pending" || c.status === "Submitted"
    ).length,
    inProgress: displayedComplaints.filter(
      (c) => c.status === "In Progress" || c.status === "Verified" || c.status === "Team Assigned"
    ).length,
    resolved: displayedComplaints.filter((c) => c.status === "Resolved").length,
    today: displayedComplaints.filter((c) => {
      if (!c.createdAt?.seconds) return false;
      return new Date(c.createdAt.seconds * 1000).toDateString() === today;
    }).length,
  };

  const filteredFeed = displayedComplaints.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      (c.title || "").toLowerCase().includes(q) ||
      (c.category || "").toLowerCase().includes(q) ||
      (c.address || "").toLowerCase().includes(q) ||
      (c.status || "").toLowerCase().includes(q)
    );
  });

  const openIncident = (complaint) => {
    localStorage.setItem("selectedComplaint", JSON.stringify(complaint));
    setActivePage("incident-detail");
  };

  return (
    <div className="flex-1 bg-[#070A10] text-slate-100 p-4 sm:p-6 space-y-6 overflow-y-auto min-w-0">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-800 pb-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAdmin ? "Search all city complaints..." : "Search my complaints..."}
            className="w-full bg-[#0E131F] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded-full border text-xs font-bold flex items-center gap-1.5 ${
            isAdmin
              ? "bg-cyan-950 border-cyan-500 text-cyan-400"
              : "bg-emerald-950 border-emerald-500 text-emerald-400"
          }`}>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{isAdmin ? "Admin Authority Console" : "Citizen Portal Active"}</span>
          </div>

          <button
            onClick={() => setActivePage("citysync-map")}
            title="CitySync Map"
            className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-400 transition cursor-pointer"
          >
            <MapPin className="w-4 h-4" />
          </button>

          <button
            onClick={() => alert(`Active role: ${isAdmin ? "System Administrator" : "Public Resident"} (${user?.email || "Authenticated"})`)}
            className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-400 transition cursor-pointer relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400"></span>
          </button>

          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 font-bold text-xs">
            {user?.name ? user.name[0].toUpperCase() : "U"}
          </div>
        </div>
      </div>

      {/* Role Banner */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 overflow-hidden ${
        isAdmin
          ? "bg-cyan-950/20 border-cyan-500/40"
          : "bg-emerald-950/20 border-emerald-500/40"
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isAdmin ? "bg-cyan-950 text-cyan-400 border border-cyan-500/50" : "bg-emerald-950 text-emerald-400 border border-emerald-500/50"
          }`}>
            {isAdmin ? <ShieldCheck className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="font-bold text-white text-base font-heading">
              Welcome back, {user?.name || "Operator"}
            </h2>
            <p className="text-xs text-slate-400 font-mono-tech">
              {isAdmin
                ? "Full Infrastructure Authority • Live Incident Radar & UAV Dispatch Active"
                : "Public Citizen Portal • Track your reported community incidents & infrastructure status"}
            </p>
          </div>
        </div>

        <div className="w-full sm:w-auto flex-shrink-0">
          {!isAdmin ? (
            <button
              onClick={() => setActivePage("report-issue")}
              className="w-full sm:w-auto flex justify-center px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-300 text-black font-extrabold text-xs uppercase flex items-center gap-2 cyan-glow-sm hover:from-cyan-300 hover:to-cyan-200 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>+ Report New Issue</span>
            </button>
          ) : (
            <button
              onClick={onOpenDispatchModal}
              className="w-full sm:w-auto flex justify-center px-4 py-2 rounded-xl bg-cyan-950/60 border border-cyan-500 text-cyan-300 hover:bg-cyan-900/60 font-bold text-xs uppercase cursor-pointer"
            >
              ⚡ Tactical UAV Fleet
            </button>
          )}
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          icon={<Activity className="text-cyan-400" />}
          title={isAdmin ? "Total City Complaints" : "My Submitted Complaints"}
          value={stats.total}
          color="text-cyan-400"
        />

        <MetricCard
          icon={<AlertTriangle className="text-amber-400" />}
          title={isAdmin ? "Pending Inspection" : "My Pending Issues"}
          value={stats.pending}
          color="text-amber-400"
        />

        <MetricCard
          icon={<Clock className="text-orange-400" />}
          title={isAdmin ? "In Remediation" : "In Progress"}
          value={stats.inProgress}
          color="text-orange-400"
        />

        <MetricCard
          icon={<CheckCircle2 className="text-emerald-400" />}
          title={isAdmin ? "Resolved Incidents" : "Resolved For Me"}
          value={stats.resolved}
          color="text-emerald-400"
        />
      </div>

      {/* MAIN SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Complaints Feed */}
        <div className="lg:col-span-8 bg-[#0C101A] border border-slate-800 rounded-2xl p-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-5">
            <h3 className="font-bold text-white flex items-center gap-2 min-w-0">
              <span className="truncate">{isAdmin ? "Live City Incident Feed" : "My Incident Tracker"}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono-tech flex-shrink-0">
                {filteredFeed.length} records
              </span>
            </h3>

            <span className="text-cyan-400 text-xs font-mono-tech flex-shrink-0">
              {isAdmin ? "Global Authority View" : "Filtered to Your Account"}
            </span>
          </div>

          <div className="space-y-4">
            {filteredFeed.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <p className="text-slate-400 font-mono-tech text-sm">
                  {isAdmin
                    ? "No complaints registered in the system yet."
                    : "You haven't submitted any complaints yet."}
                </p>
                {!isAdmin && (
                  <button
                    onClick={() => setActivePage("report-issue")}
                    className="px-4 py-2.5 rounded-xl bg-cyan-400 text-black font-extrabold text-xs uppercase cyan-glow-sm cursor-pointer"
                  >
                    + Submit First Complaint
                  </button>
                )}
              </div>
            ) : (
              filteredFeed.slice(0, 10).map((complaint) => (
                <div
                  key={complaint.id}
                  onClick={() => openIncident(complaint)}
                  className="bg-[#070A12] border border-slate-800 hover:border-cyan-500/80 rounded-xl p-4 flex flex-col sm:flex-row gap-4 cursor-pointer transition min-w-0"
                >
                  {complaint.imageUrl ? (
                    <img
                      src={complaint.imageUrl}
                      alt="Complaint"
                      className="w-full sm:w-24 h-48 sm:h-24 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-full sm:w-24 h-48 sm:h-24 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 text-xs font-mono-tech flex-shrink-0">
                      No Image
                    </div>
                  )}

                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-white text-base hover:text-cyan-300 transition break-words whitespace-normal">
                          {complaint.title || complaint.category}
                        </h4>
                        <p className="text-xs text-slate-400">
                          Category: <span className="text-slate-300">{complaint.category || "General"}</span> • {complaint.createdBy || "Resident"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2.5 py-1 rounded font-bold ${
                            complaint.priority === "High"
                              ? "bg-red-950 text-red-300 border border-red-800"
                              : complaint.priority === "Medium"
                              ? "bg-amber-950 text-amber-300 border border-amber-800"
                              : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          }`}
                        >
                          {complaint.priority || "Medium"}
                        </span>

                        <span className="text-xs px-2 py-1 rounded bg-slate-800 text-cyan-300 font-mono-tech">
                          {complaint.status || "Submitted"}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-slate-400 break-words whitespace-normal">
                      {complaint.description}
                    </p>

                    <p className="text-xs text-cyan-400 font-mono-tech flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="break-words whitespace-normal">{complaint.address || "Location Recorded"}</span>
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel / Conditional Action Center */}
        <div className="lg:col-span-4 bg-[#0C101A] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <h3 className="font-bold text-white border-b border-slate-800 pb-3">
              {isAdmin ? "Infrastructure Metrics" : "Citizen Quick Hub"}
            </h3>

            <OverviewRow
              label="Today's Incidents"
              value={stats.today}
              color="text-cyan-400"
            />

            <OverviewRow
              label="Pending Action"
              value={stats.pending}
              color="text-amber-400"
            />

            <OverviewRow
              label="In Progress"
              value={stats.inProgress}
              color="text-orange-400"
            />

            <OverviewRow
              label="Resolved"
              value={stats.resolved}
              color="text-emerald-400"
            />

            <OverviewRow
              label={isAdmin ? "Total System Logs" : "Total My Records"}
              value={stats.total}
              color="text-white"
            />
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-800">
            {isAdmin ? (
              <button
                onClick={() => alert("City Infrastructure Report generated. Ready for municipal download.")}
                className="w-full py-3 rounded-xl border border-cyan-500 bg-cyan-950/40 text-cyan-300 font-bold flex justify-center items-center gap-2 hover:bg-cyan-900/60 transition cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Generate Official Report</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => setActivePage("report-issue")}
                  className="w-full py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold flex justify-center items-center gap-2 transition cyan-glow-sm cursor-pointer uppercase text-xs"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Report Infrastructure Defect</span>
                </button>

                <button
                  onClick={() => setActivePage("citysync-map")}
                  className="w-full py-3 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold flex justify-center items-center gap-2 transition cursor-pointer text-xs"
                >
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <span>Explore CitySync GIS Radar</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, title, value, color }) {
  return (
    <div className="bg-[#0C101A] border border-slate-800 rounded-2xl p-4 sm:p-6 min-w-0">
      <div className="flex items-center gap-2 text-slate-300 text-sm sm:text-sm font-medium truncate">
        {icon}
        <span className="truncate">{title}</span>
      </div>
      <div className={`text-3xl sm:text-4xl font-bold mt-3 font-heading ${color}`}>
        {value}
      </div>
    </div>
  );
}

function OverviewRow({ label, value, color }) {
  return (
    <div className="flex justify-between border-b border-slate-800 pb-3 font-mono-tech text-xs">
      <span className="text-slate-400">{label}</span>
      <span className={`font-bold ${color}`}>{value}</span>
    </div>
  );
}
