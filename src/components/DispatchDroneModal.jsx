import React, { useState, useEffect } from 'react';
import { X, Plane, Radio, CheckCircle, Navigation, ShieldAlert, Cpu } from 'lucide-react';

export default function DispatchDroneModal({ isOpen, onClose }) {
  const [targetSector, setTargetSector] = useState('Sector 4 - Hwy 401, KM 32');
  const [droneUnit, setDroneUnit] = useState('UAV-ALPHA-09 (LiDAR + Thermal)');
  const [dispatchStatus, setDispatchStatus] = useState('idle'); // idle -> dispatching -> enroute
  const [logs, setLogs] = useState([]);

  if (!isOpen) return null;

  const handleLaunch = () => {
    setDispatchStatus('dispatching');
    setLogs(['[00:01] Initializing MAVLink flight telemetry...']);

    setTimeout(() => {
      setLogs(prev => [...prev, '[00:03] Calibrating 4K LiDAR & FLIR Thermal sensors...']);
    }, 800);

    setTimeout(() => {
      setLogs(prev => [...prev, '[00:05] Waypoint locked: LAT 43.6532, LON -79.3832']);
    }, 1600);

    setTimeout(() => {
      setLogs(prev => [...prev, '[00:07] Motors armed. Takeoff sequence initiated.']);
      setDispatchStatus('enroute');
    }, 2400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0B0F19] border border-cyan-500/40 rounded-xl p-6 max-w-lg w-full cyan-glow-lg relative space-y-5">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center text-cyan-400 cyan-glow-sm">
            <Plane className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-heading">
              Dispatch Autonomous UAV
            </h3>
            <p className="text-xs text-cyan-400 font-mono-tech uppercase">
              Tactical Aerial Inspection Control
            </p>
          </div>
        </div>

        {/* Form Selection */}
        <div className="space-y-4 font-mono-tech text-xs">
          
          <div className="space-y-1.5">
            <label className="block text-slate-300">Target Coordinates / Sector</label>
            <select
              value={targetSector}
              onChange={(e) => setTargetSector(e.target.value)}
              className="w-full bg-[#070A10] border border-slate-800 rounded p-2.5 text-white focus:border-cyan-400 focus:outline-none"
            >
              <option value="Sector 4 - Hwy 401, KM 32">Sector 4 - Hwy 401, KM 32 (Fracture Anomaly)</option>
              <option value="Sector 7 - Bridge Pillar B4">Sector 7 - Bridge Pillar B4 (Stress Anomaly)</option>
              <option value="Sector 9 - Water Pump Station 04">Sector 9 - Water Pump Station 04 (Vibration Alert)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-slate-300">Available UAV Unit</label>
            <select
              value={droneUnit}
              onChange={(e) => setDroneUnit(e.target.value)}
              className="w-full bg-[#070A10] border border-slate-800 rounded p-2.5 text-white focus:border-cyan-400 focus:outline-none"
            >
              <option value="UAV-ALPHA-09 (LiDAR + Thermal)">UAV-ALPHA-09 (LiDAR + Thermal Sensor Array)</option>
              <option value="UAV-BETA-04 (High-Speed Recon)">UAV-BETA-04 (High-Speed Optical Recon)</option>
              <option value="UAV-GAMMA-12 (Structural Sonar)">UAV-GAMMA-12 (Structural Sonar Inspection)</option>
            </select>
          </div>

          {/* Telemetry Console Output */}
          {logs.length > 0 && (
            <div className="bg-[#05070D] border border-slate-800 p-3 rounded text-[11px] text-cyan-300 space-y-1 max-h-36 overflow-y-auto font-mono-tech">
              {logs.map((log, index) => (
                <p key={index}>{log}</p>
              ))}
            </div>
          )}

        </div>

        {/* Modal Buttons */}
        <div className="flex justify-end gap-3 pt-2 font-mono-tech text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border border-slate-800 bg-[#070A10] text-slate-300 hover:text-white"
          >
            CANCEL
          </button>

          {dispatchStatus === 'enroute' ? (
            <div className="px-4 py-2 rounded bg-emerald-950 border border-emerald-500/50 text-emerald-400 font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 animate-bounce" />
              <span>UAV EN ROUTE TO TARGET</span>
            </div>
          ) : (
            <button
              onClick={handleLaunch}
              disabled={dispatchStatus === 'dispatching'}
              className="px-5 py-2 rounded bg-[#00F0FF] hover:bg-cyan-300 text-black font-bold flex items-center gap-2 uppercase cyan-glow-sm"
            >
              <Navigation className="w-4 h-4" />
              <span>{dispatchStatus === 'dispatching' ? 'ARMING UAV...' : 'INITIATE LAUNCH'}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
