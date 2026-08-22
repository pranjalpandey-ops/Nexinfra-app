import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import {
  MapPin,
  Navigation,
  Compass,
  AlertTriangle,
  ShieldCheck,
  Building,
  CheckCircle2,
  Search,
  Phone,
  Layers,
  Sparkles
} from "lucide-react";
import { findNearbySimilarIssues } from "../services/civicDb";
import {
  detectMunicipalWardByCoordinates,
  detectMunicipalWardByText,
  reverseGeocodeAndDetectWard
} from "../services/municipalWardService";

// Custom Draggable High-Tech Pin Icon
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
  const [searchQuery, setSearchQuery] = useState("");
  const [detectedWardInfo, setDetectedWardInfo] = useState(() =>
    detectMunicipalWardByCoordinates(position[0], position[1])
  );

  const debounceTimerRef = useRef(null);

  useEffect(() => {
    if (latitude && longitude) {
      setPosition([latitude, longitude]);
      const nearby = findNearbySimilarIssues(latitude, longitude, category, 200);
      setNearbyCount(nearby.length);
      reverseGeocodeAndDetectWard(latitude, longitude).then((res) => {
        setDetectedWardInfo(res);
      });
    }
  }, [latitude, longitude, category]);

  const handleUpdate = (lat, lng) => {
    setPosition([lat, lng]);
    const nearby = findNearbySimilarIssues(lat, lng, category, 200);
    setNearbyCount(nearby.length);

    // Initial instant estimate
    setDetectedWardInfo(detectMunicipalWardByCoordinates(lat, lng));

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      // Run AI & real-world reverse geocoding
      const resolved = await reverseGeocodeAndDetectWard(lat, lng);
      setDetectedWardInfo(resolved);

      if (onLocationChange) {
        onLocationChange({
          latitude: lat,
          longitude: lng,
          address: resolved.address,
          ward: resolved.ward,
          zone: resolved.zone,
          depot: resolved.depot,
          officer: resolved.officer,
          nearbyCount: nearby.length,
        });
      }
    }, 450);
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

  const handleSearchLocation = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!searchQuery.trim()) return;

    // Search via Nominatim OpenStreetMap for any global city/neighbourhood
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery.trim())}&format=json&limit=1`,
        { headers: { "Accept-Language": "en" } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data[0]) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          handleUpdate(lat, lng);
          setSearchQuery("");
          return;
        }
      }
    } catch (err) {
      console.warn("Search geocoding error:", err);
    }

    // Fallback search keywords in local DB
    const matchedWard = detectMunicipalWardByText(searchQuery);
    if (matchedWard) {
      handleUpdate(matchedWard.centerLat, matchedWard.centerLng);
      setSearchQuery("");
    }
  };

  return (
    <div className="space-y-3 font-mono-tech text-xs">
      
      {/* Top Controls & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-200 font-bold uppercase tracking-wider">
            Spatial Location & Municipal Ward Detector
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

      {/* Quick Location / Sector Search Input */}
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearchLocation(e);
              }
            }}
            placeholder="Type city, neighbourhood, or sector (e.g., Pokhara, Mumbai, Indiranagar, Rohini)..."
            className="w-full bg-[#070A10] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-cyan-400"
          />
        </div>
        <button
          type="button"
          onClick={handleSearchLocation}
          className="px-3 py-2 rounded-xl bg-cyan-950 border border-cyan-500 text-cyan-300 font-bold text-xs hover:bg-cyan-900 transition cursor-pointer shrink-0"
        >
          Find Ward
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
                <strong className="text-cyan-300">Selected Incident Point</strong>
                <br />
                {position[0].toFixed(5)}° N, {position[1].toFixed(5)}° E
                <br />
                <span className="text-amber-300 font-bold">{detectedWardInfo?.ward || detectedWardInfo?.name}</span>
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
          Tip: Drag pin or click map to auto-detect nearest ward
        </div>
      </div>

      {/* Auto-Analyzed Municipal Ward & Sector Zone Inspector Panel */}
      {detectedWardInfo && (
        <div className="p-3.5 rounded-xl bg-[#0C101A] border border-cyan-500/40 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-cyan-400" />
              <span className="text-white font-bold text-xs uppercase tracking-wide">
                Auto-Detected Municipal Ward & Zone
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500 text-emerald-300 text-[10px] font-extrabold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>AUTHENTIC CIVIC JURISDICTION</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-800">
            <div>
              <span className="text-slate-400 block text-[10px]">MUNICIPAL WARD & DISTRICT</span>
              <strong className="text-cyan-300 font-sans text-xs">{detectedWardInfo.ward || detectedWardInfo.name}</strong>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px]">ADMINISTRATIVE CORPORATION</span>
              <strong className="text-slate-200 font-sans text-xs">{detectedWardInfo.zone}</strong>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px]">ZONAL RESPONSE DEPOT</span>
              <span className="text-slate-300 font-sans text-xs">{detectedWardInfo.depot}</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px]">ZONAL OFFICER / DESK</span>
              <span className={`font-sans text-xs ${detectedWardInfo.officer === "Not Available" ? "text-slate-400 italic" : "text-emerald-300 font-bold"}`}>
                {detectedWardInfo.officer || "Not Available"}
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
