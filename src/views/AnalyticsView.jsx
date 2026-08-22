import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Cpu, Activity, ShieldCheck, Flame, AlertTriangle, CheckCircle2, Clock, Radio, Sparkles } from 'lucide-react';
import { subscribeToComplaints } from '../services/getComplaints';
import { getLocalCivicIssues } from '../services/civicDb';
import { CANONICAL_CIVIC_CATEGORIES } from '../services/aiClassMapping';

export default function AnalyticsView() {
  const [incidents, setIncidents] = useState(() => getLocalCivicIssues());
  const [isLiveConnected, setIsLiveConnected] = useState(false);

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

  const totalCount = incidents.length;
  const p1CriticalCount = incidents.filter((i) => i.priority === "P1" || i.severity === "Critical").length;
  const aiVerifiedCount = incidents.filter((i) => i.aiVerified).length;
  const inProgressCount = incidents.filter((i) => i.status === "In Progress").length;
  const resolvedCount = incidents.filter((i) => i.status === "Resolved").length;

  const categoryBreakdown = CANONICAL_CIVIC_CATEGORIES.map((cat) => {
    const count = incidents.filter((i) => (i.category || "").toLowerCase().includes(cat.toLowerCase()) || (cat.toLowerCase().includes((i.category || "").toLowerCase()))).length;
    const percentage = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
    return { category: cat, count, percentage };
  });

  return (
    <div className="flex-1 bg-[#070A10] text-slate-100 p-6 space-y-6 font-sans overflow-y-auto">
      
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white flex items-center gap-2">
            <span>Predictive Infrastructure & Defect Analytics</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-cyan-950 border border-cyan-500/60 text-cyan-300">
              FIRESTORE REAL-TIME
            </span>
          </h1>
          <p className="text-xs font-mono-tech text-cyan-400 mt-0.5">
            Live AI Telemetry, Category Breakdown, Degradation Models & SLA Compliance
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
          <span className={`w-2 h-2 rounded-full ${isLiveConnected ? "bg-emerald-400 animate-ping" : "bg-cyan-400 animate-pulse"}`} />
          <span className="text-slate-300">STREAM:</span>
          <strong className="text-cyan-300">{isLiveConnected ? "FIRESTORE LIVE" : "LOCAL CACHE"}</strong>
        </div>
      </div>

      {/* TOP KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono-tech text-xs">
        <div className="bg-[#0C101A] border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="text-slate-400 flex items-center justify-between">
            <span>Total Incidents Tracked</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-cyan-400">{totalCount}</div>
          <div className="text-emerald-400 text-[11px]">↑ Real-time Database Sync</div>
        </div>

        <div className="bg-[#0C101A] border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="text-slate-400 flex items-center justify-between">
            <span>Critical P1 Hazards</span>
            <Flame className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-3xl font-extrabold text-red-400">{p1CriticalCount}</div>
          <div className="text-red-300 text-[11px]">Immediate Dispatch Required</div>
        </div>

        <div className="bg-[#0C101A] border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="text-slate-400 flex items-center justify-between">
            <span>AI Verified Rate</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-purple-300">
            {totalCount > 0 ? Math.round((aiVerifiedCount / totalCount) * 100) : 100}%
          </div>
          <div className="text-cyan-300 text-[11px]">{aiVerifiedCount} / {totalCount} verified via ONNX YOLO</div>
        </div>

        <div className="bg-[#0C101A] border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="text-slate-400 flex items-center justify-between">
            <span>Resolution Pipeline</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">
            {resolvedCount + inProgressCount}
          </div>
          <div className="text-slate-400 text-[11px]">{inProgressCount} active • {resolvedCount} completed</div>
        </div>
      </div>

      {/* CANONICAL CATEGORY BREAKDOWN */}
      <div className="bg-[#0C101A] border border-slate-800/90 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between font-mono-tech text-xs border-b border-slate-800 pb-3">
          <span className="font-bold text-white uppercase tracking-wider">
            6 CANONICAL CIVIC DEFECT CATEGORY DISTRIBUTION
          </span>
          <span className="text-cyan-400">AI DETECTIONS & CITIZEN REPORTS</span>
        </div>

        <div className="space-y-3 pt-2">
          {categoryBreakdown.map((item, idx) => (
            <div key={idx} className="space-y-1.5 font-mono text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span className="font-bold">{item.category}</span>
                <span className="text-cyan-300">{item.count} defects ({item.percentage}%)</span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  style={{ width: `${Math.max(5, item.percentage)}%` }}
                  className={`h-full transition-all ${
                    idx === 0 ? "bg-red-500" :
                    idx === 1 ? "bg-cyan-400" :
                    idx === 2 ? "bg-amber-400" :
                    idx === 3 ? "bg-orange-500" :
                    idx === 4 ? "bg-purple-500" : "bg-emerald-500"
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* STRESS DEGRADATION CURVE */}
      <div className="bg-[#0C101A] border border-slate-800/90 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between font-mono-tech text-xs border-b border-slate-800 pb-3">
          <span className="font-bold text-white uppercase">HISTORICAL VS PREDICTIVE STRESS DEGRADATION CURVE</span>
          <span className="text-cyan-400">INTERVAL: 30 DAYS</span>
        </div>

        <div className="h-48 flex items-end justify-between gap-2 pt-6 border-b border-slate-800 px-4">
          {[40, 45, 50, 48, 52, 60, 68, 75, 70, 82, 88, 92, 85, 78, 92].map((height, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
              <div
                style={{ height: `${height}%` }}
                className={`w-full rounded-t transition-all ${
                  height > 85 ? 'bg-rose-500 cyan-glow-sm' :
                  height > 70 ? 'bg-amber-400' : 'bg-cyan-500'
                }`}
              />
              <span className="text-[9px] font-mono-tech text-slate-500">D{i+1}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
