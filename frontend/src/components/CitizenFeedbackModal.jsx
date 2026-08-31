import React, { useState } from "react";
import {
  X,
  MessageSquareHeart,
  Star,
  CheckCircle2,
  AlertTriangle,
  Send,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  MapPin,
  Clock
} from "lucide-react";
import { addCitizenFeedback } from "../services/civicDb";

export default function CitizenFeedbackModal({
  isOpen,
  onClose,
  incident,
  user,
  onFeedbackSubmitted
}) {
  if (!isOpen || !incident) return null;

  const isResolved = incident.status === "Resolved";

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [confirmation, setConfirmation] = useState(
    isResolved ? "Yes, Fully Resolved" : "Work Observed On Site"
  );
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const resolvedOptions = [
    { label: "✅ Yes, Fully Fixed & Paved", value: "Yes, Fully Resolved" },
    { label: "⚠️ Partial Fix / Debris Remains", value: "Partially Resolved" },
    { label: "❌ Not Fixed / Problem Persists", value: "Not Fixed" },
  ];

  const activeOptions = [
    { label: "🚧 Crew Working On Site", value: "Work Observed On Site" },
    { label: "⏳ No Crew Yet / Heavy Delay", value: "No Crew Present" },
    { label: "🚨 Hazard Expanding / Danger", value: "Hazard Worsening" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    const isPositive = confirmation === "Yes, Fully Resolved" || confirmation === "Work Observed On Site";

    const feedbackPayload = {
      rating,
      statusConfirmation: confirmation,
      comment: comment.trim() || (isResolved ? "Citizen verified resolution quality." : "Citizen provided ground status update."),
      citizenName: user?.name || "Verified Resident Citizen",
      citizenEmail: user?.email || "resident@nexinfra.org",
      isPositive
    };

    const updatedList = addCitizenFeedback(incident.id, feedbackPayload);
    setSubmitted(true);

    if (onFeedbackSubmitted) {
      const current = updatedList.find((i) => i.id === incident.id);
      onFeedbackSubmitted(current || incident);
    }

    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-mono-tech">
      <div className="bg-[#0B0F19] border border-cyan-500/50 rounded-2xl p-6 sm:p-7 max-w-full sm:max-w-lg mx-4 w-full cyan-glow-lg relative space-y-5 animate-hero-entrance max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-400/60 flex items-center justify-center text-cyan-400 cyan-glow-sm">
            <MessageSquareHeart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-heading">
              {isResolved ? "Citizen Resolution Verification" : "Citizen Ground Status Feedback"}
            </h3>
            <p className="text-xs text-cyan-400 uppercase tracking-wider">
              {isResolved ? "Rate Municipal Work Quality" : "Report Real-Time Ground Observations"}
            </p>
          </div>
        </div>

        {/* Incident Summary Pill */}
        <div className="p-3.5 rounded-xl bg-[#070A10] border border-slate-800 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-cyan-300">{incident.id}</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
              isResolved ? "bg-emerald-950 border border-emerald-500 text-emerald-300" : "bg-amber-950 border border-amber-500 text-amber-300"
            }`}>
              {incident.status}
            </span>
          </div>
          <div className="text-white font-bold font-sans text-sm">{incident.title}</div>
          <div className="text-slate-400 text-[11px] flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">{incident.address || "Ward Area"}</span>
          </div>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-950/80 border border-emerald-500 flex items-center justify-center text-emerald-400 mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white font-heading">
              Feedback Submitted Successfully!
            </h4>
            <p className="text-xs text-emerald-300">
              Thank you for verifying ground infrastructure quality for your neighborhood.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Ground Confirmation Options */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-bold uppercase">
                {isResolved ? "1. Verify Ground Resolution Quality:" : "1. What is the current ground status?"}
              </label>
              <div className="grid grid-cols-1 gap-2">
                {(isResolved ? resolvedOptions : activeOptions).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setConfirmation(opt.value)}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                      confirmation === opt.value
                        ? "bg-cyan-950/80 border-cyan-400 text-cyan-300 cyan-glow-sm font-bold"
                        : "bg-[#070A10] border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {confirmation === opt.value && <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Star Rating (Quality of Service) */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-slate-300 font-bold uppercase">
                2. Municipal Response Satisfaction Rating:
              </label>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[#070A10] border border-slate-800">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 cursor-pointer transition transform hover:scale-125"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        (hoverRating || rating) >= star
                          ? "text-amber-400 fill-amber-400"
                          : "text-slate-600"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-xs font-bold text-amber-300">
                  {rating === 5 ? "⭐⭐⭐⭐⭐ Excellent" :
                   rating === 4 ? "⭐⭐⭐⭐ Good" :
                   rating === 3 ? "⭐⭐⭐ Average" :
                   rating === 2 ? "⭐⭐ Subpar" : "⭐ Critical Disapproval"}
                </span>
              </div>
            </div>

            {/* Comment Notes */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-slate-300 font-bold uppercase">
                3. Ground Observations & Notes (Optional):
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={isResolved ? "e.g., Road surface is flat and smooth, all warning cones removed..." : "e.g., Water is still leaking near the main gate, traffic bottleneck active..."}
                rows={3}
                className="w-full bg-[#070A10] border border-slate-800 rounded-xl p-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 transition"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-cyan-200 text-black font-extrabold text-xs uppercase cyan-glow-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-95 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Submit Ground Feedback to Municipal Board</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
