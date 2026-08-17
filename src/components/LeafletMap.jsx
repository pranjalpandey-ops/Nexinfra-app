import React from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const getWarningIcon = (color = "#fbbf24") =>
  L.divIcon({
    className: "custom-warning-icon",
    html: `
      <div style="
        width: 22px;
        height: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: rgba(10, 14, 22, 0.8);
        border: 2px solid ${color};
        box-shadow: 0 0 0 4px rgba(255,255,255,0.08), 0 0 12px ${color};
        position: relative;
      ">
        <div style="
          width: 0; height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-bottom: 10px solid ${color};
          transform: rotate(180deg);
          position: absolute;
          top: 4px;
        "></div>
        <div style="
          width: 3px; height: 7px; background: ${color}; position: absolute; top: 8px;
        "></div>
        <div style="
          width: 3px; height: 3px; background: ${color}; border-radius: 50%; position: absolute; bottom: 4px;
        "></div>
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -12],
  });

function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export default function LeafletMap({
  center = [28.6139, 77.209],
  zoom = 13,
  markers = [],
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

        {markers && markers.length > 0 ? (
          markers.map((m, i) => (
            <Marker
              key={i}
              position={m.position}
              icon={getWarningIcon(m.color || "#fbbf24")}
              eventHandlers={{
                click: () => {
                  if (onMarkerClick && m.data) {
                    onMarkerClick(m.data);
                  }
                },
              }}
            >
              {m.popup && <Popup dangerouslySetInnerHTML={{ __html: m.popup }} />}
            </Marker>
          ))
        ) : (
          <Marker position={center}>
            <Popup>
              <b>Hackathon HQ</b>
              <br />
              Project starts here.
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}