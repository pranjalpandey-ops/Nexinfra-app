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
  Activity
} from "lucide-react";

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

  // Simulated AI Neural Triage inference response tailored to the image/category
  const isPothole = (category || "").toLowerCase().includes("pothole") || (category || "").toLowerCase().includes("road");
  const isWater = (category || "").toLowerCase().includes("water") || (category || "").toLowerCase().includes("drainage");
  const isWaste = (category || "").toLowerCase().includes("waste") || (category || "").toLowerCase().includes("garbage");

  const triageResult = {
    defectName: isPothole
      ? "Structural Asphalt Pothole & Subsurface Void"
      : isWater
      ? "Pressurized Feeder Pipe Fracture"
      : isWaste
      ? "Municipal Waste Container Overflow"
      : "Civil Infrastructure Surface Breach",
    confidence: isPothole ? 0.964 : isWater ? 0.982 : isWaste ? 0.915 : 0.938,
    priority: isPothole || isWater ? "P1" : isWaste ? "P2" : "P2",
    priorityLabel: isPothole || isWater ? "P1 - Critical Safety Hazard" : "P2 - High Priority",
    severity: isPothole || isWater ? "Critical" : "High",
    assignedDepartment: isPothole
      ? "Road Works & Asphalt Pavement Division"
      : isWater
      ? "Municipal Hydro & Water Supply Grid"
      : isWaste
      ? "Sanitation & Solid Waste Logistics"
      : "Civil Infrastructure Emergency Unit",
    slaHours: isPothole ? 4 : isWater ? 3 : 12,
    dimensions: isPothole
      ? "Length: 1.8m • Width: 1.3m • Depth: ~14cm"
      : isWater
      ? "Est Flow: ~75 Liters/min • Pressure Drop: 3.8 Bar"
      : "Estimated Volume: ~3.2 Cubic Meters",
    boundingBoxes: [
      {
        id: 1,
        label: isPothole ? "Pothole Breach" : isWater ? "Water Plume Source" : "Overflow Spill",
        score: isPothole ? 0.96 : isWater ? 0.98 : 0.91,
        x: 22,
        y: 28,
        w: 54,
        h: 46,
        color: "#00F0FF",
      },
      {
        id: 2,
        label: isPothole ? "Crack Propagation" : isWater ? "Inundation Perimeter" : "Pedestrian Hazard",
        score: 0.88,
        x: 14,
        y: 18,
        w: 72,
        h: 66,
        color: "#fbbf24",
      }
    ],
    defectTags: isPothole
      ? ["Structural Pothole", "Tire Damage Hazard", "Subsurface Erosion"]
      : isWater
      ? ["Hydrostatic Rupture", "Road Inundation", "Pressure Surge"]
      : ["Overflowing Bin", "Bio-hazard Risk", "Sidewalk Obstruction"],
  };

  useEffect(() => {
    setScanStep("scanning");
    setTelemetryLogs(["Initializing YOLOv9-CivicNet Vision Engine..."]);

    const timer1 = setTimeout(() => {
      setTelemetryLogs((prev) => [...prev, "Extracting spatial feature maps & RGB gradient tensors..."]);
    }, 600);

    const timer2 = setTimeout(() => {
      setTelemetryLogs((prev) => [...prev, "Detecting topological surface anomalies & edge fractures..."]);
    }, 1200);

    const timer3 = setTimeout(() => {
      setTelemetryLogs((prev) => [...prev, "Generating neural bounding coordinates & severity classification..."]);
    }, 1800);

    const timer4 = setTimeout(() => {
      setScanStep("analyzed");
    }, 2400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [imageUrl, category]);

  const handleConfirm = () => {
    if (onApplyTriage) {
      onApplyTriage(triageResult);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
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
            <h2 className="text-xl sm:text-2xl font-extrabold text-white font-heading flex items-center gap-2">
              <span>AI Neural Vision Triage Engine</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500 text-cyan-300 font-mono-tech uppercase">
                YOLOv9-CivicNet
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono-tech">
              Automated Defect Bounding, Severity Classification & SLA Routing
            </p>
          </div>
        </div>

        {/* Main Grid: Image Scanning Canvas + Telemetry Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Left: Image with Scanning Laser & Interactive Bounding Boxes */}
          <div className="md:col-span-7 flex flex-col space-y-3">
            <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-[#070A12] aspect-video sm:aspect-4/3 flex items-center justify-center group shadow-xl">
              
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Defect Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 font-mono-tech text-xs space-y-2">
                  <Scan className="w-12 h-12 text-slate-600 animate-pulse" />
                  <span>Loading Site Visual Feed...</span>
                </div>
              )}

              {/* Scanning Laser Line Overlay */}
              {scanStep === "scanning" && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#00F0FF] animate-scan-laser" />
                  <div className="absolute inset-0 bg-cyan-500/10 backdrop-blur-[1px]" />
                </div>
              )}

              {/* Neural Bounding Boxes (SVG Overlay) */}
              {scanStep === "analyzed" && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                  {triageResult.boundingBoxes.map((box, index) => {
                    const isSelected = activeBoxIndex === index;
                    return (
                      <g key={box.id}>
                        {/* Outer Glow Box */}
                        <rect
                          x={`${box.x}%`}
                          y={`${box.y}%`}
                          width={`${box.w}%`}
                          height={`${box.h}%`}
                          fill="rgba(0, 240, 255, 0.08)"
                          stroke={box.color}
                          strokeWidth={isSelected ? 3 : 1.5}
                          strokeDasharray={isSelected ? "none" : "4 2"}
                          className="transition-all"
                        />

                        {/* Corner Target Markers */}
                        <circle cx={`${box.x}%`} cy={`${box.y}%`} r="3" fill={box.color} />
                        <circle cx={`${box.x + box.w}%`} cy={`${box.y}%`} r="3" fill={box.color} />
                        <circle cx={`${box.x}%`} cy={`${box.y + box.h}%`} r="3" fill={box.color} />
                        <circle cx={`${box.x + box.w}%`} cy={`${box.y + box.h}%`} r="3" fill={box.color} />
                      </g>
                    );
                  })}
                </svg>
              )}

              {/* Floating Bounding Box Labels */}
              {scanStep === "analyzed" && (
                <div className="absolute inset-0 pointer-events-none p-3 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="px-2.5 py-1 rounded bg-black/80 backdrop-blur-md border border-cyan-400 text-cyan-300 font-mono-tech text-xs font-bold shadow-lg">
                      [TARGET 01]: {triageResult.boundingBoxes[0].label}
                    </span>
                    <span className="px-2 py-1 rounded bg-emerald-950/80 border border-emerald-500 text-emerald-300 font-mono-tech text-xs font-bold">
                      Confidence: {(triageResult.confidence * 100).toFixed(1)}%
                    </span>
                  </div>

                  <div className="flex justify-between items-end text-[11px] font-mono-tech text-slate-300">
                    <span className="px-2 py-0.5 rounded bg-black/70 border border-slate-700">
                      FOV: 78° Telemetry
                    </span>
                    <span className="px-2 py-0.5 rounded bg-black/70 border border-slate-700">
                      Resolution: 1920x1080
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Neural Tag Chips */}
            <div className="flex flex-wrap gap-2 pt-1 font-mono-tech text-xs">
              {triageResult.defectTags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-[#070A12] border border-cyan-500/40 text-cyan-300 flex items-center gap-1.5"
                >
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{tag}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Right: AI Telemetry & Triage Recommendations */}
          <div className="md:col-span-5 flex flex-col justify-between space-y-4 font-mono-tech text-xs">
            
            {scanStep === "scanning" ? (
              <div className="h-full rounded-xl bg-[#070A12] border border-slate-800 p-5 space-y-3 flex flex-col justify-center">
                <div className="flex items-center gap-3 text-cyan-400 font-bold text-sm">
                  <Scan className="w-5 h-5 animate-spin" />
                  <span>Neural Inference in Progress...</span>
                </div>
                <div className="space-y-2 text-slate-400 text-xs">
                  {telemetryLogs.map((log, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-cyan-400">›</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Verified Defect Card */}
                <div className="p-4 rounded-xl bg-[#070A12] border border-cyan-500/40 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                      Detected Civic Anomaly
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-950 border border-cyan-400 text-cyan-300">
                      Verified (96.4%)
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white font-sans">
                    {triageResult.defectName}
                  </h3>

                  <div className="text-xs text-slate-300">
                    <strong className="text-cyan-400">Estimated Geometry: </strong>
                    <span>{triageResult.dimensions}</span>
                  </div>
                </div>

                {/* Priority & SLA Assignment */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#070A12] border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                      <span>Priority Tier</span>
                    </span>
                    <div className="text-sm font-extrabold text-red-400">
                      {triageResult.priorityLabel}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#070A12] border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Resolution SLA</span>
                    </span>
                    <div className="text-sm font-extrabold text-cyan-300">
                      {triageResult.slaHours} Hours Max
                    </div>
                  </div>
                </div>

                {/* Assigned Department */}
                <div className="p-3.5 rounded-xl bg-[#070A12] border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Auto-Dispatched Department</span>
                  </span>
                  <div className="text-xs font-bold text-white">
                    {triageResult.assignedDepartment}
                  </div>
                </div>

              </div>
            )}

            {/* Action Button */}
            <div className="pt-2">
              <button
                onClick={handleConfirm}
                disabled={scanStep === "scanning"}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cyan-glow-sm hover:from-cyan-300 hover:to-cyan-200 cursor-pointer transition active:scale-95 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Apply AI Triage to Report</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
