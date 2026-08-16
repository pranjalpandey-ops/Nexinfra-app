import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Video,
  RefreshCw,
  Bot,
  Plane,
  MapPin,
  Clock,
  Calendar,
} from "lucide-react";

import { updateComplaintStatus } from "../services/updateComplaintStatus";

export default function IncidentDetailView({
  setActivePage,
  viewMode = "auto",
}) {
  const [isScanning, setIsScanning] = useState(false);

  const [complaint, setComplaint] = useState({
    id: "DEMO-001",
    title: "Large pothole near school",
    category: "Road Damage/Pothole",
    description: "Large pothole causing traffic slowdowns.",
    priority: "High",
    status: "Submitted",
    address: "Sector 62, Noida",
    imageUrl: null,
    createdBy: "demo@nexinfra.com",
    createdAt: null,
    latitude: null,
    longitude: null,
  });

  useEffect(() => {
    const saved = localStorage.getItem("selectedComplaint");

    if (saved) {
      try {
        setComplaint(JSON.parse(saved));
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  const handleRescan = () => {
    setIsScanning(true);

    setTimeout(() => {
      setIsScanning(false);
      alert("AI Drone Re-Scan Completed");
    }, 2000);
  };

  const changeStatus = async (newStatus) => {
    if (!complaint.id) return;

    const result = await updateComplaintStatus(complaint.id, newStatus);

    if (result.success) {
      const updated = {
        ...complaint,
        status: newStatus,
      };

      setComplaint(updated);
      localStorage.setItem("selectedComplaint", JSON.stringify(updated));

      alert(`Status updated to "${newStatus}"`);
    } else {
      alert(result.error);
    }
  };

  const isPhoneFrame = viewMode === "phone";

  return (
    <div className="min-h-screen bg-[#070A10] text-slate-100 flex justify-center py-8 px-4">

      <div
        className={`w-full ${
          isPhoneFrame
            ? "max-w-lg bg-[#0C101A] border border-slate-800 rounded-2xl overflow-hidden p-6"
            : "max-w-6xl bg-[#0C101A] border border-slate-800 rounded-2xl p-8"
        }`}
      >

        {/* Header */}

        <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-6">

          <div className="flex items-center gap-3">

            <button
              onClick={() => setActivePage("citysync-map")}
              className="p-2 rounded-xl bg-[#070A12] border border-slate-700 hover:text-cyan-400 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div>

              <h1 className="text-2xl font-bold">
                Incident #{complaint.id}
              </h1>

              <p className="text-cyan-400 text-sm">
                {complaint.category}
              </p>

            </div>

          </div>

          <span className="px-3 py-1 rounded-full bg-cyan-950 border border-cyan-500 text-cyan-300 text-xs font-bold">
            {complaint.status}
          </span>

        </div>

        <div className="grid lg:grid-cols-2 gap-8">

          {/* LEFT */}

          <div className="space-y-6">

            <div>

              <div className="flex justify-between items-center mb-3">

                <h3 className="font-bold text-white">
                  Visual Evidence
                </h3>

                <span className="text-sm text-slate-400">
                  Uploaded Image
                </span>

              </div>

              {complaint.imageUrl ? (
                <img
                  src={complaint.imageUrl}
                  alt="Complaint"
                  className="w-full h-80 object-cover rounded-2xl border border-slate-700"
                />
              ) : (
                <div className="w-full h-80 rounded-2xl border border-slate-700 bg-[#05070D] flex items-center justify-center text-slate-500">
                  No image uploaded
                </div>
              )}

            </div>

            {/* Drone Controls */}

            <div className="bg-[#070A12] border border-slate-700 rounded-2xl p-6 space-y-4">

              <div className="flex items-center gap-2 text-cyan-400 font-semibold">

                <Plane className="w-5 h-5" />

                Drone Controls

              </div>

              <div className="grid grid-cols-2 gap-3">

                <button
                  onClick={handleRescan}
                  disabled={isScanning}
                  className="py-3 rounded-xl bg-cyan-400 text-black font-bold flex items-center justify-center gap-2 hover:bg-cyan-300 transition"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${
                      isScanning ? "animate-spin" : ""
                    }`}
                  />

                  {isScanning ? "Scanning..." : "Re-Scan"}

                </button>

                <button
                  onClick={() => setActivePage("drone-fleet")}
                  className="py-3 rounded-xl border border-cyan-500 text-cyan-300 flex items-center justify-center gap-2 hover:bg-cyan-950 transition"
                >
                  <Video className="w-4 h-4" />
                  Live Feed
                </button>

              </div>

            </div>

          </div>

          {/* RIGHT */}

          <div className="space-y-6">

            {/* AI Assessment */}

            <div className="bg-[#070A12] border border-slate-700 rounded-2xl p-6 space-y-5">

              <div className="flex justify-between items-center">

                <h3 className="font-bold text-lg">
                  AI Assessment
                </h3>

                <Bot className="text-cyan-400" />

              </div>

              <div className="grid grid-cols-2 gap-4">

                <div>

                  <p className="text-xs text-slate-400 uppercase">
                    Priority
                  </p>

                  <p className="text-2xl font-bold text-amber-400">
                    {complaint.priority}
                  </p>

                </div>

                <div>

                  <p className="text-xs text-slate-400 uppercase">
                    Status
                  </p>

                  <p className="text-2xl font-bold text-cyan-400">
                    {complaint.status}
                  </p>

                </div>

              </div>

              <div className="bg-rose-950/40 border border-rose-500 rounded-xl p-4 flex justify-between">

                <span className="text-slate-300">
                  Estimated Risk
                </span>

                <span className="text-rose-400 font-bold">
                  {complaint.priority === "High"
                    ? "High"
                    : complaint.priority === "Medium"
                    ? "Moderate"
                    : "Low"}
                </span>

              </div>

            </div>

            {/* Status Management */}

            <div className="bg-[#070A12] border border-slate-700 rounded-2xl p-6 space-y-4">

              <h3 className="font-bold text-white uppercase">
                Update Complaint Status
              </h3>

              <div className="grid grid-cols-3 gap-3">

                <button
                  onClick={() => changeStatus("Pending")}
                  className={`py-3 rounded-xl font-bold transition ${
                    complaint.status === "Pending"
                      ? "bg-amber-500 text-black"
                      : "bg-slate-800 text-white hover:bg-amber-900"
                  }`}
                >
                  Pending
                </button>

                <button
                  onClick={() => changeStatus("In Progress")}
                  className={`py-3 rounded-xl font-bold transition ${
                    complaint.status === "In Progress"
                      ? "bg-cyan-400 text-black"
                      : "bg-slate-800 text-white hover:bg-cyan-900"
                  }`}
                >
                  In Progress
                </button>

                <button
                  onClick={() => changeStatus("Resolved")}
                  className={`py-3 rounded-xl font-bold transition ${
                    complaint.status === "Resolved"
                      ? "bg-emerald-400 text-black"
                      : "bg-slate-800 text-white hover:bg-emerald-900"
                  }`}
                >
                  Resolved
                </button>

              </div>

            </div>

            {/* Complaint Details */}

            <div className="bg-[#070A12] border border-slate-700 rounded-2xl p-6 space-y-5">

              <h3 className="font-bold uppercase text-white">
                Complaint Details
              </h3>

              <div className="space-y-4">

                <div>

                  <p className="text-xs text-slate-400 uppercase">
                    Title
                  </p>

                  <p>{complaint.title}</p>

                </div>

                <div>

                  <p className="text-xs text-slate-400 uppercase">
                    Description
                  </p>

                  <p className="text-slate-300">
                    {complaint.description}
                  </p>

                </div>

                <div className="flex gap-3 items-start">

                  <MapPin className="w-5 h-5 text-cyan-400 mt-1" />

                  <div>

                    <p className="text-xs text-slate-400 uppercase">
                      Location
                    </p>

                    <p>{complaint.address}</p>

                    {complaint.latitude && complaint.longitude && (
                      <p className="text-xs text-slate-500 mt-1">
                        {complaint.latitude.toFixed(6)},{" "}
                        {complaint.longitude.toFixed(6)}
                      </p>
                    )}

                  </div>

                </div>

                <div className="flex gap-3 items-center">

                  <Clock className="w-5 h-5 text-cyan-400" />

                  <div>

                    <p className="text-xs text-slate-400 uppercase">
                      Submitted By
                    </p>

                    <p>{complaint.createdBy}</p>

                  </div>

                </div>

                <div className="flex gap-3 items-center">

                  <Calendar className="w-5 h-5 text-cyan-400" />

                  <div>

                    <p className="text-xs text-slate-400 uppercase">
                      Submitted On
                    </p>

                    <p>
                      {complaint.createdAt?.seconds
                        ? new Date(
                            complaint.createdAt.seconds * 1000
                          ).toLocaleString()
                        : "Recently"}
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* Timeline */}

            <div className="bg-[#070A12] border border-slate-700 rounded-2xl p-6 space-y-5">

              <h3 className="font-bold uppercase text-white">
                Action Timeline
              </h3>

              <div className="space-y-4 border-l-2 border-slate-700 pl-5">

                <div className="relative">

                  <span className="absolute -left-[28px] top-1 w-3 h-3 rounded-full bg-cyan-400"></span>

                  <p className="font-semibold">
                    Complaint Submitted
                  </p>

                  <p className="text-xs text-slate-400">
                    Citizen report received.
                  </p>

                </div>

                <div className="relative">

                  <span className="absolute -left-[28px] top-1 w-3 h-3 rounded-full bg-cyan-400"></span>

                  <p className="font-semibold">
                    AI Analysis Completed
                  </p>

                  <p className="text-xs text-slate-400">
                    Category identified automatically.
                  </p>

                </div>

                <div className="relative">

                  <span className="absolute -left-[28px] top-1 w-3 h-3 rounded-full bg-cyan-400"></span>

                  <p className="font-semibold">
                    Current Status: {complaint.status}
                  </p>

                  <p className="text-xs text-slate-400">
                    Live status from Firestore.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}