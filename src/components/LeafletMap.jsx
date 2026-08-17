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

        {/* Heatmap / High-Density Grievance Clusters Layer */}
        {showHeatmap &&
          markers
            .filter((m) => m.position && m.position[0] && m.position[1])
            .map((m, idx) => (
              <React.Fragment key={`heat-${idx}`}>
                <Circle
                  center={m.position}
                  radius={450}
                  pathOptions={{
                    color: m.data?.priority === "P1" ? "#EF4444" : "#00F0FF",
                    fillColor: m.data?.priority === "P1" ? "#EF4444" : "#00F0FF",
                    fillOpacity: 0.22,
                    weight: 1,
                  }}
                />
                <Circle
                  center={m.position}
                  radius={180}
                  pathOptions={{
                    color: m.data?.priority === "P1" ? "#EF4444" : "#00F0FF",
                    fillColor: m.data?.priority === "P1" ? "#EF4444" : "#00F0FF",
                    fillOpacity: 0.45,
                    weight: 0,
                  }}
                />
              </React.Fragment>
            ))}

        {/* Interactive Defect Pins */}
        {markers && markers.length > 0 ? (
          markers.map((m, i) => {
            const data = m.data || {};
            const isCritical = data.priority === "P1" || data.priority === "High";
            const isResolved = data.status === "Resolved";

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
          <Marker position={center}>
            <Popup className="custom-dark-popup">
              <div className="p-3 font-mono-tech text-xs text-white">
                <b className="text-cyan-400">NEXinfra Command Node</b>
                <br />
                Central GIS coordinate center.
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
