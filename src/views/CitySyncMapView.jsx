import React, { useEffect, useState } from "react";
import {
  Search,
  AlertTriangle,
  ArrowRight,
  Plane,
} from "lucide-react";
import LeafletMap from "../components/LeafletMap";
import { subscribeToComplaints } from "../services/getComplaints";

const fallbackReports = [
  {
    id: "PTR-892A",
    title: "Critical Pothole",
    category: "Road Safety",
    priority: "High",
    address: "40.7128° N, 74.0060° W",
    latitude: 28.6139,
    longitude: 77.209,
    imageUrl: "",
  },
  {
    id: "WTR-112C",
    title: "Water Line Burst",
    category: "Utility",
    priority: "Medium",
    address: "Near Sector 18",
    latitude: 28.622,
    longitude: 77.214,
    imageUrl: "",
  },
  {
    id: "ELE-221B",
    title: "Power Fluctuation",
    category: "Electricity",
    priority: "Low",
    address: "Main Grid Junction",
    latitude: 28.606,
    longitude: 77.1945,
    imageUrl: "",
  },
  {
    id: "BRG-90D",
    title: "Bridge Crack",
    category: "Infrastructure",
    priority: "High",
    address: "Bridge East Loop",
    latitude: 28.6005,
    longitude: 77.2275,
    imageUrl: "",
  },
];

export default function CitySyncMapView({ setActivePage, viewMode = "auto" }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const isPhoneFrame = viewMode === "phone";

  useEffect(() => {
    const unsubscribe = subscribeToComplaints((data) => {
      const normalized = Array.isArray(data) ? data : [];
      setComplaints(normalized.length ? normalized : fallbackReports);

      setSelectedComplaint((prev) => {
        if (prev && normalized.some((item) => item.id === prev.id)) return prev;
        return normalized[0] || fallbackReports[0] || null;
      });
    });

    return unsubscribe;
  }, []);

  const allReports = complaints.length ? complaints : fallbackReports;

  const filteredReports = allReports.filter((report) => {
    const q = searchQuery.toLowerCase();
    return (
      (report.title || "").toLowerCase().includes(q) ||
      (report.category || "").toLowerCase().includes(q) ||
      (report.address || "").toLowerCase().includes(q)
    );
  });

  const activeReport =
    selectedComplaint && filteredReports.some((report) => report.id === selectedComplaint.id)
      ? selectedComplaint
      : filteredReports[0] || null;

  const mapCenter =
    activeReport && activeReport.latitude && activeReport.longitude
      ? [activeReport.latitude, activeReport.longitude]
      : [28.6139, 77.209];

  const reportMarkers = filteredReports
    .filter((report) => report.latitude && report.longitude)
    .map((report) => ({
      position: [report.latitude, report.longitude],
      color:
        report.priority === "High"
          ? "#ff5a5f"
          : report.priority === "Medium"
            ? "#fbbf24"
            : "#22c55e",
      popup: `<div style="font-family:sans-serif; min-width:160px;"><strong>${report.title}</strong><br /><span>${report.id || report.category}</span></div>`,
      data: report,
    }));

  const openIncident = () => {
    if (!activeReport) return;
    localStorage.setItem("selectedComplaint", JSON.stringify(activeReport));
    setActivePage("incident-detail");
  };

  return (
    <div className="h-screen w-screen bg-[#090C13] text-slate-100 flex justify-center overflow-hidden">
      <div
        className={`w-full ${
          isPhoneFrame
            ? "max-w-md bg-[#0D121D] border border-slate-800 rounded-2xl overflow-hidden min-h-[780px]"
            : "w-full h-full bg-[#0D121D] flex flex-col"
        }`}
      >
        <div className="relative flex justify-center items-center border-b border-slate-800 pb-4 mb-4 px-6 pt-6">
          <div className="text-center">
            <h1 className="text-xl font-bold text-cyan-400">CitySync AI GIS Radar</h1>
            <p className="text-xs text-slate-400">Live Firestore Incident Map</p>
          </div>

          <button
            onClick={() => setActivePage("report-issue")}
            className="absolute right-6 px-4 py-2 bg-cyan-400 text-black rounded-xl font-bold"
          >
            + REPORT
          </button>
        </div>

        <div className="mb-4 flex items-center gap-2 bg-[#070A12] border border-slate-800 rounded-xl px-3 py-2 mx-6">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search incident..."
            className="bg-transparent flex-1 outline-none text-white placeholder:text-slate-500"
          />
        </div>

        <div className="flex-1 relative rounded-2xl overflow-hidden border border-slate-800 bg-[#090D17] mx-6 mb-6">
          <div className="absolute inset-0 z-0">
            <LeafletMap center={mapCenter} zoom={13} markers={reportMarkers} onMarkerClick={setSelectedComplaint} />
          </div>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="w-[500px] h-[500px] border border-cyan-500/10 rounded-full animate-ping" />
            <div className="w-[300px] h-[300px] border border-cyan-500/20 rounded-full" />
          </div>

          <div className="absolute top-[22%] left-[20%] pointer-events-none z-30">
            <div className="w-11 h-11 rounded-2xl bg-slate-950/90 border-2 border-amber-400 flex items-center justify-center text-amber-400 shadow-lg">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>

          <div className="absolute top-[58%] left-[34%] pointer-events-none z-30">
            <div className="w-12 h-12 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-lg animate-pulse">
              <Plane className="w-6 h-6 transform -rotate-45" />
            </div>
          </div>

          <div className="absolute bottom-6 right-6 w-[350px] bg-[#0C101A]/92 border border-rose-500/30 rounded-2xl p-4 shadow-2xl z-30 backdrop-blur-sm max-h-[70vh] overflow-y-auto">
            {activeReport ? (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-rose-950 border border-rose-500/50 flex items-center justify-center text-rose-400">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{activeReport.title}</h3>
                      <p className="text-[11px] text-rose-400 uppercase font-bold">ID: {activeReport.id}</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-lg bg-rose-950 text-rose-300 border border-rose-500/40 text-[10px] font-bold uppercase flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                    LIVE
                  </div>
                </div>

                {activeReport.imageUrl && (
                  <div className="mb-3 rounded-xl overflow-hidden border border-slate-700">
                    <img src={activeReport.imageUrl} alt={activeReport.title} className="w-full h-auto object-cover" />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 py-2 border-b border-slate-800 mb-3">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">GPS Coordinates</p>
                    <p className="text-cyan-400 font-extrabold text-lg">{activeReport.latitude?.toFixed(4) || "28.6139"}° N</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Severity</p>
                    <p className="text-rose-400 font-extrabold text-sm">{activeReport.priority || "High"}</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#070A12] border border-slate-800 mb-3">
                  <div className="flex items-center gap-3">
                    <Plane className="w-5 h-5 text-cyan-400" />
                    <div>
                      <p className="text-[10px] uppercase text-slate-400">Dispatch Status</p>
                      <p className="text-sm font-bold text-slate-100">Drone Dispatched (ETA 2m)</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={openIncident}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 text-black font-extrabold uppercase text-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Inspect Incident</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <p className="text-slate-300">No active reports.</p>
            )}
          </div>
        </div>

        <div className="px-6 pb-6">
          <h2 className="text-lg font-bold text-cyan-400 mb-4">All Incidents on Map ({filteredReports.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[200px] overflow-y-auto">
            {filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => setSelectedComplaint(report)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedComplaint?.id === report.id
                      ? "bg-cyan-500/20 border-cyan-400"
                      : "bg-[#070A12] border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {report.imageUrl && (
                    <img src={report.imageUrl} alt={report.title} className="w-full h-24 object-cover rounded-lg mb-2" />
                  )}
                  <h3 className="font-bold text-white text-sm mb-1">{report.title}</h3>
                  <p className="text-[10px] text-slate-400 mb-2">{report.id}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">{report.category}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded ${
                        report.priority === "High"
                          ? "bg-red-950 text-red-300"
                          : report.priority === "Medium"
                            ? "bg-amber-950 text-amber-300"
                            : "bg-green-950 text-green-300"
                      }`}
                    >
                      {report.priority}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400 col-span-full text-center py-4">No incidents to display</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}