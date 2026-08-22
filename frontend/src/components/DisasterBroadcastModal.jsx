import React, { useState, useEffect } from "react";
import {
  X,
  Flame,
  Radio,
  Send,
  PhoneCall,
  MapPin,
  Users,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Compass,
  Layers,
  Sparkles,
  Volume2,
  FileText
} from "lucide-react";

import {
  getCitizensInDisasterRadius,
  executeLevel5DisasterBroadcast,
  getDisasterBroadcastLogs
} from "../services/disasterAlertBroadcastService";

export default function DisasterBroadcastModal({
  isOpen,
  onClose,
  initialIncident,
  user
}) {
  if (!isOpen) return null;

  const [disasterType, setDisasterType] = useState(
    initialIncident?.category || "Catastrophic Gas Main Breach & Toxic Plume"
  );
  const [epicenterLat, setEpicenterLat] = useState(
    initialIncident?.latitude || 28.6220
  );
  const [epicenterLng, setEpicenterLng] = useState(
    initialIncident?.longitude || 77.2140
  );
  const [epicenterLocation, setEpicenterLocation] = useState(
    initialIncident?.address || "Sector 18 Ward - Main Commercial Radial"
  );
  const [radiusKm, setRadiusKm] = useState(1.5);
  const [shelterLocation, setShelterLocation] = useState(
    "Municipal High School Safe Center - Sector 12"
  );
  const [customMessage, setCustomMessage] = useState("");

  const [targetedCitizens, setTargetedCitizens] = useState([]);
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastProgress, setBroadcastProgress] = useState(0);
  const [broadcastResult, setBroadcastResult] = useState(null);
  const [activeTab, setActiveTab] = useState("broadcast"); // broadcast | logs

  // Re-calculate geofenced targets whenever Lat/Lng or Radius changes
  useEffect(() => {
    const list = getCitizensInDisasterRadius(epicenterLat, epicenterLng, radiusKm);
    setTargetedCitizens(list);
  }, [epicenterLat, epicenterLng, radiusKm]);

  // Update default message template
  useEffect(() => {
    const defaultMsg = `🚨 [NEXINFRA LEVEL 5 DISASTER WARNING]: Severe ${disasterType.toUpperCase()} detected at ${epicenterLocation}. Mandatory Evacuation in progress for ${radiusKm}km perimeter. Immediate Evacuation to Safe Zone: ${shelterLocation}. Emergency Helplines: 112 / 108. Avoid affected road spans.`;
    setCustomMessage(defaultMsg);
  }, [disasterType, epicenterLocation, radiusKm, shelterLocation]);

  const handleStartBroadcast = async () => {
    if (targetedCitizens.length === 0) {
      if (!confirm("No registered numbers found in this exact radius. Broadcast to general emergency gateway anyway?")) {
        return;
      }
    }

    setBroadcasting(true);
    setBroadcastProgress(15);

    const interval = setInterval(() => {
      setBroadcastProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 25;
      });
    }, 400);

    setTimeout(async () => {
      clearInterval(interval);
      setBroadcastProgress(100);

      const res = await executeLevel5DisasterBroadcast({
        disasterTitle: `LEVEL 5 DISASTER: ${disasterType}`,
        disasterType,
        epicenterLat,
        epicenterLng,
        epicenterLocation,
        radiusKm,
        shelterLocation,
        customMessage,
        dispatchedBy: user?.email || "National Disaster Command Authority"
      });

      setBroadcasting(false);
      setBroadcastResult(res.broadcast);
    }, 2000);
  };

  const broadcastLogs = getDisasterBroadcastLogs();

  return (
    <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0B0F19] border border-red-500/60 rounded-2xl max-w-4xl w-full p-6 sm:p-8 cyan-glow-lg relative space-y-6 max-h-[92vh] flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-red-950/90 border border-red-500 flex items-center justify-center text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.5)]">
              <Flame className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white font-heading flex items-center gap-2.5">
                <span>Level 5 Disaster Early Warning & SMS Broadcast Software</span>
                <span className="px-2.5 py-0.5 rounded-full bg-red-950 border border-red-500 text-red-300 text-xs font-mono-tech uppercase font-bold animate-pulse">
                  CRITICAL DEFENSE ACTIVE
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono-tech">
                Spatial Radius Geofencing • Instant Multi-Channel Cellular Broadcast to Registered Numbers
              </p>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-3 font-mono-tech text-xs border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab("broadcast")}
            className={`px-4 py-2 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "broadcast"
                ? "bg-red-950 border border-red-500 text-red-300 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Emergency Broadcast Dispatcher</span>
          </button>

          <button
            onClick={() => setActiveTab("logs")}
            className={`px-4 py-2 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "logs"
                ? "bg-cyan-950 border border-cyan-500 text-cyan-300 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Disaster Broadcast History ({broadcastLogs.length})</span>
          </button>
        </div>

        {/* Tab 1: Broadcast Dispatcher */}
        {activeTab === "broadcast" && (
          <div className="flex-1 overflow-y-auto space-y-5 pr-1 font-mono-tech text-xs">
            
            {/* Disaster Configuration Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div>
                <label className="block mb-1.5 text-slate-300 font-bold uppercase">
                  Disaster / Catastrophe Classification
                </label>
                <select
                  value={disasterType}
                  onChange={(e) => setDisasterType(e.target.value)}
                  className="w-full bg-[#070A12] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-red-400"
                >
                  <option value="Catastrophic Gas Main Breach & Toxic Plume">
                    ☣️ Catastrophic Gas Main Breach & Toxic Plume
                  </option>
                  <option value="Flash Inundation & Hydrostatic Dam Failure">
                    🌊 Flash Inundation & Hydrostatic Dam Failure
                  </option>
                  <option value="Major Structural Pier Shear & Flyover Collapse">
                    🏗️ Major Structural Pier Shear & Flyover Collapse
                  </option>
                  <option value="Subsurface Power Grid Arc Explosion">
                    ⚡ Subsurface Power Grid Arc Explosion
                  </option>
                  <option value="Severe Hazardous Chemical Spill">
                    🧪 Severe Hazardous Chemical Spill
                  </option>
                </select>
              </div>

              <div>
                <label className="block mb-1.5 text-slate-300 font-bold uppercase">
                  Epicenter Spatial Coordinates & Ward
                </label>
                <input
                  type="text"
                  value={epicenterLocation}
                  onChange={(e) => setEpicenterLocation(e.target.value)}
                  className="w-full bg-[#070A12] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-red-400"
                />
              </div>

            </div>

            {/* Radius Slider & Target Metrics Card */}
            <div className="p-4 rounded-xl bg-[#070A12] border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <span className="font-bold text-white uppercase flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-cyan-400" />
                    <span>Emergency Warning & Evacuation Radius</span>
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Spatial perimeter around epicenter to receive forced cellular alert
                  </p>
                </div>

                <div className="px-3.5 py-1.5 rounded-lg bg-red-950/80 border border-red-500 text-red-300 font-extrabold text-sm self-start sm:self-auto">
                  {radiusKm} KM RADIUS ({(radiusKm * 1000).toLocaleString()} Meters)
                </div>
              </div>

              <input
                type="range"
                min="0.5"
                max="8.0"
                step="0.25"
                value={radiusKm}
                onChange={(e) => setRadiusKm(parseFloat(e.target.value))}
                className="w-full accent-red-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />

              {/* Geofence Detection Summary */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Users className="w-4 h-4" />
                  <span>{targetedCitizens.length} Registered Citizen Mobile Numbers Geofenced in Radius</span>
                </div>

                <span className="text-slate-400">
                  Gateway: National Multi-Carrier Emergency Telephony Cell (GSM / LTE Broadcast)
                </span>
              </div>
            </div>

            {/* List of Registered Numbers to Receive Alert */}
            <div className="space-y-2">
              <label className="block text-slate-300 font-bold uppercase">
                Geofenced Recipient Registry ({targetedCitizens.length} Targeted Numbers)
              </label>

              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                {targetedCitizens.length === 0 ? (
                  <div className="p-3 rounded-lg bg-[#070A10] border border-slate-800 text-slate-400 text-center">
                    No registered citizens within {radiusKm}km radius. Increase radius to target wider municipal perimeter.
                  </div>
                ) : (
                  targetedCitizens.map((c) => (
                    <div
                      key={c.id}
                      className="p-2.5 rounded-lg bg-[#070A10] border border-slate-800 flex items-center justify-between text-[11px]"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-white">{c.name}</span>
                        <span className="text-cyan-400 font-bold font-mono">{c.phone}</span>
                        <span className="text-slate-400">({c.ward})</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-red-400 font-bold">
                          {c.distanceKm} km from epicenter
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-bold">
                          READY FOR SMS
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Shelter & Message Template */}
            <div className="space-y-3">
              <div>
                <label className="block mb-1.5 text-slate-300 font-bold uppercase">
                  Designated Emergency Evacuation Shelter / Safe Relief Point
                </label>
                <input
                  type="text"
                  value={shelterLocation}
                  onChange={(e) => setShelterLocation(e.target.value)}
                  className="w-full bg-[#070A12] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-red-400"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-slate-300 font-bold uppercase">
                  Emergency Broadcast Message Body (Dispatched to Phones via Cellular Network)
                </label>
                <textarea
                  rows={3}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full bg-[#070A12] border border-red-500/50 rounded-xl p-3 text-white focus:outline-none focus:border-red-400 resize-none font-sans text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Broadcast Transmission Progress */}
            {broadcasting && (
              <div className="p-4 rounded-xl bg-red-950/50 border border-red-500 space-y-2 animate-pulse">
                <div className="flex items-center justify-between text-xs font-bold text-red-300">
                  <span className="flex items-center gap-2">
                    <Radio className="w-4 h-4 animate-spin" />
                    <span>TRANSMITTING LEVEL 5 DISASTER WARNING TO REGISTERED CELLULAR GATEWAY...</span>
                  </span>
                  <span>{broadcastProgress}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-red-500 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${broadcastProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Success Report */}
            {broadcastResult && (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Broadcast Dispatched Successfully to {broadcastResult.totalTargetedCount} Citizens!</span>
                </div>
                <div className="text-slate-300">
                  Broadcast ID: <strong className="text-white">{broadcastResult.id}</strong> • Delivery Rate: <strong className="text-emerald-400">{broadcastResult.deliverySuccessRate}</strong> • Geofenced Perimeter: <strong className="text-white">{broadcastResult.evacuationRadiusKm} km</strong>
                </div>
              </div>
            )}

            {/* Trigger Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleStartBroadcast}
                disabled={broadcasting}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-500 to-red-600 text-white font-extrabold text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(239,68,68,0.6)] hover:from-red-500 hover:to-rose-400 cursor-pointer active:scale-95 transition disabled:opacity-60"
              >
                <Flame className="w-5 h-5" />
                <span>{broadcasting ? "BROADCASTING TO MOBILE CELLULAR NETWORK..." : "🚨 EXECUTE LEVEL 5 DISASTER WARNING BROADCAST"}</span>
              </button>
            </div>

          </div>
        )}

        {/* Tab 2: Broadcast History Logs */}
        {activeTab === "logs" && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 font-mono-tech text-xs">
            {broadcastLogs.length === 0 ? (
              <div className="text-center py-16 text-slate-400 space-y-2">
                <ShieldAlert className="w-10 h-10 text-slate-600 mx-auto" />
                <p>No historical disaster broadcasts recorded. All municipal sectors normal.</p>
              </div>
            ) : (
              broadcastLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-xl bg-[#070A12] border border-red-500/40 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-red-400 text-sm">
                      {log.disasterTitle}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold text-[10px]">
                      {log.deliverySuccessRate} DELIVERED
                    </span>
                  </div>

                  <p className="text-slate-300 font-sans text-xs">
                    {log.message}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                    <div>
                      📍 Epicenter: {log.epicenter?.location} • Radius: {log.evacuationRadiusKm}km • Target Recipient Count: {log.totalTargetedCount}
                    </div>
                    <div>
                      Dispatched: {new Date(log.dispatchedAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
}
