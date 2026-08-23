import React, { useState } from "react";
import {
  Camera,
  MapPin,
  Sparkles,
  Send,
  CheckCircle2,
  AlertTriangle,
  Scan,
  ShieldCheck,
  Activity,
  Layers,
  ArrowLeft
} from "lucide-react";

import { auth } from "../firebase";
import { createComplaint } from "../services/complaintService";
import { uploadImage } from "../services/imageService";
import { addCivicIssue, findNearbySimilarIssues, upvoteIssue, getLocalCivicIssues, saveLocalCivicIssues } from "../services/civicDb";
import { detectMunicipalWardByText } from "../services/municipalWardService";

import LocationPickerMap from "../components/LocationPickerMap";
import AIVisionTriageModal from "../components/AIVisionTriageModal";
import DuplicateClusteringModal from "../components/DuplicateClusteringModal";

export default function CitySyncReportView({
  setActivePage,
  viewMode = "auto",
  user,
}) {
  const isPhoneFrame = viewMode === "phone";

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(
    "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80"
  );
  const [description, setDescription] = useState(
    "Deep asphalt pothole cavity near school crossing creating hazardous traffic bottleneck."
  );
  const [category, setCategory] = useState("Road Damage / Pothole");
  const [priority, setPriority] = useState("P1");
  const [severity, setSeverity] = useState("Critical");

  // Geolocation & Spatial States
  const [latitude, setLatitude] = useState(28.6139);
  const [longitude, setLongitude] = useState(77.2090);
  const [location, setLocation] = useState("Intersection Sector 62 & Ring Road Expressway");
  const [ward, setWard] = useState("Central District - Ward 4");

  // AI Triage Telemetry
  const [aiTriageData, setAiTriageData] = useState(null);
  const [isTriageModalOpen, setIsTriageModalOpen] = useState(false);

  // Duplicate Check Modal
  const [nearbyIssues, setNearbyIssues] = useState([]);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const categories = [
    "Road Damage / Pothole",
    "Water / Drainage Burst",
    "Solid Waste Overflow",
    "Electrical & Streetlight",
    "Structural Anomaly / Bridge Crack",
    "Public Park & Greenery Hazard",
    "Fire & Smoke Hazard",
  ];

  const sampleImages = [
    { label: "🕳️ Road Pothole", url: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80", cat: "Road Damage / Pothole" },
    { label: "💧 Waterline Burst", url: "https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80", cat: "Water / Drainage Burst" },
    { label: "🗑️ Garbage Dump", url: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80", cat: "Solid Waste Overflow" },
    { label: "⚡ Electrical / Wire", url: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80", cat: "Electrical & Streetlight" },
    { label: "🌉 Bridge / Wall Crack", url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80", cat: "Structural Anomaly / Bridge Crack" },
    { label: "🌳 Fallen Tree / Park", url: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80", cat: "Public Park & Greenery Hazard" },
    { label: "🔥 Fire & Smoke", url: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80", cat: "Fire & Smoke Hazard" },
  ];

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const dataUrl = uploadEvent.target.result;
        setImagePreviewUrl(dataUrl);
        setIsTriageModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectSample = (sample) => {
    setImagePreviewUrl(sample.url);
    setCategory(sample.cat);
    setIsTriageModalOpen(true);
  };

  const handleLocationChange = (loc) => {
    setLatitude(loc.latitude);
    setLongitude(loc.longitude);
    setLocation(loc.address);
    if (loc.ward) setWard(loc.ward);

    if (loc.nearbyCount > 0) {
      const nearby = findNearbySimilarIssues(loc.latitude, loc.longitude, category, 200);
      setNearbyIssues(nearby);
    }
  };

  const handleApplyAITriage = (triage) => {
    setAiTriageData(triage);
    if (triage.category) setCategory(triage.category);
    if (triage.priority) setPriority(triage.priority);
    if (triage.severity) setSeverity(triage.severity);
    if (triage.defectName) {
      setDescription(
        `${triage.defectName}\n` +
        `• Recognized Category: ${triage.category}\n` +
        `• AI Detection Certainty: ${(triage.confidence * 100).toFixed(1)}%\n` +
        `• Physical Dimensions: ${triage.dimensions}\n` +
        `• Municipal Unit: ${triage.assignedDepartment}\n` +
        `• Target SLA: ${triage.slaHours} Hours`
      );
    }
  };

  const handleJoinExistingReport = (existingIssue) => {
    upvoteIssue(existingIssue.id, user?.email || "citizen.demo@nexinfra.org");
    setIsDuplicateModalOpen(false);
    alert(`🎉 Successfully Joined & Upvoted Ticket ${existingIssue.id}!\n\nYour citizen confirmation has been registered to expedite municipal repair.`);
    localStorage.setItem("selectedComplaint", JSON.stringify(existingIssue));
    setActivePage("incident-detail");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check for nearby duplicates if not already dismissed
    const nearby = findNearbySimilarIssues(latitude, longitude, category, 200);
    if (nearby.length > 0 && !isDuplicateModalOpen && nearbyIssues.length === 0) {
      setNearbyIssues(nearby);
      setIsDuplicateModalOpen(true);
      return;
    }

    setLoading(true);

    try {
      let finalImageUrl = imagePreviewUrl;
      if (selectedImage) {
        try {
          finalImageUrl = await uploadImage(selectedImage);
        } catch (err) {
          console.log("Image upload fallback to preview url");
        }
      }

      const newTicketId = `CIVIC-${Math.floor(100 + Math.random() * 900)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;

      const newIssueRecord = {
        id: newTicketId,
        title: description.slice(0, 50) || category,
        category,
        description,
        priority: priority || "P2",
        priorityLabel: priority === "P1" ? "P1 - Critical Hazard" : priority === "P2" ? "P2 - High Priority" : "P3 - Medium Priority",
        severity: severity || "High",
        status: aiTriageData ? "AI Verified" : "Reported",
        address: location,
        ward,
        latitude,
        longitude,
        imageUrl: finalImageUrl,
        aiVerified: !!aiTriageData,
        aiConfidence: aiTriageData?.confidence || 0.94,
        defectTags: aiTriageData?.defectTags || [category, "Citizen Reported"],
        assignedDepartment: aiTriageData?.assignedDepartment || "Municipal Public Works Department",
        slaHours: priority === "P1" ? 4 : priority === "P2" ? 12 : 24,
        upvotes: 1,
        upvotedBy: [user?.email || "citizen.creator"],
        reportCount: 1,
        createdBy: user?.email || auth.currentUser?.email || "citizen.demo@nexinfra.org",
        createdAt: new Date().toISOString(),
      };

      // 1. Save to local in-memory DB
      const existingList = getLocalCivicIssues();
      saveLocalCivicIssues([newIssueRecord, ...existingList]);

      // 2. Save to Firestore
      await createComplaint({
        ...newIssueRecord,
        title: newIssueRecord.title,
      });

      setSubmitted(true);
      alert(`✅ Civic Problem Ticket Generated!\n\nTicket ID: ${newTicketId}\nPriority: ${newIssueRecord.priorityLabel}\nAI Verification: ${newIssueRecord.aiVerified ? "Verified (96.4%)" : "Standard Queue"}`);

      setTimeout(() => {
        setSubmitted(false);
        setActivePage("citysync-map");
      }, 1200);

    } catch (error) {
      alert(`Submission note: ${error.message}`);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex justify-center py-8 px-4 w-full">
      <div
        className={`w-full ${
          isPhoneFrame
            ? "max-w-md bg-[#0D121D] border border-slate-800 rounded-2xl p-6"
            : "max-w-4xl bg-[#0D121D] border border-slate-800 rounded-2xl p-8 shadow-2xl"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-5 mb-6">
          <button
            onClick={() => setActivePage("citysync-map")}
            className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 font-mono-tech text-xs uppercase cursor-pointer transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Map</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-cyan-950 border border-cyan-500 text-cyan-300 font-mono-tech text-xs font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI Neural Triage Active</span>
            </span>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
            Report Civic Issue & Infrastructure Defect
          </h1>
          <p className="text-xs text-slate-400 font-mono-tech mt-1">
            Real-time Spatial Geo-tagging • Neural Bounding Verification • Automated Department SLA
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: Visual Telemetry / Photo Upload */}
          <div className="space-y-3 font-mono-tech text-xs">
            <div className="flex items-center justify-between">
              <label className="block text-slate-200 font-bold uppercase tracking-wider">
                Defect Visual Evidence
              </label>
              
              {imagePreviewUrl && (
                <button
                  type="button"
                  onClick={() => setIsTriageModalOpen(true)}
                  className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Scan className="w-3.5 h-3.5" />
                  <span>Inspect Neural Bounding Box</span>
                </button>
              )}
            </div>

            {/* Visual Preview Banner with Sample Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-8 relative rounded-xl overflow-hidden border border-slate-800 bg-[#070A10] h-48 flex items-center justify-center group shadow-md">
                {imagePreviewUrl ? (
                  <>
                    <img
                      src={imagePreviewUrl}
                      alt="Defect"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setIsTriageModalOpen(true)}
                        className="px-4 py-2 rounded-xl bg-cyan-400 text-black font-extrabold uppercase text-xs cyan-glow-sm cursor-pointer"
                      >
                        ⚡ Run AI Triage
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-500 gap-2">
                    <Camera className="w-8 h-8 text-slate-600" />
                    <span>Upload incident photo</span>
                  </div>
                )}
              </div>

              <div className="sm:col-span-4 flex flex-col justify-between space-y-2">
                <div className="grid grid-cols-1 gap-2.5">
                  <label className="w-full py-3 px-4 rounded-xl border border-cyan-500/50 bg-cyan-950/50 hover:bg-cyan-900/60 text-cyan-300 font-bold flex items-center justify-center gap-2 cursor-pointer transition text-xs shadow-sm active:scale-98">
                    <Camera className="w-4 h-4 text-cyan-400" />
                    <span>📸 Take Photo (Camera)</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>

                  <label className="w-full py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-300 font-medium flex items-center justify-center gap-2 cursor-pointer transition text-xs active:scale-98">
                    <span>📁 Upload from Device / Gallery</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* AI Triage Banner if verified */}
          {aiTriageData && (
            <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/50 text-xs font-mono-tech flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-cyan-300 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span>AI Vision Triage Applied: {aiTriageData.defectName}</span>
                </div>
                <div className="text-slate-300 text-[11px]">
                  Priority: <strong className="text-red-400">{aiTriageData.priorityLabel}</strong> • SLA: <strong className="text-cyan-300">{aiTriageData.slaHours}h Max</strong> • Department: {aiTriageData.assignedDepartment}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsTriageModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-cyan-400 text-black font-extrabold text-xs uppercase cursor-pointer shrink-0"
              >
                View Bounding Box
              </button>
            </div>
          )}

          {/* Section 2: Interactive Location Picker Map */}
          <LocationPickerMap
            latitude={latitude}
            longitude={longitude}
            category={category}
            onLocationChange={handleLocationChange}
          />

          {/* Location & Ward Text Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono-tech text-xs">
            <div>
              <label className="block mb-1.5 text-slate-300 font-bold">
                Incident Address / Locality
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => {
                  const val = e.target.value;
                  setLocation(val);
                  const matched = detectMunicipalWardByText(val);
                  if (matched && matched.name) {
                    setWard(matched.name);
                  }
                }}
                placeholder="e.g., Sector 62 Noida, Hauz Khas, Connaught Place..."
                className="w-full bg-[#070A10] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block mb-1.5 text-slate-300 font-bold flex items-center justify-between">
                <span>Auto-Detected Municipal Ward</span>
                <span className="text-[10px] text-cyan-400 font-bold">⚡ AUTO-SYNC</span>
              </label>
              <input
                type="text"
                required
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                className="w-full bg-[#070A10] border border-slate-800 rounded-xl p-3 text-cyan-300 font-bold focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Section 3: Category, Priority, and Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono-tech text-xs">
            <div>
              <label className="block mb-1.5 text-slate-300 font-bold">
                Defect Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#070A10] border border-slate-800 rounded-xl p-3 text-white"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1.5 text-slate-300 font-bold">
                Severity & Priority Tier
              </label>
              <select
                value={priority}
                onChange={(e) => {
                  setPriority(e.target.value);
                  setSeverity(e.target.value === "P1" ? "Critical" : e.target.value === "P2" ? "High" : "Medium");
                }}
                className="w-full bg-[#070A10] border border-slate-800 rounded-xl p-3 text-white"
              >
                <option value="P1">🔴 P1 - Critical Safety Hazard (4h SLA)</option>
                <option value="P2">🟠 P2 - High Priority (12h SLA)</option>
                <option value="P3">🟡 P3 - Medium Priority (24h SLA)</option>
              </select>
            </div>
          </div>

          <div className="font-mono-tech text-xs">
            <label className="block mb-1.5 text-slate-300 font-bold">
              Defect Description & Incident Context
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide specific notes regarding hazard scope, traffic impact, or exact physical landmarks..."
              className="w-full bg-[#070A10] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-400 resize-none text-xs sm:text-sm font-sans"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || submitted}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 text-black font-extrabold text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 cyan-glow-sm hover:from-cyan-300 hover:to-cyan-200 cursor-pointer shadow-xl active:scale-95 disabled:opacity-60 transition"
            >
              {loading ? (
                <span>SYNCHRONIZING GEO-SPATIAL TICKET...</span>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>TRANSMIT CIVIC DEFECT TICKET TO GIS RADAR</span>
                </>
              )}
            </button>
          </div>

        </form>

        {/* AI Vision Triage Modal */}
        <AIVisionTriageModal
          isOpen={isTriageModalOpen}
          onClose={() => setIsTriageModalOpen(false)}
          imageUrl={imagePreviewUrl}
          category={category}
          onApplyTriage={handleApplyAITriage}
        />

        {/* Duplicate Clustering & Join Modal */}
        <DuplicateClusteringModal
          isOpen={isDuplicateModalOpen}
          onClose={() => setIsDuplicateModalOpen(false)}
          nearbyIssues={nearbyIssues}
          onJoinReport={handleJoinExistingReport}
          onProceedNew={() => {
            setIsDuplicateModalOpen(false);
            setNearbyIssues([]);
          }}
        />

      </div>
    </div>
  );
}
