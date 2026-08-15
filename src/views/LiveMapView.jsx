import React, { useState } from 'react';
import { MapPin, Navigation, Activity, ShieldAlert, Zap, Layers } from 'lucide-react';
import LeafletMap from '../components/LeafletMap';

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

      {/* Map Interactive Canvas Frame (Leaflet) */}
      <div className="relative w-full h-[520px] bg-[#0A0E1A] border border-slate-800 rounded-xl overflow-hidden bg-cyber-grid-dense shadow-2xl flex items-center justify-center">
        <LeafletMap />
      </div>

    </div>
  );
}
