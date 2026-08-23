import React from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import { MapPin, Clock, CheckCircle2, AlertTriangle, Sparkles, ArrowRight } from "lucide-react";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Color-coded High-tech Severity Pins
const getSeverityPinIcon = (priority = "P2", status = "Reported", color = "#00F0FF") => {
  const isCritical = priority === "P1" || priority === "High";
  const isResolved = status === "Resolved";
  const pinColor = isResolved ? "#10B981" : isCritical ? "#EF4444" : priority === "P2" ? "#F97316" : color;

  return L.divIcon({
    className: "custom-severity-pin",
    html: `
      <div style="
        width: ${isCritical ? "30px" : "26px"};
        height: ${isCritical ? "30px" : "26px"};
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: #0B0F19;
        border: 2.5px solid ${pinColor};
        box-shadow: 0 0 16px ${pinColor}, 0 0 0 ${isCritical ? "5px rgba(239,68,68,0.35)" : "2px rgba(255,255,255,0.1)"};
        position: relative;
        cursor: pointer;
        animation: ${isCritical ? "pulse 2s infinite" : "none"};
      ">
        <div style="
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: ${pinColor};
        "></div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -16],
  });
};

const getDroneStationIcon = () => {
  return L.divIcon({
    className: "custom-drone-station-pin",
    html: `
      <div style="
        width: 34px;
        height: 34px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        background: #061A24;
        border: 2px solid #00F0FF;
        box-shadow: 0 0 18px rgba(0,240,255,0.7), inset 0 0 8px rgba(0,240,255,0.3);
        position: relative;
        cursor: pointer;
        transform: rotate(45deg);
      ">
        <div style="
          transform: rotate(-45deg);
          font-size: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">🛸</div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });
};


const getDeptCenterIcon = (category = "Road Damage / Pothole", color = "#00F0FF", iconEmoji = "🏢") => {
  return L.divIcon({
    className: "custom-dept-center-pin",
    html: `
      <div style="
        width: 26px;
        height: 26px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        background: #0B0F19;
        border: 1.5px solid ${color};
        box-shadow: 0 0 10px ${color}80;
        position: relative;
        cursor: pointer;
      ">
        <span style="font-size: 13px; display: flex; align-items: center; justify-content: center;">${iconEmoji}</span>
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -14],
  });
};

const getMunicipalTeamIcon = (isOccupied, isLate) => {
  const borderColor = isLate ? "#EF4444" : isOccupied ? "#F59E0B" : "#10B981";
  const glowColor = isLate ? "rgba(239,68,68,0.9)" : isOccupied ? "rgba(245,158,11,0.9)" : "rgba(16,185,129,0.9)";
  const iconEmoji = isOccupied ? "🚜" : "🛠️";

  return L.divIcon({
    className: "custom-municipal-team-pin",
    html: `
      <div style="
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: #090D16;
        border: 2.5px solid ${borderColor};
        box-shadow: 0 0 24px ${glowColor}, 0 0 0 4px rgba(245,158,11,0.25);
        position: relative;
        cursor: pointer;
        animation: pulse 2s infinite;
      ">
        <span style="font-size: 22px; display: flex; align-items: center; justify-content: center;">${iconEmoji}</span>
        ${isOccupied ? `
          <div style="
            position: absolute;
            top: -3px;
            right: -3px;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: ${borderColor};
            box-shadow: 0 0 10px ${borderColor};
            border: 2px solid #000;
          "></div>
        ` : ""}
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -24],
  });
};

function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export default function LeafletMap({
  center = [28.6139, 77.209],
  zoom = 13,
  markers = [],
  showHeatmap = false,
  containerStyle = { height: "100%", width: "100%" },
  tileUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  attribution = "&copy; OpenStreetMap contributors &copy; CARTO",
  onMarkerClick = null,
}) {
  return (
    <div style={containerStyle}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%", borderRadius: "16px" }}
      >
        <ChangeView center={center} zoom={zoom} />

        <TileLayer url={tileUrl} attribution={attribution} />

        {/* 15km UAV Outer Patrol Radar Range Layer */}
        {showHeatmap &&
          markers
            .filter((m) => m.position && m.position[0] && m.position[1] && m.data?.type === "DRONE_STATION")
            .map((m, idx) => (
              <Circle
                key={`uav-outer-patrol-${idx}`}
                center={m.position}
                radius={15000}
                pathOptions={{
                  color: "#00F0FF",
                  fillColor: "#00F0FF",
                  fillOpacity: 0.08,
                  weight: 2,
                  dashArray: "6, 6",
                }}
              />
            ))}

        {/* 7.5km Department Center Rapid-Response Service Radius Circles */}
        {showHeatmap &&
          markers
            .filter((m) => m.position && m.position[0] && m.position[1] && m.data?.type === "DEPARTMENT_CENTER")
            .map((m, idx) => (
              <Circle
                key={`dept-center-radius-${idx}`}
                center={m.position}
                radius={7500}
                pathOptions={{
                  color: m.data.color || "#00F0FF",
                  fillColor: m.data.color || "#00F0FF",
                  fillOpacity: 0.12,
                  weight: 2,
                  dashArray: "5, 5",
                }}
              />
            ))}

        {/* Interactive Defect Pins & Drone Station Hubs */}
        {markers && markers.length > 0 ? (
          markers.map((m, i) => {
            const data = m.data || {};
            const isDroneStation = data.type === "DRONE_STATION";
            const isCritical = data.priority === "P1" || data.priority === "High";
            const isResolved = data.status === "Resolved";

            if (data.type === "DEPARTMENT_CENTER") {
              return (
                <Marker
                  key={`dept-center-${i}`}
                  position={m.position}
                  icon={getDeptCenterIcon(data.category, data.color, data.iconEmoji || "🏢")}
                  eventHandlers={{
                    click: () => {
                      if (onMarkerClick && m.data) {
                        onMarkerClick(m.data);
                      }
                    },
                  }}
                >
                  <Popup className="custom-dark-popup">
                    <div className="p-3 font-mono-tech text-xs space-y-2 min-w-[240px] max-w-[280px]">
                      <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: `${data.color}40` }}>
                        <span className="font-extrabold text-xs flex items-center gap-1.5" style={{ color: data.color }}>
                          <span>{data.iconEmoji || "🏢"}</span>
                          <span>{data.code || "DEPT HQ"}</span>
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ backgroundColor: `${data.color}20`, color: data.color, border: `1px solid ${data.color}60` }}>
                          7.5 KM RADIAL COVERAGE
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <h4 className="font-bold text-white text-xs font-sans">
                          {data.name}
                        </h4>
                        <p className="text-[11px] text-slate-300">
                          {data.ward} • {data.zone}
                        </p>
                      </div>

                      {/* Officer In-Charge */}
                      <div className="bg-[#070A10] p-2.5 rounded-xl border border-slate-800 space-y-0.5 text-[11px] pt-1.5">
                        <div className="text-slate-400 text-[10px]">Officer In-Charge:</div>
                        <strong className="text-amber-300 text-xs block">{data.inchargeName}</strong>
                      </div>

                    </div>
                  </Popup>
                </Marker>
              );
            }

            if (isDroneStation) {
              return (
                <Marker
                  key={`drone-st-${i}`}
                  position={m.position}
                  icon={getDroneStationIcon()}
                  eventHandlers={{
                    click: () => {
                      if (onMarkerClick && m.data) {
                        onMarkerClick(m.data);
                      }
                    },
                  }}
                >
                  <Popup className="custom-dark-popup">
                    <div className="p-3.5 font-mono-tech text-xs space-y-2 min-w-[250px] max-w-[280px]">
                      <div className="flex items-center justify-between border-b border-cyan-500/40 pb-2">
                        <span className="font-extrabold text-cyan-400 text-xs flex items-center gap-1.5">
                          <span>🛸</span>
                          <span>{data.code || "UAV DOCK"}</span>
                        </span>
                        <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-400 text-[10px] font-bold">
                          {data.status || "ONLINE"}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-bold text-white text-xs font-sans">
                          {data.name}
                        </h4>
                        <p className="text-[11px] text-cyan-300/80">
                          {data.ward} • {data.assignedUnit}
                        </p>
                      </div>

                      <div className="bg-[#070A10] p-2.5 rounded-lg border border-slate-800 space-y-1 text-[11px]">
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-400">Available UAVs:</span>
                          <span className="text-emerald-400 font-bold">{data.dronesAvailable} Drones Ready</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-400">Active Recon:</span>
                          <span className="text-cyan-400 font-bold">{data.dronesPatrolling} in Flight</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-400">Grid Power:</span>
                          <span className="text-amber-400 font-bold">{data.batteryStatus}</span>
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-400 italic">
                        Launch Range: {data.rangeKm} • {data.launchPad}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            }

            const isMunicipalTeam = data.type === "MUNICIPAL_TEAM";

            if (isMunicipalTeam) {
              const isOccupied = data.status === "occupied";
              const isLate = data.timeMetrics?.isLate;
              const borderColor = isLate ? "#EF4444" : isOccupied ? "#F59E0B" : "#10B981";

              return (
                <Marker
                  key={`muni-team-${i}`}
                  position={m.position}
                  icon={getMunicipalTeamIcon(isOccupied, isLate)}
                  eventHandlers={{
                    click: () => {
                      if (onMarkerClick && m.data) {
                        onMarkerClick(m.data);
                      }
                    },
                  }}
                >
                  <Popup className="custom-dark-popup">
                    <div className="p-3.5 font-mono-tech text-xs space-y-2.5 min-w-[270px] max-w-[310px]">
                      
                      {/* Header */}
                      <div className="flex items-center justify-between border-b pb-2" style={{ borderColor }}>
                        <span className="font-extrabold text-xs flex items-center gap-1.5" style={{ color: borderColor }}>
                          <span>🚜</span>
                          <span>{data.id}</span>
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase" style={{
                          backgroundColor: isLate ? "rgba(239,68,68,0.2)" : isOccupied ? "rgba(245,158,11,0.2)" : "rgba(16,185,129,0.2)",
                          color: borderColor,
                          border: `1px solid ${borderColor}`
                        }}>
                          {isOccupied ? (isLate ? `⚡ LATE BY ${data.timeMetrics?.formattedLate}` : "⚡ ON WORK") : "✅ AVAILABLE"}
                        </span>
                      </div>

                      {/* Team Name & Department */}
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-white text-xs font-sans">
                          {data.name}
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          {data.department}
                        </p>
                      </div>

                      {/* Problem they are solving */}
                      {data.activeJob ? (
                        <div className="bg-[#070A10] p-2.5 rounded-xl border border-slate-800 space-y-1 text-[11px]">
                          <div className="text-[10px] text-amber-400 font-bold uppercase flex items-center gap-1">
                            <span>⚠️ ACTIVE PROBLEM SOLVING:</span>
                          </div>
                          <div className="text-white font-bold font-sans">
                            {data.activeJob.taskTitle || data.activeJob.category}
                          </div>
                          <div className="text-slate-400 text-[10px]">
                            Task ID: <strong className="text-amber-300">{data.activeJob.taskId}</strong> • [{data.activeJob.ward || data.ward}]
                          </div>

                          {/* Time Duration Telemetry */}
                          {data.timeMetrics && (
                            <div className="mt-1 pt-1 border-t border-slate-800/80 space-y-0.5 text-[10px]">
                              <div className="flex justify-between text-slate-300">
                                <span>Elapsed Duration:</span>
                                <strong className="text-white">{data.timeMetrics.formattedElapsed}</strong>
                              </div>
                              <div className="flex justify-between text-slate-300">
                                <span>Allotted SLA:</span>
                                <strong className="text-amber-300">{data.activeJob.allottedHours} Hours</strong>
                              </div>
                              <div className="flex justify-between font-bold" style={{ color: borderColor }}>
                                <span>Status:</span>
                                <span>{data.timeMetrics.isLate ? `Overrun: +${data.timeMetrics.formattedLate}` : `Remaining: ${data.timeMetrics.formattedRemaining}`}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-[#070A10] p-2.5 rounded-xl border border-slate-800 text-[11px] text-emerald-300">
                          Standby at base depot in {data.ward}. Ready for dispatch.
                        </div>
                      )}

                      {/* Crew Lead & Contacts */}
                      <div className="text-[11px] text-slate-300 flex items-center justify-between pt-1 border-t border-slate-800">
                        <span>Lead: <strong>{data.leader}</strong></span>
                        <span className="text-slate-400 font-mono-tech">{data.members?.length || 4} Crew</span>
                      </div>

                    </div>
                  </Popup>
                </Marker>
              );
            }

            return (
              <Marker
                key={i}
                position={m.position}
                icon={getSeverityPinIcon(data.priority, data.status, m.color)}
                eventHandlers={{
                  click: () => {
                    if (onMarkerClick && m.data) {
                      onMarkerClick(m.data);
                    }
                  },
                }}
              >
                <Popup className="custom-dark-popup">
                  <div className="p-3.5 font-mono-tech text-xs space-y-2.5 min-w-[240px] max-w-[280px]">
                    
                    {/* Header: ID + Priority Badge */}
                    <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
                      <span className="font-extrabold text-cyan-400 text-xs">
                        {data.id || `INC-0${i + 1}`}
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          isResolved
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                            : isCritical
                            ? "bg-red-950 text-red-300 border border-red-800"
                            : data.priority === "P2"
                            ? "bg-orange-950 text-orange-300 border border-orange-800"
                            : "bg-yellow-950 text-yellow-300 border border-yellow-800"
                        }`}
                      >
                        {data.priorityLabel || data.priority || "P1 - Critical"}
                      </span>
                    </div>

                    {/* Defect Photo with AI Bounding Badge */}
                    {data.imageUrl && (
                      <div className="relative rounded-lg overflow-hidden h-24 border border-slate-800">
                        <img
                          src={data.imageUrl}
                          alt={data.title}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/85 text-[9px] text-cyan-300 font-bold border border-cyan-500/60">
                          AI BOX ({(data.aiConfidence ? data.aiConfidence * 100 : 96.4).toFixed(1)}%)
                        </span>
                      </div>
                    )}

                    {/* Title & Description */}
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-white text-xs font-sans line-clamp-1">
                        {data.title || data.category}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-sans line-clamp-2">
                        {data.description || "Defect registered in city grid."}
                      </p>
                    </div>

                    {/* Location, Ward, SLA Target */}
                    <div className="space-y-1 text-[11px] text-slate-300 pt-1.5 border-t border-slate-800/80">
                      <div className="flex items-center gap-1 text-slate-400 truncate">
                        <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                        <span className="truncate">{data.address || data.ward || "Sector Coordinates"}</span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] pt-1">
                        <span className="text-emerald-400 font-bold">
                          Status: {data.status || "AI Verified"}
                        </span>
                        <span className="text-cyan-300 font-bold">
                          ⏱ SLA: {data.slaHours || 4}h
                        </span>
                      </div>
                    </div>

                    {/* Quick Inspect Button */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (onMarkerClick && m.data) {
                            onMarkerClick(m.data);
                          }
                        }}
                        className="w-full py-1.5 rounded-lg bg-cyan-950/70 border border-cyan-500/60 hover:bg-cyan-900/60 text-cyan-300 text-[10px] font-extrabold uppercase flex items-center justify-center gap-1 cursor-pointer transition"
                      >
                        <span>Inspect Incident Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                  </div>
                </Popup>
              </Marker>
            );
          })
        ) : (
          <Marker position={center} icon={getSeverityPinIcon("P1", "Reported", "#00F0FF")}>
            <Popup className="custom-dark-popup">
              <div className="p-3 font-mono-tech text-xs text-white">
                <b className="text-cyan-400">NEXinfra Command Node</b>
                <br />
                Central GIS coordinate telemetry center.
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
