import React, { useEffect, useState } from "react";
import {
  Search,
  AlertTriangle,
  LayoutDashboard,
  Map,
  Bell,
  FileText,
  ArrowRight,
  MapPin,
} from "lucide-react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import { subscribeToComplaints } from "../services/getComplaints";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const redIcon = new L.Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  className: "marker-red",
});

const orangeIcon = new L.Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  className: "marker-orange",
});

const greenIcon = new L.Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  className: "marker-green",
});

export default function CitySyncMapView({
  setActivePage,
  viewMode = "auto",
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const isPhoneFrame = viewMode === "phone";

  useEffect(() => {
    const unsubscribe = subscribeToComplaints((data) => {
      setComplaints(data);

      if (!selectedComplaint && data.length > 0) {
        setSelectedComplaint(data[0]);
      }
    });

    return unsubscribe;
  }, []);

  const filteredComplaints = complaints.filter((c) => {
    const q = searchQuery.toLowerCase();

    return (
      c.title?.toLowerCase().includes(q) ||
      c.category?.toLowerCase().includes(q) ||
      c.address?.toLowerCase().includes(q)
    );
  });

  const mapCenter =
    filteredComplaints.length &&
    filteredComplaints[0].latitude &&
    filteredComplaints[0].longitude
      ? [filteredComplaints[0].latitude, filteredComplaints[0].longitude]
      : [28.6139, 77.209];

  const markerForPriority = (priority) => {
    if (priority === "High") return redIcon;
    if (priority === "Medium") return orangeIcon;
    return greenIcon;
  };

  const openIncident = () => {
    localStorage.setItem(
      "selectedComplaint",
      JSON.stringify(selectedComplaint)
    );

    setActivePage("incident-detail");
  };

  return (
    <div className="min-h-screen bg-[#090C13] text-slate-100 flex justify-center py-6 px-4">

      <div
        className={`w-full ${
          isPhoneFrame
            ? "max-w-md bg-[#0D121D] border border-slate-800 rounded-2xl overflow-hidden min-h-[780px]"
            : "max-w-7xl bg-[#0D121D] border border-slate-800 rounded-2xl p-6 min-h-[780px]"
        }`}
      >

        {/* Header */}

        <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">

          <div>

            <h1 className="text-xl font-bold text-cyan-400">
              CitySync AI GIS Radar
            </h1>

            <p className="text-xs text-slate-400">
              Live Firestore Incident Map
            </p>

          </div>

          <button
            onClick={() => setActivePage("report-issue")}
            className="px-4 py-2 bg-cyan-400 text-black rounded-xl font-bold"
          >
            + REPORT
          </button>

        </div>

        {/* Search */}

        <div className="mb-4 flex items-center gap-2 bg-[#070A12] border border-slate-800 rounded-xl px-3 py-2">

          <Search className="w-4 h-4 text-slate-400" />

          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search incident..."
            className="bg-transparent flex-1 outline-none text-white"
          />

        </div>

        <div className="grid lg:grid-cols-12 gap-6">

          {/* MAP */}

          <div className="lg:col-span-8 h-[600px] rounded-2xl overflow-hidden border border-slate-800">

            <MapContainer
              center={mapCenter}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
            >

              <TileLayer
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />

              {filteredComplaints.map((c) => {
                if (!c.latitude || !c.longitude) return null;

                return (
                  <Marker
                    key={c.id}
                    position={[c.latitude, c.longitude]}
                    icon={markerForPriority(c.priority)}
                    eventHandlers={{
                      click: () => setSelectedComplaint(c),
                    }}
                  >
                    <Popup>

                      <div className="space-y-2 min-w-[180px]">

                        <strong>{c.title}</strong>

                        <p>{c.category}</p>

                        <p>{c.priority} Priority</p>

                        {c.imageUrl && (
                          <img
                            src={c.imageUrl}
                            alt="Complaint"
                            className="rounded-lg w-full"
                          />
                        )}

                      </div>

                    </Popup>
                  </Marker>
                );
              })}

            </MapContainer>

          </div>

          {/* RIGHT PANEL */}

          <div className="lg:col-span-4 bg-[#0C101A] border border-slate-800 rounded-2xl p-6 flex flex-col h-[600px]">

            {selectedComplaint ? (
              <>
                {/* Selected Complaint */}

                <div className="pb-5 border-b border-slate-800 space-y-4">

                  <div className="flex items-center gap-3">

                    <div className="w-12 h-12 rounded-xl bg-rose-950 border border-rose-500 flex items-center justify-center">
                      <AlertTriangle className="text-rose-400" />
                    </div>

                    <div>

                      <h3 className="text-lg font-bold">
                        {selectedComplaint.title}
                      </h3>

                      <p className="text-rose-400 text-xs">
                        ID: {selectedComplaint.id}
                      </p>

                    </div>

                  </div>

                  {selectedComplaint.imageUrl ? (
                    <img
                      src={selectedComplaint.imageUrl}
                      alt="Complaint"
                      className="rounded-xl w-full h-40 object-cover border border-slate-700"
                    />
                  ) : (
                    <div className="h-40 rounded-xl bg-slate-900 flex items-center justify-center text-slate-500">
                      No Image
                    </div>
                  )}

                  <div className="space-y-2 text-sm">

                    <div className="flex items-center gap-2">

                      <MapPin className="w-4 h-4 text-cyan-400" />

                      <span>{selectedComplaint.address}</span>

                    </div>

                    <div className="flex justify-between">

                      <span className="text-slate-400">
                        Priority
                      </span>

                      <span className="text-amber-400 font-bold">
                        {selectedComplaint.priority}
                      </span>

                    </div>

                    <div className="flex justify-between">

                      <span className="text-slate-400">
                        Status
                      </span>

                      <span className="text-cyan-400 font-bold">
                        {selectedComplaint.status}
                      </span>

                    </div>

                  </div>

                  <button
                    onClick={openIncident}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-300 text-black font-bold flex justify-center items-center gap-2 hover:scale-[1.02] transition"
                  >

                    Inspect Incident

                    <ArrowRight className="w-4 h-4" />

                  </button>

                </div>

                {/* ALL COMPLAINTS */}

                <div className="flex-1 overflow-y-auto mt-5">

                  <div className="flex justify-between items-center mb-4">

                    <h4 className="text-sm font-bold text-cyan-400 uppercase">
                      Live Complaints
                    </h4>

                    <span className="text-xs bg-cyan-950 text-cyan-300 px-2 py-1 rounded-lg">
                      {filteredComplaints.length}
                    </span>

                  </div>

                  <div className="space-y-3">

                    {filteredComplaints.map((complaint) => (
                      <div
                        key={complaint.id}
                        onClick={() => setSelectedComplaint(complaint)}
                        className={`cursor-pointer rounded-xl border p-3 transition ${
                          selectedComplaint.id === complaint.id
                            ? "border-cyan-400 bg-cyan-950/20"
                            : "border-slate-700 bg-[#070A12] hover:border-cyan-400 hover:bg-slate-900"
                        }`}
                      >

                        <div className="flex justify-between items-start">

                          <div>

                            <h5 className="font-semibold text-white text-sm">
                              {complaint.title}
                            </h5>

                            <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                              {complaint.address}
                            </p>

                          </div>

                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              complaint.priority === "High"
                                ? "bg-red-900 text-red-300"
                                : complaint.priority === "Medium"
                                ? "bg-amber-900 text-amber-300"
                                : "bg-green-900 text-green-300"
                            }`}
                          >
                            {complaint.priority}
                          </span>

                        </div>

                      </div>
                    ))}

                    {filteredComplaints.length === 0 && (
                      <div className="text-center text-slate-500 py-8">
                        No complaints found.
                      </div>
                    )}

                  </div>

                </div>

              </>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">
                No incidents found.
              </div>
            )}

          </div>

        </div>

        {/* Mobile Navigation */}

        {isPhoneFrame && (
          <div className="grid grid-cols-4 border-t border-slate-800 mt-4">

            <button
              onClick={() => setActivePage("dashboard")}
              className="py-3 flex flex-col items-center text-xs"
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </button>

            <button className="py-3 flex flex-col items-center text-xs bg-cyan-400 text-black">
              <Map className="w-5 h-5" />
              Map
            </button>

            <button
              onClick={() => setActivePage("maintenance")}
              className="py-3 flex flex-col items-center text-xs"
            >
              <Bell className="w-5 h-5" />
              Alerts
            </button>

            <button
              onClick={() => setActivePage("report-issue")}
              className="py-3 flex flex-col items-center text-xs"
            >
              <FileText className="w-5 h-5" />
              Reports
            </button>

          </div>
        )}

      </div>

      <style>{`
        .marker-red img{filter:hue-rotate(-35deg) saturate(3);}
        .marker-orange img{filter:hue-rotate(5deg) saturate(2);}
        .marker-green img{filter:hue-rotate(90deg) saturate(2);}
      `}</style>

    </div>
  );
}