import React, { useState } from 'react';
import { Filter, Plus, ArrowUpRight, MoreVertical, AlertTriangle, CheckCircle2, RefreshCw, FileText, Search } from 'lucide-react';

export default function MaintenanceView({ onOpenWorkOrderModal }) {
  const [selectedIncidentId, setSelectedIncidentId] = useState('INC-8918');
  const [filterSeverity, setFilterSeverity] = useState('ALL');

  const pipelineData = {
    SUBMITTED: [
      { id: 'INC-8921', title: 'Pothole Cluster, Sector 4', priority: 'MEDIUM', time: '2 hrs ago' },
      { id: 'INC-8925', title: 'Streetlight Substation B', priority: 'LOW', time: '4 hrs ago' },
    ],
    VERIFIED: [
      { id: 'INC-8918', title: 'Bridge Cable Stress Anomaly', priority: 'HIGH', status: 'AI Verified', selected: true },
    ],
    TEAM_ASSIGNED: [
      { id: 'INC-8915', title: 'Sewer Main Blockage', priority: 'HIGH', team: 'Sanitation Unit B' },
    ],
    RESOLVED: [
      { id: 'INC-8902', title: 'Traffic Light Failure, Int-12', priority: 'MEDIUM', time: '24h ago' },
    ],
  };

  const [workOrders, setWorkOrders] = useState([
    { id: 'WRK-001', dept: 'Sanitation', desc: 'Sewer main blockage clearance, Sector 7', priority: 'HIGH', status: 'EN ROUTE', statusBg: 'bg-indigo-950 text-indigo-300 border-indigo-500/40' },
    { id: 'WRK-002', dept: 'Road Maintenance', desc: 'Pothole filling operation, Highway 42', priority: 'MEDIUM', status: 'ACTIVE', statusBg: 'bg-[#00F0FF]/20 text-cyan-300 border-cyan-500/50' },
    { id: 'WRK-003', dept: 'Emergency', desc: 'Fallen power line securing, Grid B', priority: 'CRITICAL', status: 'DISPATCHED', statusBg: 'bg-rose-950 text-rose-300 border-rose-500/50' },
  ]);

  return (
    <div className="flex-1 bg-[#070A10] text-slate-100 p-6 space-y-8 font-sans overflow-y-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-heading">
            Maintenance & Work Orders
          </h1>
          <p className="text-slate-300 text-sm font-mono-tech mt-1 tracking-wider font-medium">
            Active Operations & Predictive Logistics Protocol
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 font-mono-tech text-xs sm:text-sm">
          <button
            onClick={() => setFilterSeverity(filterSeverity === 'ALL' ? 'HIGH' : 'ALL')}
            className="px-4 py-3 rounded-xl border border-slate-800 bg-[#0E131F] hover:bg-slate-800 text-slate-200 flex items-center gap-2 transition-colors cursor-pointer font-bold"
          >
            <Filter className="w-4 h-4 text-cyan-400" />
            <span>Filter View {filterSeverity !== 'ALL' && `(${filterSeverity})`}</span>
          </button>

          <button
            onClick={onOpenWorkOrderModal}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 hover:from-cyan-300 hover:to-cyan-200 text-black font-extrabold flex items-center gap-2 transition-all cyan-glow-sm hover:cyan-glow-lg uppercase cursor-pointer shadow-lg active:scale-95 text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>📊 GENERATE DIGITAL WORK ORDER</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Kanban */}
        <div className="lg:col-span-8 bg-[#0C101A] border border-slate-800/90 rounded-2xl p-6 space-y-5">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-mono-tech text-sm">
            <div className="flex items-center gap-2 text-white font-bold">
              <span>INCIDENT PIPELINE</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400 text-xs font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>LIVE SYNC</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* SUBMITTED */}
            <div className="space-y-3">
              <div className="text-xs font-mono-tech font-bold text-slate-300 border-b border-slate-800 pb-2 uppercase">
                SUBMITTED (12)
              </div>
              
              <div className="space-y-3">
                {pipelineData.SUBMITTED.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedIncidentId(item.id)}
                    className={`bg-[#070A10] border p-3.5 rounded-xl text-xs space-y-2 transition-all cursor-pointer ${
                      selectedIncidentId === item.id
                        ? 'border-cyan-400 bg-cyan-950/30 cyan-glow-sm'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-center font-mono-tech text-xs">
                      <span className="text-slate-300 font-bold">{item.id}</span>
                      <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30 font-bold text-[11px]">
                        {item.priority}
                      </span>
                    </div>
                    <h4 className="font-bold text-white leading-tight font-sans text-xs sm:text-sm">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-400 font-mono-tech">
                      {item.time}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* VERIFIED */}
            <div className="space-y-3">
              <div className="text-xs font-mono-tech font-bold text-slate-300 border-b border-slate-800 pb-2 uppercase">
                VERIFIED (5)
              </div>

              <div className="space-y-3">
                {pipelineData.VERIFIED.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedIncidentId(item.id)}
                    className={`bg-[#070A10] border p-3.5 rounded-xl text-xs space-y-2 transition-all cursor-pointer ${
                      selectedIncidentId === item.id
                        ? 'border-cyan-400 bg-cyan-950/40 cyan-glow-sm ring-1 ring-cyan-400'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-center font-mono-tech text-xs">
                      <span className="text-cyan-400 font-bold">{item.id}</span>
                      <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/30 font-bold text-[11px]">
                        {item.priority}
                      </span>
                    </div>
                    <h4 className="font-bold text-white leading-tight font-sans text-xs sm:text-sm">
                      {item.title}
                    </h4>
                    <div className="flex justify-between items-center text-xs font-mono-tech pt-1">
                      <span className="text-slate-300 font-medium">{item.status}</span>
                      <span className="text-cyan-400 font-bold">Selected</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TEAM ASSIGNED */}
            <div className="space-y-3">
              <div className="text-xs font-mono-tech font-bold text-slate-300 border-b border-slate-800 pb-2 uppercase">
                ASSIGNED (3)
              </div>

              <div className="space-y-3">
                {pipelineData.TEAM_ASSIGNED.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedIncidentId(item.id)}
                    className={`bg-[#070A10] border p-3.5 rounded-xl text-xs space-y-2 transition-all cursor-pointer ${
                      selectedIncidentId === item.id
                        ? 'border-cyan-400 bg-cyan-950/30 cyan-glow-sm'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-center font-mono-tech text-xs">
                      <span className="text-slate-300 font-bold">{item.id}</span>
                      <span className="text-indigo-300 font-bold">{item.team}</span>
                    </div>
                    <h4 className="font-bold text-white leading-tight font-sans text-xs sm:text-sm">
                      {item.title}
                    </h4>
                  </div>
                ))}
              </div>
            </div>

            {/* RESOLVED */}
            <div className="space-y-3">
              <div className="text-xs font-mono-tech font-bold text-slate-300 border-b border-slate-800 pb-2 uppercase">
                RESOLVED (24h)
              </div>

              <div className="space-y-3">
                {pipelineData.RESOLVED.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedIncidentId(item.id)}
                    className={`bg-[#070A10] border p-3.5 rounded-xl text-xs space-y-2 transition-all cursor-pointer ${
                      selectedIncidentId === item.id
                        ? 'border-cyan-400 bg-cyan-950/30 cyan-glow-sm'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-center font-mono-tech text-xs">
                      <span className="text-slate-400 font-bold">{item.id}</span>
                      <span className="text-emerald-400 font-bold">✓ Closed</span>
                    </div>
                    <h4 className="font-medium text-slate-300 leading-tight font-sans text-xs sm:text-sm">
                      {item.title}
                    </h4>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Predictive Schedule */}
        <div className="lg:col-span-4 bg-[#0C101A] border border-slate-800/90 rounded-2xl p-6 space-y-6 flex flex-col justify-between">
          
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-mono-tech text-sm">
              <div className="flex items-center gap-2 text-white font-bold">
                <span>PREDICTIVE SCHEDULE</span>
              </div>
              <AlertTriangle className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>

            <div className="space-y-4">
              
              <div className="bg-[#070A10] border border-rose-500/50 rounded-xl p-4.5 space-y-2.5">
                <div className="text-xs font-mono-tech font-bold text-rose-400 uppercase tracking-wider">
                  HIGH RISK FAILURE T-Minus 48h
                </div>
                <h4 className="text-base font-bold text-white font-sans">
                  Water Pump Station 04
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  Vibration patterns indicate imminent bearing failure. AI Confidence: 94%.
                </p>

                <div className="pt-2">
                  <button
                    onClick={onOpenWorkOrderModal}
                    className="inline-flex items-center gap-1 text-cyan-400 font-mono-tech text-xs sm:text-sm font-bold hover:underline cursor-pointer"
                  >
                    <span>⚡ Pre-emptive Work Order</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-[#070A10] border border-amber-500/40 rounded-xl p-4.5 space-y-2.5">
                <div className="text-xs font-mono-tech font-bold text-amber-400 uppercase tracking-wider">
                  DEGRADATION Est. 5 Days
                </div>
                <h4 className="text-base font-bold text-white font-sans">
                  Transformer Unit X-9
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  Thermal imaging shows anomalous heat signature. Requires inspection.
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* Department Routing Table */}
      <div className="bg-[#0C101A] border border-slate-800/90 rounded-2xl p-6 space-y-5">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 font-mono-tech text-sm">
          <div className="flex items-center gap-2 text-white font-bold">
            <span>DEPARTMENT ROUTING</span>
          </div>

          <button 
            onClick={() => alert('Exporting Department Routing Table to CSV...')}
            className="px-4 py-2 rounded-xl border border-slate-800 bg-[#070A10] text-slate-200 hover:text-white transition-colors cursor-pointer uppercase text-xs font-bold"
          >
            EXPORT CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono-tech text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-xs tracking-wider font-bold">
                <th className="py-3.5 px-4">ID</th>
                <th className="py-3.5 px-4">DEPARTMENT</th>
                <th className="py-3.5 px-4">DESCRIPTION</th>
                <th className="py-3.5 px-4">PRIORITY</th>
                <th className="py-3.5 px-4">STATUS</th>
                <th className="py-3.5 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {workOrders.map((row) => (
                <tr key={row.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-4 px-4 font-bold text-cyan-400">{row.id}</td>
                  <td className="py-4 px-4 text-white font-sans font-bold">{row.dept}</td>
                  <td className="py-4 px-4 text-slate-300 font-sans max-w-md text-xs sm:text-sm">{row.desc}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 rounded text-xs font-extrabold ${
                      row.priority === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-500/40' :
                      row.priority === 'HIGH' ? 'bg-amber-950 text-amber-300 border border-amber-500/40' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {row.priority}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-lg border text-xs font-extrabold ${row.statusBg}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button 
                      onClick={() => alert(`Routing controls for ${row.id}`)}
                      className="text-slate-400 hover:text-white p-1 cursor-pointer"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
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
