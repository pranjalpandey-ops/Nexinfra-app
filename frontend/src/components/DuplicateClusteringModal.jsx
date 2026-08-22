import React from 'react';
import {
  X,
  AlertTriangle,
  ThumbsUp,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users
} from 'lucide-react';

export default function DuplicateClusteringModal({
  isOpen,
  onClose,
  nearbyIssues = [],
  onJoinReport,
  onProceedNew
}) {
  if (!isOpen || nearbyIssues.length === 0) return null;

  const topIssue = nearbyIssues[0];

  return (
    <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0B0F19] border border-amber-500/50 rounded-2xl max-w-2xl w-full p-6 sm:p-8 cyan-glow-lg relative space-y-6 max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-500/60 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white font-heading">
              Similar Civic Issue Detected Nearby
            </h2>
            <p className="text-xs text-amber-400 font-mono-tech">
              Radius Proximity Check: Matching ticket found within {topIssue.distanceMeters}m
            </p>
          </div>
        </div>

        {/* Proximity Notice */}
        <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/40 text-xs text-amber-200 font-mono-tech flex items-start gap-2.5">
          <Users className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Preventing Redundant Database Tickets:</span> Multiple citizens reported a matching defect at this location. You can confirm & upvote this ticket to elevate municipal urgency.
          </div>
        </div>

        {/* Existing Nearby Ticket Card */}
        <div className="bg-[#070A12] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-500 font-mono-tech text-xs font-bold">
                {topIssue.id}
              </span>
              <span className="px-2.5 py-1 rounded bg-red-950 text-red-300 font-mono-tech text-xs font-bold">
                {topIssue.priorityLabel || topIssue.priority}
              </span>
              <span className="px-2.5 py-1 rounded bg-slate-800 text-cyan-300 font-mono-tech text-xs">
                {topIssue.status}
              </span>
            </div>

            <div className="text-xs text-slate-400 font-mono-tech flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>{topIssue.distanceMeters} meters away</span>
            </div>
          </div>

          <div className="flex gap-4">
            {topIssue.imageUrl && (
              <img
                src={topIssue.imageUrl}
                alt="Nearby Issue"
                className="w-24 h-24 rounded-lg object-cover border border-slate-800 shrink-0"
              />
            )}

            <div className="space-y-1.5 flex-1 font-mono-tech text-xs">
              <h3 className="font-bold text-white text-base font-sans">
                {topIssue.title}
              </h3>
              <p className="text-slate-400 text-xs line-clamp-2">
                {topIssue.description}
              </p>
              <div className="text-slate-300 text-[11px] pt-1">
                📍 {topIssue.address} ({topIssue.ward})
              </div>
              <div className="text-cyan-400 text-[11px] flex items-center gap-2 pt-1">
                <span>👥 {topIssue.reportCount || 1} Citizen Reports</span>
                <span>•</span>
                <span>👍 {topIssue.upvotes || 0} Upvotes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 font-mono-tech text-xs">
          <button
            onClick={() => onJoinReport(topIssue)}
            className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-black font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:from-emerald-300 hover:to-teal-300 cursor-pointer active:scale-95 transition"
          >
            <ThumbsUp className="w-4 h-4" />
            <span>Join & Upvote Existing Report (+1)</span>
          </button>

          <button
            onClick={onProceedNew}
            className="py-3.5 px-5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold uppercase transition cursor-pointer"
          >
            Submit as Distinct New Ticket
          </button>
        </div>

      </div>
    </div>
  );
}
