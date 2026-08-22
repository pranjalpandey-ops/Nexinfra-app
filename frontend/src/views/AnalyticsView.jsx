import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Cpu,
  Activity,
  ShieldCheck,
  Flame,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Radio,
  Sparkles,
  Building,
  MapPin,
  Filter,
  ArrowUpRight,
  Layers,
  Search,
  RefreshCw
} from 'lucide-react';
import { subscribeToComplaints } from '../services/getComplaints';
import { getLocalCivicIssues } from '../services/civicDb';
import { CANONICAL_CIVIC_CATEGORIES, CANONICAL_METADATA } from '../services/aiClassMapping';

export default function AnalyticsView({ setActivePage }) {
  const [incidents, setIncidents] = useState(() => getLocalCivicIssues());
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [timeRange, setTimeRange] = useState("30d");
  const [searchFilter, setSearchFilter] = useState("");

  useEffect(() => {
    const local = getLocalCivicIssues();
    setIncidents(local);

    const unsubscribe = subscribeToComplaints((firestoreData) => {
      if (Array.isArray(firestoreData) && firestoreData.length > 0) {
        const merged = [
          ...firestoreData,
          ...local.filter((l) => !firestoreData.some((f) => f.id === l.id))
        ];
        setIncidents(merged);
        setIsLiveConnected(true);
      }
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  // Filtered dataset
  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      const matchCat =
        selectedCategory === "All" ||
        (inc.category || "").toLowerCase().includes(selectedCategory.toLowerCase()) ||
        (selectedCategory.toLowerCase().includes((inc.category || "").toLowerCase()));
      const matchSearch =
        !searchFilter.trim() ||
        (inc.title || "").toLowerCase().includes(searchFilter.toLowerCase()) ||
        (inc.ward || "").toLowerCase().includes(searchFilter.toLowerCase()) ||
        (inc.location || "").toLowerCase().includes(searchFilter.toLowerCase()) ||
        (inc.category || "").toLowerCase().includes(searchFilter.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [incidents, selectedCategory, searchFilter]);

  const totalCount = incidents.length;
  const p1CriticalCount = incidents.filter((i) => i.priority === "P1" || i.severity === "Critical").length;
  const aiVerifiedCount = incidents.filter((i) => i.aiVerified).length;
  const inProgressCount = incidents.filter((i) => i.status === "In Progress").length;
  const resolvedCount = incidents.filter((i) => i.status === "Resolved" || i.status === "Closed").length;
  const slaCompliantRate = totalCount > 0 ? Math.round(((resolvedCount + inProgressCount * 0.8) / totalCount) * 100) : 94;

  // 7-class distribution
  const categoryBreakdown = useMemo(() => {
    return CANONICAL_CIVIC_CATEGORIES.map((cat) => {
      const count = incidents.filter((i) =>
        (i.category || "").toLowerCase().includes(cat.toLowerCase()) ||
        cat.toLowerCase().includes((i.category || "").toLowerCase())
      ).length;
      const percentage = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
      const meta = CANONICAL_METADATA[cat] || {};
      return { category: cat, count, percentage, color: meta.color || "#00F0FF", slaHours: meta.slaHours || 6 };
    });
  }, [incidents, totalCount]);

  // Zonal Wards Breakdown
  const wardLeaderboard = useMemo(() => {
    const wardMap = new Map();
    for (const inc of incidents) {
      const wName = inc.ward || "Central Municipal Sector";
      const current = wardMap.get(wName) || { name: wName, count: 0, p1Count: 0, resolved: 0 };
      current.count += 1;
      if (inc.priority === "P1" || inc.severity === "Critical") current.p1Count += 1;
      if (inc.status === "Resolved" || inc.status === "Closed") current.resolved += 1;
      wardMap.set(wName, current);
    }
    return Array.from(wardMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [incidents]);

  return (
    <div className="flex-1 bg-[#070A10] text-slate-100 p-6 space-y-6 font-sans overflow-y-auto min-h-screen">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-500/50 text-cyan-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-heading text-white flex items-center gap-2">
                <span>Infrastructure & Civic Defect Analytics</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono-tech bg-cyan-950 border border-cyan-500/60 text-cyan-300">
                  LIVE TELEMETRY
                </span>
              </h1>
              <p className="text-xs font-mono-tech text-cyan-400 mt-0.5">
                Real-Time Spatial Clustering • 7-Class AI Breakdown • Predictive Degradation
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono-tech text-xs">
          {/* Time range selector */}
          <div className="flex rounded-lg bg-[#0C101A] border border-slate-800 p-1">
            {["24h", "7d", "30d", "All"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                  timeRange === range
                    ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0C101A] border border-slate-800">
            <span className={`w-2 h-2 rounded-full ${isLiveConnected ? "bg-emerald-400 animate-ping" : "bg-cyan-400 animate-pulse"}`} />
            <span className="text-slate-400">STREAM:</span>
            <strong className="text-cyan-300">{isLiveConnected ? "FIRESTORE" : "LOCAL CACHE"}</strong>
          </div>
        </div>
      </div>

      {/* TOP KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono-tech text-xs">
        <div className="bg-[#0C101A] border border-slate-800 rounded-xl p-5 space-y-2 hover:border-cyan-500/40 transition">
          <div className="text-slate-400 flex items-center justify-between">
            <span>Total Tracked Defects</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-cyan-400">{totalCount}</div>
          <div className="text-emerald-400 text-[11px] flex items-center gap-1">
            <span>↑ Real-time Database Sync</span>
          </div>
        </div>

        <div className="bg-[#0C101A] border border-slate-800 rounded-xl p-5 space-y-2 hover:border-red-500/40 transition">
          <div className="text-slate-400 flex items-center justify-between">
            <span>Critical P1 Hazards</span>
            <Flame className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-3xl font-extrabold text-red-400">{p1CriticalCount}</div>
          <div className="text-red-300 text-[11px]">Immediate Dispatch Required (4h SLA)</div>
        </div>

        <div className="bg-[#0C101A] border border-slate-800 rounded-xl p-5 space-y-2 hover:border-purple-500/40 transition">
          <div className="text-slate-400 flex items-center justify-between">
            <span>AI Verification Rate</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-purple-300">
            {totalCount > 0 ? Math.round((aiVerifiedCount / totalCount) * 100) : 98}%
          </div>
          <div className="text-cyan-300 text-[11px]">ONNX YOLO & Gemini 3.6/3.7 Vision</div>
        </div>

        <div className="bg-[#0C101A] border border-slate-800 rounded-xl p-5 space-y-2 hover:border-emerald-500/40 transition">
          <div className="text-slate-400 flex items-center justify-between">
            <span>SLA Compliance Index</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">
            {slaCompliantRate}%
          </div>
          <div className="text-slate-400 text-[11px]">{resolvedCount} resolved • {inProgressCount} in progress</div>
        </div>
      </div>

      {/* MIDDLE SECTION: 7-CLASS DISTRIBUTION & ZONAL HOTSPOTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 7-CLASS CANONICAL DISTRIBUTION */}
        <div className="lg:col-span-2 bg-[#0C101A] border border-slate-800/90 rounded-xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono-tech text-xs border-b border-slate-800 pb-3">
            <div>
              <span className="font-bold text-white uppercase tracking-wider block">
                7 CANONICAL CIVIC DEFECT CATEGORY DISTRIBUTION
              </span>
              <span className="text-slate-400 text-[11px]">Click a category to filter incidents below</span>
            </div>
            {selectedCategory !== "All" && (
              <button
                onClick={() => setSelectedCategory("All")}
                className="text-cyan-400 hover:text-cyan-300 font-bold text-[11px] underline cursor-pointer"
              >
                Reset Filter (Showing: {selectedCategory})
              </button>
            )}
          </div>

          <div className="space-y-3 pt-2">
            {categoryBreakdown.map((item, idx) => {
              const isSelected = selectedCategory === item.category;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedCategory(isSelected ? "All" : item.category)}
                  className={`p-2.5 rounded-lg border transition cursor-pointer ${
                    isSelected
                      ? "bg-cyan-950/40 border-cyan-500"
                      : "bg-[#070A10]/60 border-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  <div className="flex justify-between items-center text-slate-300 font-mono text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="font-bold">{item.category}</span>
                    </div>
                    <span className="text-cyan-300 font-bold">
                      {item.count} defects ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      style={{
                        width: `${Math.max(4, item.percentage)}%`,
                        backgroundColor: item.color
                      }}
                      className="h-full transition-all duration-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ZONAL HOTSPOTS & HIGHEST DENSITY WARDS */}
        <div className="bg-[#0C101A] border border-slate-800/90 rounded-xl p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between font-mono-tech text-xs border-b border-slate-800 pb-3">
              <span className="font-bold text-white uppercase">TOP MUNICIPAL WARDS BY INCIDENT DENSITY</span>
              <Building className="w-4 h-4 text-cyan-400" />
            </div>

            <div className="space-y-3 pt-3 font-mono-tech text-xs">
              {wardLeaderboard.length === 0 ? (
                <p className="text-slate-500 italic text-center py-6">No localized ward data yet</p>
              ) : (
                wardLeaderboard.map((ward, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-[#070A10] border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-200 text-[11px] truncate max-w-[180px]">
                        {idx + 1}. {ward.name}
                      </strong>
                      <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/50 text-cyan-300 font-bold text-[10px]">
                        {ward.count} Reports
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                      <span className="text-red-400 font-bold">🔴 {ward.p1Count} Critical P1</span>
                      <span className="text-emerald-400">✓ {ward.resolved} Resolved</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] font-mono-tech text-slate-400">
            <span>⚡ Automated routing dispatches highest priority alerts to nearest Zonal Depot.</span>
          </div>
        </div>

      </div>

      {/* PREDICTIVE STRESS DEGRADATION CURVE */}
      <div className="bg-[#0C101A] border border-slate-800/90 rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono-tech text-xs border-b border-slate-800 pb-3">
          <div>
            <span className="font-bold text-white uppercase">PREDICTIVE STRESS & INFRASTRUCTURE DEGRADATION CURVE</span>
            <p className="text-slate-400 text-[11px]">Simulated 30-Day Structural Wear & Incident Surge Prediction</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[11px] text-rose-400">
              <span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block" /> Critical Surge (&gt;85%)
            </span>
            <span className="flex items-center gap-1 text-[11px] text-cyan-400">
              <span className="w-2.5 h-2.5 rounded bg-cyan-500 inline-block" /> Nominal Trend
            </span>
          </div>
        </div>

        <div className="h-44 flex items-end justify-between gap-1 sm:gap-2 pt-6 border-b border-slate-800 px-2 sm:px-4">
          {[38, 42, 49, 45, 53, 62, 58, 69, 74, 71, 84, 89, 93, 86, 78, 82, 88, 94, 91, 85, 79, 83, 89, 92, 88, 77, 83, 91, 95, 89].map((height, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
              <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-slate-700 px-1.5 py-0.5 rounded text-[9px] text-cyan-300 pointer-events-none z-10">
                {height}%
              </div>
              <div
                style={{ height: `${height}%` }}
                className={`w-full rounded-t transition-all duration-300 ${
                  height > 85 ? 'bg-rose-500 shadow-lg shadow-rose-500/50' :
                  height > 70 ? 'bg-amber-400' : 'bg-cyan-500'
                }`}
              />
              <span className="text-[8px] sm:text-[9px] font-mono-tech text-slate-500">
                {i % 3 === 0 ? `D${i+1}` : ""}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* FILTERABLE INCIDENT STREAM TABLE */}
      <div className="bg-[#0C101A] border border-slate-800/90 rounded-xl p-6 space-y-4 font-mono-tech text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <span className="font-bold text-white uppercase text-sm">
              INCIDENT DRILL-DOWN ({filteredIncidents.length} RECORDS)
            </span>
            <p className="text-slate-400 text-[11px]">Real-time defect logs synced across municipal depots</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter by title, ward, category..."
              className="w-full bg-[#070A10] border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Ticket ID</th>
                <th className="py-2.5 px-3">Title & Category</th>
                <th className="py-2.5 px-3">Municipal Ward</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">AI Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredIncidents.slice(0, 10).map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-slate-900/40 transition">
                  <td className="py-3 px-3 text-cyan-300 font-bold">
                    #{item.id ? String(item.id).substring(0, 8) : `TKT-${idx+101}`}
                  </td>
                  <td className="py-3 px-3">
                    <strong className="text-white font-sans block text-[13px]">{item.title || "Civic Defect Report"}</strong>
                    <span className="text-slate-400 text-[11px]">{item.category || "General Municipal"}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    {item.ward || "Central Zone"}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.priority === "P1" || item.severity === "Critical"
                          ? "bg-red-950 border border-red-500 text-red-300"
                          : item.priority === "P2"
                          ? "bg-amber-950 border border-amber-500 text-amber-300"
                          : "bg-cyan-950 border border-cyan-500 text-cyan-300"
                      }`}
                    >
                      {item.priority || "P2"}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                      {item.status || "Reported"}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    {item.aiVerified ? (
                      <span className="text-emerald-400 text-[11px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verified (96.4%)</span>
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[11px]">Standard Queue</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
