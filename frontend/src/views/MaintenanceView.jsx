import React, { useState, useEffect } from "react";
import {
  Inbox,
  Sparkles,
  Radio,
  CheckCircle2,
  Layers,
  Filter,
  Plus,
  Flame,
  Search,
  Building,
  Clock,
  MapPin,
  Plane,
  FileText,
  ShieldAlert
} from "lucide-react";

import { subscribeToComplaints } from "../services/getComplaints";
import { updateComplaintStatus } from "../services/updateComplaintStatus";
import { getLocalCivicIssues } from "../services/civicDb";

import RequestsHubSubpage from "./incident-subpages/RequestsHubSubpage";
import AutoAIVerificationSubpage from "./incident-subpages/AutoAIVerificationSubpage";
import InProgressSubpage from "./incident-subpages/InProgressSubpage";
import ResolvedSubpage from "./incident-subpages/ResolvedSubpage";
import DisasterBroadcastModal from "../components/DisasterBroadcastModal";
import AIVisionTriageModal from "../components/AIVisionTriageModal";

export default function MaintenanceView({
  onOpenWorkOrderModal,
  onOpenDispatchModal,
  user
}) {
  const [activeSubpage, setActiveSubpage] = useState("requests"); // requests | ai_verification | in_progress | resolved | pipeline
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Disaster Broadcast Modal State
  const [isDisasterModalOpen, setIsDisasterModalOpen] = useState(false);
  const [isAITriageModalOpen, setIsAITriageModalOpen] = useState(false);

  useEffect(() => {
    // 1. Initial baseline local issues
    const local = getLocalCivicIssues();
    setIncidents(local);
    if (local.length > 0) setSelectedIncident(local[0]);

    // 2. Real-time Firestore database listener
    const unsubscribe = subscribeToComplaints((firestoreList) => {
      if (Array.isArray(firestoreList) && firestoreList.length > 0) {
        const merged = [
          ...firestoreList,
          ...local.filter((l) => !firestoreList.some((f) => f.id === l.id))
        ];
        setIncidents(merged);
        if (!selectedIncident && merged.length > 0) {
          setSelectedIncident(merged[0]);
        }
      }
    });

    // 3. Instant local status update & deletion listeners
    const handleStatusUpdated = (e) => {
      const { id, status } = e.detail || {};
      if (id && status) {
        setIncidents((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status } : item))
        );
        setSelectedIncident((prev) =>
          prev && prev.id === id ? { ...prev, status } : prev
        );
      }
    };

    const handleIssueDeleted = (e) => {
      const { id } = e.detail || {};
      if (id) {
        setIncidents((prev) => prev.filter((item) => item.id !== id));
        setSelectedIncident((prev) => (prev && prev.id === id ? null : prev));
      }
    };

    window.addEventListener("civic_issue_updated", handleStatusUpdated);
    window.addEventListener("civic_issue_deleted", handleIssueDeleted);

    return () => {
      unsubscribe();
      window.removeEventListener("civic_issue_updated", handleStatusUpdated);
      window.removeEventListener("civic_issue_deleted", handleIssueDeleted);
    };
  }, []);

  const handleAdvanceStatus = async (incident, targetStatus) => {
    setActionLoading(incident.id);
    const result = await updateComplaintStatus(incident.id, targetStatus);
    if (result.success) {
      const updated = incidents.map((i) =>
        i.id === incident.id ? { ...i, status: targetStatus } : i
      );
      setIncidents(updated);
      if (selectedIncident && selectedIncident.id === incident.id) {
        setSelectedIncident({ ...selectedIncident, status: targetStatus });
      }
    } else {
      alert(`Update note: ${result.error}`);
    }
    setActionLoading(null);
  };

  const requestsCount = incidents.filter(
    (i) => !i.status || i.status === "Reported" || i.status === "Submitted"
  ).length;

  const aiVerifiedCount = incidents.filter(
    (i) => i.status === "AI Verified" || i.status === "Verified" || i.aiVerified
  ).length;

  const inProgressCount = incidents.filter(
    (i) => i.status === "In Progress" || i.status === "Dispatched"
  ).length;

  const resolvedCount = incidents.filter(
    (i) => i.status === "Resolved" || i.status === "Closed"
  ).length;

  return (
    <div className="flex-1 bg-[#070A10] text-slate-100 p-6 space-y-6 font-sans overflow-y-auto">
      
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading flex items-center gap-2.5">
            <span>Incident Operations & Pipeline Lifecycle</span>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500 text-cyan-300 text-xs font-mono-tech uppercase font-bold">
              Multi-Subpage Architecture
            </span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm font-mono-tech mt-1">
            Dedicated Modular Workflows: Requests Hub • Auto AI Verification • Field Operations • Resolved Quality Audit
          </p>
        </div>

        {/* Global Disaster Early Warning & Emergency Actions */}
        <div className="flex flex-wrap items-center gap-3 font-mono-tech text-xs">
          {/* Level 5 Disaster Warning SMS Broadcast Button */}
          <button
            onClick={() => setIsDisasterModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 text-white font-extrabold flex items-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.45)] uppercase cursor-pointer active:scale-95 transition"
            title="Execute Level 5 Disaster Early Warning & Cellular SMS Broadcast"
          >
            <Flame className="w-4 h-4 animate-pulse" />
            <span>🚨 Level 5 Disaster Broadcast</span>
          </button>

          <button
            onClick={onOpenWorkOrderModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 text-black font-extrabold flex items-center gap-1.5 uppercase cursor-pointer shadow-lg active:scale-95 transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Work Order</span>
          </button>
        </div>
      </div>

      {/* Subpage Navigation Tabs Bar with Real-Time Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono-tech text-xs select-none">
        
        {/* 1. Requests Hub */}
        <button
          onClick={() => setActiveSubpage("requests")}
          className={`p-3.5 rounded-xl border flex items-center justify-between transition cursor-pointer ${
            activeSubpage === "requests"
              ? "bg-[#0E1524] border-cyan-400 text-cyan-300 cyan-glow-sm"
              : "bg-[#0C101A] border-slate-800 text-slate-400 hover:text-white"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Inbox className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-xs uppercase">1. Requests Hub</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 font-extrabold text-white text-[10px]">
            {requestsCount}
          </span>
        </button>

        {/* 2. Auto AI Verification */}
        <button
          onClick={() => setActiveSubpage("ai_verification")}
          className={`p-3.5 rounded-xl border flex items-center justify-between transition cursor-pointer ${
            activeSubpage === "ai_verification"
              ? "bg-[#0E1524] border-cyan-400 text-cyan-300 cyan-glow-sm"
              : "bg-[#0C101A] border-slate-800 text-slate-400 hover:text-white"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-xs uppercase">2. Auto AI Triage</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500 font-extrabold text-cyan-300 text-[10px]">
            {aiVerifiedCount}
          </span>
        </button>

        {/* 3. In Progress */}
        <button
          onClick={() => setActiveSubpage("in_progress")}
          className={`p-3.5 rounded-xl border flex items-center justify-between transition cursor-pointer ${
            activeSubpage === "in_progress"
              ? "bg-[#12100E] border-amber-400 text-amber-300 cyan-glow-sm"
              : "bg-[#0C101A] border-slate-800 text-slate-400 hover:text-white"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="font-bold text-xs uppercase">3. In Progress</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-amber-950 border border-amber-500 font-extrabold text-amber-300 text-[10px]">
            {inProgressCount}
          </span>
        </button>

        {/* 4. Resolved */}
        <button
          onClick={() => setActiveSubpage("resolved")}
          className={`p-3.5 rounded-xl border flex items-center justify-between transition cursor-pointer ${
            activeSubpage === "resolved"
              ? "bg-[#0E1814] border-emerald-400 text-emerald-300 cyan-glow-sm"
              : "bg-[#0C101A] border-slate-800 text-slate-400 hover:text-white"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-xs uppercase">4. Resolved Audit</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500 font-extrabold text-emerald-300 text-[10px]">
            {resolvedCount}
          </span>
        </button>

      </div>

      {/* Render Active Subpage */}
      <div className="pt-2">
        {activeSubpage === "requests" && (
          <RequestsHubSubpage
            incidents={incidents}
            onSelectIncident={setSelectedIncident}
            selectedIncident={selectedIncident}
            onAdvanceStatus={handleAdvanceStatus}
            actionLoading={actionLoading}
          />
        )}

        {activeSubpage === "ai_verification" && (
          <AutoAIVerificationSubpage
            incidents={incidents}
            onSelectIncident={setSelectedIncident}
            selectedIncident={selectedIncident}
            onAdvanceStatus={handleAdvanceStatus}
            actionLoading={actionLoading}
          />
        )}

        {activeSubpage === "in_progress" && (
          <InProgressSubpage
            incidents={incidents}
            onSelectIncident={setSelectedIncident}
            selectedIncident={selectedIncident}
            onAdvanceStatus={handleAdvanceStatus}
            onOpenWorkOrderModal={onOpenWorkOrderModal}
            onOpenDispatchModal={onOpenDispatchModal}
            actionLoading={actionLoading}
          />
        )}

        {activeSubpage === "resolved" && (
          <ResolvedSubpage
            incidents={incidents}
            onSelectIncident={setSelectedIncident}
            selectedIncident={selectedIncident}
            onDeleteIncident={(id) => {
              setIncidents((prev) => prev.filter((i) => i.id !== id));
              if (selectedIncident && selectedIncident.id === id) {
                setSelectedIncident(null);
              }
            }}
          />
        )}
      </div>

      {/* Level 5 Disaster Early Warning Broadcast Modal */}
      {isDisasterModalOpen && (
        <DisasterBroadcastModal
          key="maint-disaster-modal"
          isOpen={isDisasterModalOpen}
          onClose={() => setIsDisasterModalOpen(false)}
          initialIncident={selectedIncident}
          user={user}
        />
      )}

      {/* AI Vision Triage Modal */}
      {selectedIncident && (
        <AIVisionTriageModal
          isOpen={isAITriageModalOpen}
          onClose={() => setIsAITriageModalOpen(false)}
          imageUrl={selectedIncident.imageUrl}
          category={selectedIncident.category}
          onApplyTriage={(triage) => {
            handleAdvanceStatus(selectedIncident, "AI Verified");
          }}
        />
      )}

    </div>
  );
}
