import React, { useState } from 'react';
import { MapPin, Navigation, Activity, ShieldAlert, Zap, Layers } from 'lucide-react';

export default function LiveMapView({ onOpenDispatchModal }) {
  const [activeLayer, setActiveLayer] = useState('ALL');
  const [selectedPin, setSelectedPin] = useState(null);

  const pins = [
    { id: 'PIN-1', title: 'Hwy 401, KM 32', type: 'CRITICAL', coords: '43.6532° N, 79.3832° W', note: 'Bridge Cable Fracture', top: '35%', left: '42%' },
    { id: 'PIN-2', title: 'Water Pump Station 04', type: 'WARNING', coords: '43.7001° N, 79.4163° W', note: 'Vibration Anomaly', top: '55%', left: '68%' },
    { id: 'PIN-3', title: 'UAV-ALPHA-09 Active', type: 'DRONE', coords: '43.6620° N, 79.3980° W', note: 'En Route to Target', top: '30%', left: '50%' },
    { id: 'PIN-4', title: 'Main & 5th Ave Substation', type: 'NORMAL', coords: '43.6420° N, 79.3780° W', note: 'Grid Nominal', top: '70%', left: '30%' },
  ];

  return (
    <div className="flex-1 bg-[#070A10] text-slate-100 p-6 space-y-6 font-sans flex flex-col justify-between overflow-y-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white">Geospatial Infrastructure Live Map</h1>
          <p className="text-xs font-mono-tech text-cyan-400 mt-0.5">Real-time Telemetry Grid & Active UAV Positioning</p>
        </div>

        <div className="flex items-center gap-2 font-mono-tech text-xs">
          <button
            onClick={onOpenDispatchModal}
            className="px-4 py-2 rounded bg-cyan-400 text-black font-bold uppercase cyan-glow-sm cursor-pointer"
          >
            Dispatch UAV to Pin
          </button>
        </div>
      </div>

      {/* Map Interactive Canvas Frame */}
      <div className="relative w-full h-[520px] bg-[#0A0E1A] border border-slate-800 rounded-xl overflow-hidden bg-cyber-grid-dense shadow-2xl flex items-center justify-center">
        
        {/* Map Grid Radar Circles */}
        <div className="absolute w-[600px] h-[600px] border border-cyan-500/10 rounded-full animate-ping pointer-events-none" />
        <div className="absolute w-[400px] h-[400px] border border-cyan-500/20 rounded-full pointer-events-none" />
        <div className="absolute w-[200px] h-[200px] border border-cyan-500/30 rounded-full pointer-events-none" />

        {/* Radar Sweep Line */}
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 via-transparent to-transparent animate-spin duration-10000 pointer-events-none origin-center" />

        {/* Overlay Pins */}
        {pins.map((pin) => (
          <div
            key={pin.id}
            onClick={() => setSelectedPin(pin)}
            style={{ top: pin.top, left: pin.left }}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
          >
            <div className={`relative flex items-center justify-center ${
              pin.type === 'CRITICAL' ? 'text-rose-500' :
              pin.type === 'WARNING' ? 'text-amber-400' :
              pin.type === 'DRONE' ? 'text-cyan-400' : 'text-emerald-400'
            }`}>
              <span className={`absolute w-8 h-8 rounded-full opacity-75 animate-ping ${
                pin.type === 'CRITICAL' ? 'bg-rose-500' :
                pin.type === 'WARNING' ? 'bg-amber-400' :
                pin.type === 'DRONE' ? 'bg-cyan-400' : 'bg-emerald-400'
              }`} />
              <div className="w-8 h-8 rounded-full bg-[#070A10] border-2 border-current flex items-center justify-center font-mono-tech text-xs font-bold cyan-glow-sm z-10">
                <MapPin className="w-4 h-4" />
              </div>
            </div>

            {/* Hover Tooltip */}
            <div className="absolute left-1/2 -translate-x-1/2 top-10 hidden group-hover:block bg-[#070A10] border border-cyan-500/40 p-2.5 rounded shadow-xl font-mono-tech text-[10px] w-48 z-30">
              <p className="font-bold text-white">{pin.title}</p>
              <p className="text-cyan-400">{pin.coords}</p>
              <p className="text-slate-400 mt-1">{pin.note}</p>
            </div>
          </div>
        ))}

        {/* Selected Pin Details Box */}
        {selectedPin && (
          <div className="absolute bottom-4 left-4 bg-[#070A10]/95 border border-cyan-400 p-4 rounded-lg font-mono-tech text-xs z-40 max-w-sm space-y-2 cyan-glow-sm">
            <div className="flex justify-between items-center text-cyan-400 font-bold">
              <span>{selectedPin.title}</span>
              <button onClick={() => setSelectedPin(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <p className="text-slate-300">Coordinates: {selectedPin.coords}</p>
            <p className="text-slate-400 text-[11px]">{selectedPin.note}</p>
            <button 
              onClick={onOpenDispatchModal}
              className="w-full py-1.5 rounded bg-cyan-400 text-black font-bold uppercase text-[10px] mt-2"
            >
              Direct Telemetry Stream ↗
            </button>
          </div>
        )}

      </div>

    </div>
  );
}
