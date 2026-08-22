import React from 'react';
import { Plane, Battery, Signal, Shield, Activity, Radio, Video } from 'lucide-react';

export default function DroneFleetView({ onOpenDispatchModal }) {
  const drones = [
    { id: 'UAV-ALPHA-09', model: 'NexDrone Heavy LiDAR', battery: 94, status: 'EN ROUTE', speed: '58 km/h', altitude: '120m', target: 'Hwy 401, KM 32' },
    { id: 'UAV-BETA-04', model: 'Thermal Multispectral', battery: 78, status: 'PATROL', speed: '42 km/h', altitude: '95m', target: 'Sector 7 Grid' },
    { id: 'UAV-GAMMA-12', model: 'Sonar Structural Scan', battery: 100, status: 'CHARGING', speed: '0 km/h', altitude: '0m', target: 'Command Hub' },
    { id: 'UAV-DELTA-01', model: 'Fast Optics Recon', battery: 65, status: 'PATROL', speed: '64 km/h', altitude: '140m', target: 'Sector 9 Grid' },
  ];

  return (
    <div className="flex-1 bg-[#070A10] text-slate-100 p-6 space-y-6 font-sans overflow-y-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white">Autonomous Drone Fleet Management</h1>
          <p className="text-xs font-mono-tech text-cyan-400 mt-0.5">Real-Time UAV Stream Telemetry & Fleet Status</p>
        </div>

        <button
          onClick={onOpenDispatchModal}
          className="px-4 py-2 rounded bg-cyan-400 text-black font-mono-tech font-bold uppercase text-xs cyan-glow-sm cursor-pointer"
        >
          + Launch UAV Mission
        </button>
      </div>

      {/* Live Stream Simulator Box */}
      <div className="bg-[#0B0F19] border border-cyan-500/30 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between font-mono-tech text-xs border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-cyan-400 font-bold">
            <Video className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>LIVE VIDEO TELEMETRY STREAM: UAV-ALPHA-09</span>
          </div>
          <span className="text-slate-400">FPS: 60 | BANDWIDTH: 14.2 Mbps</span>
        </div>

        {/* Video Canvas Simulation */}
        <div className="h-64 rounded-lg bg-[#05070D] border border-slate-800 relative overflow-hidden flex items-center justify-center bg-cyber-grid-dense">
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-950/30 via-transparent to-red-950/20" />
          <svg className="w-full h-full absolute inset-0 text-cyan-400/40" viewBox="0 0 100 100">
            <crosshair cx="50" cy="50" r="10" stroke="currentColor" />
            <rect x="25" y="25" width="50" height="50" stroke="currentColor" strokeDasharray="2,2" fill="none" />
            <circle cx="50" cy="50" r="15" stroke="#FF2A5F" strokeWidth="1" fill="#FF2A5F" fillOpacity="0.2" />
          </svg>

          <div className="absolute top-4 left-4 font-mono-tech text-[10px] text-cyan-300 bg-black/70 p-2 rounded border border-cyan-500/30 space-y-1">
            <p>LAT: 43.6532° N | LON: -79.3832° W</p>
            <p>ALT: 120.4 METERS | HEADING: 142° SE</p>
            <p className="text-amber-400">ANOMALY CONFIDENCE: 98.4%</p>
          </div>
        </div>
      </div>

      {/* Fleet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {drones.map((drone) => (
          <div key={drone.id} className="bg-[#0C101A] border border-slate-800/90 rounded-xl p-5 space-y-3 font-mono-tech text-xs">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-white text-sm">{drone.id}</h4>
                <p className="text-[10px] text-slate-400">{drone.model}</p>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                drone.status === 'EN ROUTE' ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/40' :
                drone.status === 'PATROL' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' :
                'bg-slate-800 text-slate-400'
              }`}>
                {drone.status}
              </span>
            </div>

            <div className="space-y-1 pt-2 text-[11px] text-slate-300">
              <div className="flex justify-between">
                <span>Battery Level:</span>
                <span className="text-cyan-400 font-bold">{drone.battery}%</span>
              </div>
              <div className="flex justify-between">
                <span>Airspeed:</span>
                <span>{drone.speed}</span>
              </div>
              <div className="flex justify-between">
                <span>Target Node:</span>
                <span className="text-slate-400">{drone.target}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
