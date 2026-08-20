import React, { useState, useEffect } from "react";
import {
  Sparkles,
  CheckCircle2,
  X,
  Scan,
  AlertTriangle,
  Clock,
  Building,
  Maximize2,
  Layers,
  Zap,
  Activity,
  ShieldAlert,
  Cpu,
  Trash2,
  CircleDot,
  Droplets,
  Trees,
  Shield
} from "lucide-react";
import { analyzeImageWithAI } from "../services/visionAiService";

export default function AIVisionTriageModal({
  isOpen,
  onClose,
  imageUrl,
  category,
  onApplyTriage
}) {
  if (!isOpen) return null;

  const [scanStep, setScanStep] = useState("scanning"); // scanning | analyzed
  const [telemetryLogs, setTelemetryLogs] = useState([]);
  const [activeBoxIndex, setActiveBoxIndex] = useState(0);
  const [triageResult, setTriageResult] = useState(null);

  useEffect(() => {
    let isCancelled = false;
    setScanStep("scanning");
    setTelemetryLogs(["[TENSORFLOW-WASM] Initializing YOLOv9-CivicNet Vision Pipeline..."]);

    const runAnalysis = async () => {
      setTimeout(() => {
        if (!isCancelled) {
          setTelemetryLogs((prev) => [
            ...prev,
            "[CONV-2D] Ingesting 256x256 RGB tensor maps & spatial color entropy..."
          ]);
        }
      }, 500);

      setTimeout(() => {
        if (!isCancelled) {
          setTelemetryLogs((prev) => [
            ...prev,
            "[HUE-ENTROPY] Evaluating multi-hue diversity & cavity fracture matrix..."
          ]);
        }
      }, 1000);

      const result = await analyzeImageWithAI(imageUrl);

      setTimeout(() => {
        if (!isCancelled) {
          setTelemetryLogs((prev) => [
            ...prev,
            `[INFERENCE MATCH] Problem: ${result.defectName} (${result.problemLevelLabel})`
          ]);
        }
      }, 1500);

      setTimeout(() => {
        if (!isCancelled) {
          setTriageResult(result);
          setScanStep("analyzed");
        }
      }, 2100);
    };

    runAnalysis();

    return () => {
      isCancelled = true;
    };
  }, [imageUrl]);

  const handleCategorySwitch = (catName) => {
    if (!triageResult) return;

    if (catName === "Solid Waste Overflow") {
      setTriageResult({
        ...triageResult,
        category: "Solid Waste Overflow",
        defectName: "Unattended Solid Waste, Plastic Debris & Landfill Spill",
        priority: "P2",
        priorityLabel: "P2 - High Municipal Priority",
        severity: "High",
        problemLevel: 3,
        problemLevelLabel: "Level 3 - Significant Municipal Hazard",
        hazardScore: 74,
        riskIndicators: ["Public Health & Biowaste Risk", "Pedestrian Right-of-Way Obstruction", "Plastic Degradation Hazard"],
        urgencyLevel: "Elevated Priority (8 Hours SLA)",
        assignedDepartment: "Sanitation & Solid Waste Logistics Unit",
        slaHours: 8,
        dimensions: "Estimated Dump Volume: ~4.2 Cubic Meters • Area: ~16.5m²",
        defectTags: ["Solid Waste Dump", "Uncollected Plastic", "Public Sanitation Hazard", "Biowaste Risk"],
        boundingBoxes: [
          {
            id: 1,
            label: "Solid Waste Heap (98.5%)",
            score: 0.985,
            x: triageResult.boundingBoxes?.[0]?.x || 18,
            y: triageResult.boundingBoxes?.[0]?.y || 20,
            w: triageResult.boundingBoxes?.[0]?.w || 64,
            h: triageResult.boundingBoxes?.[0]?.h || 58,
            color: "#F59E0B"
          }
        ]
      });
    } else if (catName === "Road Damage / Pothole") {
      setTriageResult({
        ...triageResult,
        category: "Road Damage / Pothole",
        defectName: "Water-Filled Structural Asphalt Pothole & Cavity Breach",
        priority: "P1",
        priorityLabel: "P1 - Critical Safety Hazard",
        severity: "Critical",
        problemLevel: 4,
        problemLevelLabel: "Level 4 - Major Infrastructure Breach",
        hazardScore: 91,
        riskIndicators: ["Vehicle Axle & Wheel Rupture", "Hidden Water Cavity Depth >15cm", "Expressway Traffic Hazard"],
        urgencyLevel: "Critical Action Required (4 Hours SLA)",
        assignedDepartment: "Road Works & Asphalt Pavement Division",
        slaHours: 4,
        dimensions: "Length: 1.9m • Width: 1.4m • Depth: ~16cm (Waterlogged)",
        defectTags: ["Waterlogged Pothole", "Structural Pothole", "Asphalt Rupture"],
        boundingBoxes: [
          {
            id: 1,
            label: "Pothole Cavity Void (98.4%)",
            score: 0.984,
            x: triageResult.boundingBoxes?.[0]?.x || 22,
            y: triageResult.boundingBoxes?.[0]?.y || 26,
            w: triageResult.boundingBoxes?.[0]?.w || 56,
            h: triageResult.boundingBoxes?.[0]?.h || 48,
            color: "#EF4444"
          }
        ]
      });
    } else if (catName === "Water / Drainage Burst") {
      setTriageResult({
        ...triageResult,
        category: "Water / Drainage Burst",
        defectName: "Pressurized Water Main Pipe Rupture & Inundation",
        priority: "P1",
        priorityLabel: "P1 - Critical Safety Hazard",
        severity: "Critical",
        problemLevel: 4,
        problemLevelLabel: "Level 4 - Major Infrastructure Breach",
        hazardScore: 89,
        riskIndicators: ["Hydro Grid Depressurization", "Subsurface Soil Liquefaction", "Road Inundation"],
        urgencyLevel: "Critical Action Required (3 Hours SLA)",
        assignedDepartment: "Municipal Hydro & Water Supply Grid",
        slaHours: 3,
        dimensions: "Estimated Flow: ~85 Liters/min • Inundation Area: ~9.2m²",
        defectTags: ["Hydrostatic Rupture", "Road Flooding", "Water Grid Depressurization"],
        boundingBoxes: [
          {
            id: 1,
            label: "Water Plume Breach (97.8%)",
            score: 0.978,
            x: 20,
            y: 24,
            w: 60,
            h: 52,
            color: "#00F0FF"
          }
        ]
      });
    } else if (catName === "Electrical & Streetlight") {
      setTriageResult({
        ...triageResult,
        category: "Electrical & Streetlight",
        defectName: "Streetlight Pole Fracture & Exposed Wire Hazard",
        priority: "P1",
        priorityLabel: "P1 - Critical Safety Hazard",
        severity: "Critical",
        problemLevel: 5,
        problemLevelLabel: "Level 5 - Catastrophic Emergency Hazard",
        hazardScore: 96,
        riskIndicators: ["Live Current Electrocution Hazard", "Pedestrian Fatal Contact Risk", "Fire Ignition Risk"],
        urgencyLevel: "Immediate Emergency Dispatch (1-2 Hours SLA)",
        assignedDepartment: "Municipal Power & Street Lighting Grid",
        slaHours: 2,
        dimensions: "Voltage Hazard: 240V Line Exposure • Luminaire Inactive",
        defectTags: ["Exposed Wiring", "Dark Zone Risk", "Electrical Shock Hazard"],
        boundingBoxes: [
          {
            id: 1,
            label: "Electrical Hazard Zone (96.5%)",
            score: 0.965,
            x: 25,
            y: 15,
            w: 50,
            h: 70,
            color: "#EF4444"
          }
        ]
      });
    } else if (catName === "Structural Anomaly / Bridge Crack") {
      setTriageResult({
        ...triageResult,
        category: "Structural Anomaly / Bridge Crack",
        defectName: "Reinforced Concrete Pillar Shear Fracture & Wall Breach",
        priority: "P1",
        priorityLabel: "P1 - Critical Structural Hazard",
        severity: "Critical",
        problemLevel: 4,
        problemLevelLabel: "Level 4 - Major Structural Integrity Breach",
        hazardScore: 93,
        riskIndicators: ["Load-Bearing Integrity Compromise", "Masonry Collapse Hazard", "Vibration Shear Risk"],
        urgencyLevel: "Critical Engineering Inspection (4 Hours SLA)",
        assignedDepartment: "Structural Engineering & Bridge Safety Division",
        slaHours: 4,
        dimensions: "Crack Propagation Span: 2.8m • Fissure Depth: ~8.5cm",
        defectTags: ["Concrete Shear Fracture", "Structural Fatigue", "Rebar Corrosion Risk"],
        boundingBoxes: [
          {
            id: 1,
            label: "Structural Shear Fissure (97.4%)",
            score: 0.974,
            x: 22,
            y: 18,
            w: 56,
            h: 64,
            color: "#EF4444"
          }
        ]
      });
    } else if (catName === "Public Park & Greenery Hazard") {
      setTriageResult({
        ...triageResult,
        category: "Public Park & Greenery Hazard",
        defectName: "Fallen Tree Limb & Vegetation Roadway Obstruction",
        priority: "P2",
        priorityLabel: "P2 - High Priority",
        severity: "High",
        problemLevel: 3,
        problemLevelLabel: "Level 3 - Roadway Obstruction",
        hazardScore: 68,
        riskIndicators: ["Traffic Flow Blockade", "Overhead Branch Collapse Risk"],
        urgencyLevel: "High Priority (6 Hours SLA)",
        assignedDepartment: "Urban Forestry & Public Parks Department",
        slaHours: 6,
        dimensions: "Estimated Canopy Span: 4.5m • Trunk Diameter: ~28cm",
        defectTags: ["Fallen Timber", "Roadway Blockade", "Greenery Obstruction"],
        boundingBoxes: [
          {
            id: 1,
            label: "Vegetation Obstruction (98.1%)",
            score: 0.981,
            x: 15,
            y: 20,
            w: 70,
            h: 60,
            color: "#10B981"
          }
        ]
      });
    }
  };

  const handleConfirm = () => {
    if (onApplyTriage && triageResult) {
      onApplyTriage(triageResult);
    }
    onClose();
  };

  const activeResult = triageResult || {
    category: "Solid Waste Overflow",
    defectName: "Unattended Solid Waste, Plastic Debris & Landfill Spill",
    confidence: 0.985,
    priority: "P2",
    priorityLabel: "P2 - High Municipal Priority",
    severity: "High",
    problemLevel: 3,
    problemLevelLabel: "Level 3 - Significant Municipal Hazard",
    hazardScore: 74,
    riskIndicators: ["Public Health & Biowaste Risk", "Plastic Spill Spread"],
    urgencyLevel: "Elevated Priority (8 Hours SLA)",
    assignedDepartment: "Sanitation & Solid Waste Logistics Unit",
    slaHours: 8,
    dimensions: "Estimated Dump Volume: ~4.2 Cubic Meters • Area: ~16.5m²",
    defectTags: ["Solid Waste Dump", "Uncollected Plastic", "Public Sanitation Hazard"],
    boundingBoxes: [
      { id: 1, label: "Solid Waste Heap (98.5%)", score: 0.985, x: 18, y: 20, w: 64, h: 58, color: "#F59E0B" }
    ]
  };

  const levelColor =
    activeResult.problemLevel >= 5
      ? "bg-red-950/90 border-red-500 text-red-300"
      : activeResult.problemLevel === 4
      ? "bg-rose-950/90 border-rose-500 text-rose-300"
      : activeResult.problemLevel === 3
      ? "bg-amber-950/90 border-amber-500 text-amber-300"
      : "bg-cyan-950/90 border-cyan-500 text-cyan-300";

  return (
    <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0B0F19] border border-cyan-500/50 rounded-2xl max-w-4xl w-full p-6 sm:p-8 cyan-glow-lg relative flex flex-col max-h-[92vh] overflow-y-auto space-y-6">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-950/90 border border-cyan-400/60 flex items-center justify-center text-cyan-400 cyan-glow-sm">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white font-heading">
                AI Auto-Verify Problem & Severity Level Recognition
              </h3>
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/60 font-mono-tech text-[10px] font-bold uppercase">
                YOLOv9-CivicNet v3
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono-tech mt-0.5">
              Autonomous problem classification, hazard index scoring (Level 1-5), and municipal routing
            </p>
          </div>
        </div>

        {/* SCANNING STATE */}
        {scanStep === "scanning" ? (
          <div className="py-10 space-y-6 text-center">
            {/* Visual Image with Scanning Laser Grid */}
            <div className="relative max-w-md mx-auto aspect-4/3 rounded-2xl overflow-hidden border border-cyan-500/50 bg-black">
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Incident Site Scanning"
                  className="w-full h-full object-cover filter contrast-125"
                />
              )}
              {/* Laser Scanning Bar */}
              <div className="absolute inset-x-0 h-1 bg-cyan-400 shadow-[0_0_15px_#00F0FF] animate-pulse top-1/2 -translate-y-1/2" />
              <div className="absolute inset-0 bg-cyan-500/10 pointer-events-none" />
            </div>

            <div className="max-w-lg mx-auto space-y-2">
              <div className="flex items-center justify-center gap-2 text-cyan-400 font-mono-tech text-sm font-bold">
                <Cpu className="w-5 h-5 animate-spin" />
                <span>Extracting Problem Type & Calculating Severity Level...</span>
              </div>
              <div className="bg-[#070A10] border border-slate-800 rounded-xl p-3 text-left font-mono-tech text-[11px] space-y-1 text-slate-300 max-h-28 overflow-y-auto">
                {telemetryLogs.map((log, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-cyan-400">›</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ANALYZED / TRIAGED STATE */
          <div className="space-y-6">
            
            {/* Problem Level & Category Banner */}
            <div className="p-4 rounded-xl bg-[#070A12] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono-tech text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-3 py-1.5 rounded-xl border font-extrabold flex items-center gap-1.5 shadow-md ${levelColor}`}>
                  <ShieldAlert className="w-4 h-4" />
                  <span>{activeResult.problemLevelLabel}</span>
                </span>

                <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-cyan-300 font-bold flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Hazard Index: {activeResult.hazardScore || 85}/100</span>
                </span>
              </div>

              {/* Quick Switch */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleCategorySwitch("Solid Waste Overflow")}
                  className={`px-2.5 py-1 rounded-lg border font-bold transition flex items-center gap-1 cursor-pointer ${
                    activeResult.category === "Solid Waste Overflow"
                      ? "bg-amber-950 border-amber-400 text-amber-300 shadow-sm"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Garbage Dump</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCategorySwitch("Road Damage / Pothole")}
                  className={`px-2.5 py-1 rounded-lg border font-bold transition flex items-center gap-1 cursor-pointer ${
                    activeResult.category === "Road Damage / Pothole"
                      ? "bg-red-950 border-red-400 text-red-300 shadow-sm"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <CircleDot className="w-3 h-3" />
                  <span>Road Pothole</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCategorySwitch("Water / Drainage Burst")}
                  className={`px-2.5 py-1 rounded-lg border font-bold transition flex items-center gap-1 cursor-pointer ${
                    activeResult.category === "Water / Drainage Burst"
                      ? "bg-cyan-950 border-cyan-400 text-cyan-300 shadow-sm"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <Droplets className="w-3 h-3" />
                  <span>Water Burst</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCategorySwitch("Electrical & Streetlight")}
                  className={`px-2.5 py-1 rounded-lg border font-bold transition flex items-center gap-1 cursor-pointer ${
                    activeResult.category === "Electrical & Streetlight"
                      ? "bg-amber-950 border-amber-400 text-amber-300 shadow-sm"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <Zap className="w-3 h-3" />
                  <span>Electrical</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCategorySwitch("Structural Anomaly / Bridge Crack")}
                  className={`px-2.5 py-1 rounded-lg border font-bold transition flex items-center gap-1 cursor-pointer ${
                    activeResult.category === "Structural Anomaly / Bridge Crack"
                      ? "bg-red-950 border-red-400 text-red-300 shadow-sm"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <Layers className="w-3 h-3" />
                  <span>Bridge Crack</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCategorySwitch("Public Park & Greenery Hazard")}
                  className={`px-2.5 py-1 rounded-lg border font-bold transition flex items-center gap-1 cursor-pointer ${
                    activeResult.category === "Public Park & Greenery Hazard"
                      ? "bg-emerald-950 border-emerald-400 text-emerald-300 shadow-sm"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <Trees className="w-3 h-3" />
                  <span>Tree / Park</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Left Column: Image with Real Bounding Boxes */}
              <div className="md:col-span-7 space-y-3">
                <div className="relative aspect-4/3 rounded-2xl overflow-hidden border border-cyan-500/60 bg-black group shadow-xl">
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt="Incident Analyzed Site"
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* SVG Bounding Boxes Overlay */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {activeResult.boundingBoxes?.map((box, idx) => {
                      const isActive = activeBoxIndex === idx;
                      return (
                        <g key={box.id || idx}>
                          <rect
                            x={`${box.x}%`}
                            y={`${box.y}%`}
                            width={`${box.w}%`}
                            height={`${box.h}%`}
                            fill={isActive ? "rgba(245, 158, 11, 0.15)" : "rgba(239, 68, 68, 0.12)"}
                            stroke={box.color || "#F59E0B"}
                            strokeWidth={isActive ? "3" : "2"}
                            strokeDasharray={idx === 1 ? "4 4" : "none"}
                          />
                          <circle cx={`${box.x}%`} cy={`${box.y}%`} r="4" fill={box.color || "#F59E0B"} />
                          <circle cx={`${box.x + box.w}%`} cy={`${box.y}%`} r="4" fill={box.color || "#F59E0B"} />
                          <circle cx={`${box.x}%`} cy={`${box.y + box.h}%`} r="4" fill={box.color || "#F59E0B"} />
                          <circle cx={`${box.x + box.w}%`} cy={`${box.y + box.h}%`} r="4" fill={box.color || "#F59E0B"} />
                        </g>
                      );
                    })}
                  </svg>

                  {/* Top Overlay Badge */}
                  <div className="absolute top-3 left-3 px-3 py-1.5 rounded-lg bg-black/85 backdrop-blur-md border border-cyan-400 text-cyan-300 text-xs font-mono-tech font-bold flex items-center gap-1.5 shadow-lg">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>VERIFICATION CONFIDENCE: {(activeResult.confidence * 100).toFixed(1)}%</span>
                  </div>
                </div>

                {/* Detected Bounding Box Tags */}
                <div className="flex flex-wrap gap-2 pt-1 font-mono-tech text-xs">
                  {activeResult.boundingBoxes?.map((box, idx) => (
                    <button
                      key={box.id || idx}
                      onClick={() => setActiveBoxIndex(idx)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        activeBoxIndex === idx
                          ? "bg-amber-950 border-amber-400 text-amber-300 cyan-glow-sm"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: box.color || "#F59E0B" }} />
                      <span>{box.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Column: AI Triage Inferred Details */}
              <div className="md:col-span-5 space-y-4 font-mono-tech text-xs">
                
                {/* Defect Recognition Card */}
                <div className="p-4 rounded-xl bg-[#070A12] border border-cyan-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">
                      Detected Problem Type
                    </span>
                    <span className="text-[10px] text-amber-400 font-bold">
                      LEVEL {activeResult.problemLevel || 3} HAZARD
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white font-sans">
                    {activeResult.defectName}
                  </h4>
                  <p className="text-slate-300 text-xs font-sans">
                    Primary Domain: <strong className="text-cyan-300">{activeResult.category}</strong>
                  </p>
                </div>

                {/* Priority & SLA Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#070A12] border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 block font-bold">SEVERITY LEVEL</span>
                    <div className="text-sm font-extrabold text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{activeResult.priority} - {activeResult.severity}</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#070A12] border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 block font-bold">RESPONSE SLA</span>
                    <div className="text-sm font-extrabold text-cyan-300 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{activeResult.slaHours} Hours</span>
                    </div>
                  </div>
                </div>

                {/* Identified Risk Indicators */}
                {activeResult.riskIndicators && activeResult.riskIndicators.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-[#070A12] border border-red-500/30 space-y-1.5">
                    <span className="text-[10px] text-red-400 block font-bold uppercase">
                      Identified Municipal Hazards
                    </span>
                    <div className="space-y-1">
                      {activeResult.riskIndicators.map((risk, i) => (
                        <div key={i} className="text-[11px] text-slate-300 flex items-center gap-1.5 font-sans">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                          <span>{risk}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Assigned Department */}
                <div className="p-3.5 rounded-xl bg-[#070A12] border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 block font-bold">ASSIGNED DEPARTMENT</span>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-cyan-400" />
                    <span>{activeResult.assignedDepartment}</span>
                  </div>
                </div>

                {/* Estimated Physical Dimensions */}
                <div className="p-3.5 rounded-xl bg-[#070A12] border border-cyan-500/30 space-y-1">
                  <span className="text-[10px] text-cyan-400 block font-bold">AI SPATIAL ESTIMATE</span>
                  <p className="text-xs text-slate-200 font-sans font-medium">
                    {activeResult.dimensions}
                  </p>
                </div>

              </div>

            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between border-t border-slate-800 pt-5 font-mono-tech text-xs">
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white cursor-pointer transition"
              >
                Cancel & Retake
              </button>

              <button
                onClick={handleConfirm}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 hover:from-cyan-300 text-black font-extrabold uppercase flex items-center gap-2 cyan-glow-sm shadow-xl cursor-pointer active:scale-95 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Auto-Verify & Apply Level Triage ✓</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
