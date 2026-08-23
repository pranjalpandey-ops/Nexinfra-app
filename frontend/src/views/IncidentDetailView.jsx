import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Video,
  RefreshCw,
  MapPin,
  Clock,
  Calendar,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  ThumbsUp,
  Building,
  Sparkles,
  Layers,
  Activity,
  AlertTriangle,
  Flame,
  Trash2,
  MessageSquareHeart,
  Star
} from "lucide-react";

import { updateComplaintStatus } from "../services/updateComplaintStatus";
import { deleteComplaint } from "../services/deleteComplaint";
import { upvoteIssue, getLocalCivicIssues } from "../services/civicDb";
import DisasterBroadcastModal from "../components/DisasterBroadcastModal";
import CitizenFeedbackModal from "../components/CitizenFeedbackModal";
import DeleteIncidentModal from "../components/DeleteIncidentModal";
import OfficerOverrideModal from "../components/OfficerOverrideModal";

export default function IncidentDetailView({
  setActivePage,
  viewMode = "auto",
  user,
}) {
  const isAdmin = user?.role === "admin";
  const isOfficer = user?.role === "officer";
  const isPrivileged = isAdmin || isOfficer;
  const [isScanning, setIsScanning] = useState(false);
  const [isDisasterModalOpen, setIsDisasterModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [officerOverrideTarget, setOfficerOverrideTarget] = useState(null);

  const [complaint, setComplaint] = useState({
    id: "CIVIC-892A",
    title: "Critical Pothole & Road Cave-in",
    category: "Road Damage / Pothole",
    description: "Deep structural road crater exceeding 15cm depth near school crosswalk causing severe vehicle damage and traffic bottleneck.",
    priority: "P1",
    priorityLabel: "P1 - Critical Hazard",
    severity: "Critical",
    status: "AI Verified",
    address: "Intersection Sector 62 & Ring Road Expressway",
    ward: "Central District - Ward 4",
    imageUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
    createdBy: "citizen.demo@nexinfra.org",
    createdAt: null,
    latitude: 28.6139,
    longitude: 77.2090,
    aiVerified: true,
    aiConfidence: 0.964,
    defectTags: ["Structural Pothole", "Asphalt Rupture", "Tire Hazard"],
    boundingBoxes: [
      { label: "Pothole Breach (0.96)", x: 22, y: 30, w: 56, h: 48, severity: "Critical" }
    ],
    estimatedDimensions: "1.9m x 1.3m (Depth: 16cm)",
    assignedDepartment: "Road Maintenance & Pavement Division",
    slaHours: 4,
    upvotes: 24,
    reportCount: 5,
  });

  useEffect(() => {
    const saved = localStorage.getItem("selectedComplaint");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setComplaint((prev) => ({ ...prev, ...parsed }));
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  const handleUpvote = () => {
    const updated = upvoteIssue(complaint.id, user?.email || "citizen.demo@nexinfra.org");
    const current = updated.find((i) => i.id === complaint.id);
    if (current) {
      setComplaint(current);
      localStorage.setItem("selectedComplaint", JSON.stringify(current));
    }
  };

  const handleRescan = () => {
    if (!isAdmin) {
      alert("Drone re-scan is reserved for Tactical Administrators.");
      return;
    }
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      alert("AI Drone Re-Scan Completed: Telemetry & Spatial Mesh updated with 98.2% confidence.");
    }, 2000);
  };

  const changeStatus = async (newStatus) => {
    if (!isAdmin && !isOfficer) {
      alert("Only Command Administrators & Municipal Officers can change incident resolution states.");
      return;
    }
    if (!complaint.id) return;

    const isCurrentInProgress = (complaint.status || "").toLowerCase() === "in progress";
    if (isCurrentInProgress && !isOfficer && isAdmin && newStatus !== "In Progress") {
      setOfficerOverrideTarget({ incident: complaint, targetStatus: newStatus });
      return;
    }

    const result = await updateComplaintStatus(complaint.id, newStatus);

    if (result.success) {
      const updated = {
        ...complaint,
        status: newStatus,
      };

      setComplaint(updated);
      localStorage.setItem("selectedComplaint", JSON.stringify(updated));
    } else {
      alert(`Failed to update status: ${result.error}`);
    }
  };

  const handleConfirmOfficerOverride = async ({ incidentId, targetStatus }) => {
    const result = await updateComplaintStatus(incidentId, targetStatus);
    if (result.success) {
      const updated = {
        ...complaint,
        status: targetStatus,
      };
      setComplaint(updated);
      localStorage.setItem("selectedComplaint", JSON.stringify(updated));
    }
    setOfficerOverrideTarget(null);
  };

  const isPhoneFrame = viewMode === "phone";

  const statusSteps = ["Reported", "AI Verified", "In Progress", "Resolved"];
  const currentStepIndex = statusSteps.indexOf(complaint.status) >= 0
    ? statusSteps.indexOf(complaint.status)
    : 0;

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex justify-center py-8 px-4 w-full">
      <div
        className={`w-full ${
          isPhoneFrame
            ? "max-w-md bg-[#0D121D] border border-slate-800 rounded-2xl p-6"
            : "max-w-5xl bg-[#0D121D] border border-slate-800 rounded-2xl p-8 shadow-2xl"
        }`}
      >
        {/* Navigation / Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-5 mb-6">
          <button
            onClick={() => setActivePage("citysync-map")}
            className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 font-mono-tech text-xs uppercase cursor-pointer transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to City Radar Map</span>
          </button>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold font-mono-tech uppercase flex items-center gap-1.5 ${
                isAdmin
                  ? "bg-cyan-950 border border-cyan-500 text-cyan-300"
                  : "bg-emerald-950 border border-emerald-500 text-emerald-300"
              }`}
            >
              {isAdmin ? <ShieldCheck className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
              <span>{isAdmin ? "Executive Inspector" : "Citizen Tracking View"}</span>
            </span>
          </div>
        </div>

        {/* Title & Metadata */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500 text-xs font-mono-tech font-bold">
                  {complaint.id || "CIVIC-TICKET"}
                </span>

                <span
                  className={`text-xs px-2.5 py-0.5 rounded font-bold font-mono-tech ${
                    complaint.priority === "P1" || complaint.priority === "High"
                      ? "bg-red-950 text-red-300 border border-red-800"
                      : complaint.priority === "P2" || complaint.priority === "Medium"
                      ? "bg-orange-950 text-orange-300 border border-orange-800"
                      : "bg-yellow-950 text-yellow-300 border border-yellow-800"
                  }`}
                >
                  {complaint.priorityLabel || complaint.priority || "P1 - Critical"}
                </span>

                {complaint.aiVerified && (
                  <span className="px-2.5 py-0.5 rounded bg-emerald-950 border border-emerald-500 text-emerald-300 font-mono-tech text-xs font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>AI Verified ({(complaint.aiConfidence ? complaint.aiConfidence * 100 : 96.4).toFixed(1)}%)</span>
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 font-heading">
                {complaint.title || complaint.category}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Upvote Button */}
              <button
                onClick={handleUpvote}
                className="px-4 py-2.5 rounded-xl bg-slate-900 border border-cyan-500/50 hover:bg-cyan-950/60 text-cyan-300 font-bold text-xs uppercase flex items-center gap-1.5 cursor-pointer transition font-mono-tech"
              >
                <ThumbsUp className="w-4 h-4 text-cyan-400" />
                <span>Upvote ({complaint.upvotes || 0})</span>
              </button>

              {/* Admin Level 5 Disaster Early Warning Button */}
              {isAdmin && (
                <button
                  onClick={() => setIsDisasterModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-extrabold text-xs uppercase cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.5)] font-mono-tech active:scale-95 transition"
                >
                  <Flame className="w-4 h-4 animate-pulse" />
                  <span>🚨 Level 5 Warning</span>
                </button>
              )}

              {/* Delete / Dismiss Incident Log with Reason & Citizen Notification */}
              {isPrivileged && (
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-rose-950/70 border border-rose-500/70 hover:bg-rose-900/80 text-rose-300 font-bold text-xs uppercase cursor-pointer flex items-center gap-1.5 shadow-md font-mono-tech active:scale-95 transition"
                  title="Permanently close / delete incident log and dispatch resolution notice to citizen"
                >
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  <span>Delete this log</span>
                </button>
              )}

              {isAdmin && (
                <button
                  onClick={handleRescan}
                  disabled={isScanning}
                  className="px-4 py-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500 text-cyan-300 hover:bg-cyan-900/60 font-bold text-xs uppercase cursor-pointer flex items-center gap-2 disabled:opacity-50 font-mono-tech"
                >
                  <RefreshCw className={`w-4 h-4 ${isScanning ? "animate-spin" : ""}`} />
                  <span>{isScanning ? "Scanning..." : "AI Drone Re-Scan"}</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-slate-400 font-mono-tech">
            <span className="flex items-center gap-1 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>{complaint.address || "Street Coordinates Recorded"}</span>
            </span>
            {complaint.ward && (
              <span className="text-cyan-300 font-bold">
                [{complaint.ward}]
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Target SLA: <strong className="text-cyan-300">{complaint.slaHours || 4} Hours</strong></span>
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <Building className="w-3.5 h-3.5 text-slate-500" />
              <span>Dept: {complaint.assignedDepartment || "Road Maintenance"}</span>
            </span>
          </div>
        </div>

        {/* Live Status Stepper Timeline */}
        <div className="bg-[#070A12] border border-slate-800 rounded-2xl p-6 mb-8 font-mono-tech">
          <h3 className="font-bold text-white text-xs mb-4 uppercase tracking-wider text-slate-400">
            Resolution Workflow Timeline
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {statusSteps.map((step, idx) => {
              const isPastOrCurrent = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div
                  key={step}
                  className={`p-3.5 rounded-xl border flex flex-col gap-1 transition ${
                    isCurrent
                      ? "bg-cyan-950/60 border-cyan-400 text-cyan-300 cyan-glow-sm"
                      : isPastOrCurrent
                      ? "bg-emerald-950/30 border-emerald-600/50 text-emerald-400"
                      : "bg-[#0B0F19] border-slate-800 text-slate-500"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span>STEP 0{idx + 1}</span>
                    {isPastOrCurrent && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <span className="font-bold text-sm text-white">{step}</span>
                  <span className="text-[11px] text-slate-400">
                    {isCurrent ? "Active Stage" : isPastOrCurrent ? "Completed" : "Pending"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content & Visual Bounding Box Details */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 font-mono-tech text-xs">
          
          {/* Left Details */}
          <div className="md:col-span-7 space-y-5">
            <div className="bg-[#070A12] border border-slate-800 rounded-2xl p-6 space-y-4 font-sans">
              <h3 className="font-bold text-white text-base">Defect Description</h3>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                {complaint.description || "No detailed description supplied."}
              </p>
            </div>

            {/* Neural Geometric Telemetry */}
            {complaint.estimatedDimensions && (
              <div className="bg-[#070A12] border border-cyan-500/30 rounded-2xl p-5 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-bold">
                  <Activity className="w-4 h-4" />
                  <span>AI Structural Dimensions & Geometry</span>
                </div>
                <div className="text-slate-200 font-mono-tech text-xs">
                  {complaint.estimatedDimensions}
                </div>
              </div>
            )}

            {/* Admin Status Mutation Control */}
            {isAdmin ? (
              <div className="bg-[#070A12] border border-cyan-500/40 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm uppercase">
                    Admin Workflow Override
                  </h3>
                  <span className="text-xs text-cyan-400 font-bold">EXECUTIVE AUTHORITY</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {statusSteps.map((statusOption) => (
                    <button
                      key={statusOption}
                      onClick={() => changeStatus(statusOption)}
                      className={`py-2.5 px-3 rounded-lg border font-bold transition cursor-pointer ${
                        complaint.status === statusOption
                          ? "bg-cyan-400 text-black border-cyan-400 font-extrabold"
                          : "bg-slate-900 border-slate-800 text-slate-300 hover:border-cyan-500"
                      }`}
                    >
                      {statusOption}
                    </button>
                  ))}
                </div>

                {/* Delete Resolved Problem Record Option */}
                {complaint.status === "Resolved" && (
                  <div className="pt-2 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={async () => {
                        if (confirm(`Are you sure you want to PERMANENTLY DELETE resolved ticket ${complaint.id}?`)) {
                          await deleteComplaint(complaint.id);
                          alert(`Ticket ${complaint.id} successfully deleted from records.`);
                          setActivePage("dashboard");
                        }
                      }}
                      className="w-full py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/50 text-red-300 font-bold text-xs uppercase flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                      <span>🗑️ Delete Resolved Problem Record</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Citizen Ground Resolution & Feedback Card */}
                <div className="bg-[#070A12] border border-amber-500/40 rounded-2xl p-4 space-y-3 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                      <MessageSquareHeart className="w-4 h-4 text-amber-400" />
                      <span>Citizen Ground Verification</span>
                    </div>
                    {complaint.feedbackScore && (
                      <span className="text-amber-400 text-xs font-bold flex items-center gap-1 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/50">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{complaint.feedbackScore} / 5.0</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300">
                    {complaint.status === "Resolved"
                      ? "Have you inspected this location? Rate the repair quality and confirm if the road or service is fully restored."
                      : "Provide a real-time status update from the ground to assist municipal dispatch teams."}
                  </p>

                  <button
                    type="button"
                    onClick={() => setIsFeedbackModalOpen(true)}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-black font-extrabold text-xs uppercase flex items-center justify-center gap-2 cursor-pointer shadow-md transition active:scale-95"
                  >
                    <MessageSquareHeart className="w-4 h-4" />
                    <span>
                      {complaint.status === "Resolved"
                        ? "⭐ Rate Resolution & Verify Work"
                        : "💬 Submit Ground Status Feedback"}
                    </span>
                  </button>

                  {/* Existing Citizen Feedback List */}
                  {complaint.citizenFeedbacks && complaint.citizenFeedbacks.length > 0 && (
                    <div className="pt-2 border-t border-slate-800 space-y-2">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">
                        Community Ground Verifications ({complaint.citizenFeedbacks.length}):
                      </div>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {complaint.citizenFeedbacks.slice(0, 3).map((fb, idx) => (
                          <div key={idx} className="p-2 rounded-lg bg-[#0B0F19] border border-slate-800 text-[11px] space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-amber-300">{fb.citizenName}</span>
                              <span className="text-amber-400 text-[10px] font-bold">⭐ {fb.rating}/5</span>
                            </div>
                            <div className="text-slate-300 text-[10px]">{fb.statusConfirmation}</div>
                            {fb.comment && <div className="text-slate-400 text-[10px] italic">"{fb.comment}"</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-[#070A12] border border-slate-800 rounded-2xl p-4 text-xs text-slate-400">
                  ℹ Citizen Notice: Updates made by the municipal repair unit will synchronize with this timeline in real-time.
                </div>

                {complaint.status === "Resolved" && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (confirm(`Are you sure you want to PERMANENTLY DELETE resolved ticket ${complaint.id}?`)) {
                        await deleteComplaint(complaint.id);
                        alert(`Ticket ${complaint.id} successfully deleted from records.`);
                        setActivePage("dashboard");
                      }
                    }}
                    className="w-full py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/50 text-red-300 font-bold text-xs uppercase flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                    <span>🗑️ Delete Resolved Problem Record</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Visual Image Box with Bounding Box Overlay */}
          <div className="md:col-span-5 space-y-5">
            <div className="bg-[#070A12] border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-sm font-sans">
                  Optical Site Visual Telemetry
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/50">
                  AI Bounding Active
                </span>
              </div>

              {complaint.imageUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-800 group aspect-4/3">
                  <img
                    src={complaint.imageUrl}
                    alt="Incident Site"
                    className="w-full h-full object-cover"
                  />

                  {/* SVG Bounding Box Preview */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <rect
                      x="22%"
                      y="28%"
                      width="56%"
                      height="48%"
                      fill="rgba(0, 240, 255, 0.12)"
                      stroke="#00F0FF"
                      strokeWidth="2.5"
                    />
                    <circle cx="22%" cy="28%" r="4" fill="#00F0FF" />
                    <circle cx="78%" cy="28%" r="4" fill="#00F0FF" />
                    <circle cx="22%" cy="76%" r="4" fill="#00F0FF" />
                    <circle cx="78%" cy="76%" r="4" fill="#00F0FF" />
                  </svg>

                  <div className="absolute top-2 left-2 px-2 py-1 rounded bg-black/80 backdrop-blur-sm border border-cyan-400 text-cyan-300 text-[10px] font-bold">
                    [AI DETECTION]: {complaint.category} (96.4%)
                  </div>
                </div>
              ) : (
                <div className="w-full h-52 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
                  <Video className="w-6 h-6 text-slate-600" />
                  <span>No Optical Telemetry Uploaded</span>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Citizen Feedback Modal */}
      {isFeedbackModalOpen && (
        <CitizenFeedbackModal
          isOpen={isFeedbackModalOpen}
          onClose={() => setIsFeedbackModalOpen(false)}
          incident={complaint}
          user={user}
          onFeedbackSubmitted={(updated) => {
            setComplaint(updated);
            localStorage.setItem("selectedComplaint", JSON.stringify(updated));
          }}
        />
      )}

      {/* Disaster Early Warning Broadcast Modal */}
      <DisasterBroadcastModal
        isOpen={isDisasterModalOpen}
        onClose={() => setIsDisasterModalOpen(false)}
        initialIncident={complaint}
        user={user}
      />

      {/* Delete / Dismiss Incident Log Modal with Citizen Resolution Broadcast */}
      {isDeleteModalOpen && (
        <DeleteIncidentModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          incident={complaint}
          user={user}
          onDeleted={() => {
            setActivePage("citysync-map");
          }}
        />
      )}

      {/* Municipal Officer Override Permission Modal for In Progress tasks */}
      {officerOverrideTarget && (
        <OfficerOverrideModal
          isOpen={Boolean(officerOverrideTarget)}
          onClose={() => setOfficerOverrideTarget(null)}
          incident={officerOverrideTarget.incident}
          targetStatus={officerOverrideTarget.targetStatus}
          onConfirmOverride={handleConfirmOfficerOverride}
        />
      )}
    </div>
  );
}
