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

// Automatically move map when location changes
function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export default function LeafletMap({
  latitude,
  longitude,
  address = "Selected Location",
  zoom = 16,
}) {
  const center =
    latitude && longitude
      ? [latitude, longitude]
      : [28.6139, 77.209]; // Default Delhi

  return (
    <div style={{ height: "260px", width: "100%" }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%", borderRadius: "16px" }}
      >
        <ChangeView center={center} zoom={zoom} />

        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <Marker position={center}>
          <Popup>
            <b>NEXINFRA Incident Location</b>
            <br />
            {address}
            <br />
            <small>
              {latitude?.toFixed(6)}, {longitude?.toFixed(6)}
            </small>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}