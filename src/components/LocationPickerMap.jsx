import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { MapPin, Navigation, Compass, AlertTriangle, ShieldCheck } from "lucide-react";
import { findNearbySimilarIssues } from "../services/civicDb";

// Custom Draggable Pin Icon
const getDraggablePinIcon = () =>
  L.divIcon({
    className: "custom-location-pin",
    html: `
      <div style="
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: #00F0FF;
        border: 3px solid #000;
        box-shadow: 0 0 15px #00F0FF, 0 0 0 4px rgba(0,240,255,0.3);
        position: relative;
        cursor: grab;
      ">
        <div style="width: 10px; height: 10px; background: #000; border-radius: 50%;"></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationPickerMap({
  latitude,
  longitude,
  category,
  onLocationChange,
}) {
  const [position, setPosition] = useState(
    latitude && longitude ? [latitude, longitude] : [28.6139, 77.2090]
  );
  const [nearbyCount, setNearbyCount] = useState(0);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (latitude && longitude) {
      setPosition([latitude, longitude]);
      const nearby = findNearbySimilarIssues(latitude, longitude, category, 200);
      setNearbyCount(nearby.length);
    }
  }, [latitude, longitude, category]);

  const handleUpdate = async (lat, lng) => {
    setPosition([lat, lng]);
    const nearby = findNearbySimilarIssues(lat, lng, category, 200);
    setNearbyCount(nearby.length);

    let address = `${lat.toFixed(5)}° N, ${lng.toFixed(5)}° E`;
    let ward = "Central District - Ward 4";

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await response.json();
      if (data && data.display_name) {
        address = data.display_name.split(",").slice(0, 3).join(",");
      }
    } catch (err) {
      console.log("Geocoding fallback:", err);
    }

    if (onLocationChange) {
      onLocationChange({
        latitude: lat,
        longitude: lng,
        address,
        ward,
        nearbyCount: nearby.length,
      });
    }
  };

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        handleUpdate(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        setIsLocating(false);
        alert("Location access denied. Please click on the map to set location.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-3 font-mono-tech text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-200 font-bold uppercase tracking-wider">
            Spatial Location & Ward Selection
          </span>
        </div>

        <button
          type="button"
          onClick={handleDetectGPS}
          disabled={isLocating}
          className="px-3 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/70 text-cyan-300 hover:bg-cyan-900/60 font-bold flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <Navigation className={`w-3.5 h-3.5 ${isLocating ? "animate-spin" : ""}`} />
          <span>{isLocating ? "Detecting GPS..." : "📍 Detect My Location"}</span>
        </button>
      </div>

      {/* Embedded Leaflet Map with Isolated Stacking Context */}
      <div className="relative isolate z-0 h-56 w-full rounded-xl overflow-hidden border border-slate-800 bg-[#070A10]">
        <MapContainer
          center={position}
          zoom={14}
          style={{ height: "100%", width: "100%", zIndex: 1 }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution="&copy; OpenStreetMap contributors &copy; CARTO"
          />
          <MapClickHandler onLocationSelect={handleUpdate} />

          <Marker
            position={position}
            icon={getDraggablePinIcon()}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const pos = marker.getLatLng();
                handleUpdate(pos.lat, pos.lng);
              },
            }}
          >
            <Popup>
              <div className="font-mono-tech text-xs p-1">
                <strong>Selected Incident Point</strong>
                <br />
                {position[0].toFixed(5)}, {position[1].toFixed(5)}
              </div>
            </Popup>
          </Marker>
        </MapContainer>

        {/* Proximity Alert Indicator */}
        {nearbyCount > 0 && (
          <div className="absolute top-2 left-2 z-[400] px-3 py-1.5 rounded-lg bg-amber-950/90 border border-amber-500 text-amber-300 font-bold text-[11px] backdrop-blur-md shadow-lg flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>{nearbyCount} Similar issue(s) reported within 200m!</span>
          </div>
        )}

        <div className="absolute bottom-2 right-2 z-[400] px-2.5 py-1 rounded bg-black/80 text-[10px] text-slate-300 backdrop-blur-sm border border-slate-800">
          Tip: Drag pin or click map to reposition
        </div>
      </div>
    </div>
  );
}
