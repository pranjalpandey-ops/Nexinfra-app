import React from 'react';
import { BarChart3, TrendingUp, Cpu, Activity, ShieldCheck } from 'lucide-react';

export default function AnalyticsView() {
  return (
    <div className="flex-1 bg-[#070A10] text-slate-100 p-6 space-y-6 font-sans overflow-y-auto">
      
      <div className="border-b border-slate-800/80 pb-4">
        <h1 className="text-2xl font-bold font-heading text-white">Predictive Infrastructure Analytics</h1>
        <p className="text-xs font-mono-tech text-cyan-400 mt-0.5">Machine Learning Anomaly Detection & Degradation Curves</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono-tech text-xs">
        <div className="bg-[#0C101A] border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="text-slate-400">Total Telemetry Processed</div>
          <div className="text-3xl font-extrabold text-cyan-400">4.82 TB / Day</div>
          <div className="text-emerald-400 text-[11px]">↑ +18.4% Efficiency</div>
        </div>

        <div className="bg-[#0C101A] border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="text-slate-400">Predictive Accuracy</div>
          <div className="text-3xl font-extrabold text-white">99.42%</div>
          <div className="text-cyan-400 text-[11px]">Neural TCN Model v4.2</div>
        </div>

        <div className="bg-[#0C101A] border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="text-slate-400">Cost Savings (Estimated)</div>
          <div className="text-3xl font-extrabold text-emerald-400">$2.4M</div>
          <div className="text-slate-400 text-[11px]">Prevented Catastrophic Outages</div>
        </div>
      </div>

      {/* Simulated Chart Container */}
      <div className="bg-[#0C101A] border border-slate-800/90 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between font-mono-tech text-xs border-b border-slate-800 pb-3">
          <span className="font-bold text-white">HISTORICAL VS PREDICTIVE STRESS DEGRADATION CURVE</span>
          <span className="text-cyan-400">INTERVAL: 30 DAYS</span>
        </div>

        <div className="h-64 flex items-end justify-between gap-2 pt-6 border-b border-slate-800 px-4">
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
