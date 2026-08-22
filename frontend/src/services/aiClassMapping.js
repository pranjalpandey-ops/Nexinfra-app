/**
 * NEXINFRA CENTRALIZED AI CLASS MAPPING & CANONICAL CIVIC TAXONOMY
 * Maps all raw ONNX model outputs, sensor labels, and legacy tags into
 * the 7 NEXinfra Canonical Civic Categories (including Fire & Smoke Hazard).
 *
 * Canonical Categories:
 * 1. Road Damage / Pothole
 * 2. Water / Drainage Burst
 * 3. Solid Waste Overflow
 * 4. Electrical & Streetlight
 * 5. Structural Anomaly / Bridge Crack
 * 6. Public Park & Greenery Hazard
 * 7. Fire & Smoke Hazard
 */

export const CANONICAL_CIVIC_CATEGORIES = [
  "Road Damage / Pothole",
  "Water / Drainage Burst",
  "Solid Waste Overflow",
  "Electrical & Streetlight",
  "Structural Anomaly / Bridge Crack",
  "Public Park & Greenery Hazard",
  "Fire & Smoke Hazard"
];

export const CANONICAL_METADATA = {
  "Road Damage / Pothole": {
    canonicalCategory: "Road Damage / Pothole",
    defectName: "Critical Pothole & Road Cavity",
    department: "Roads",
    assignedDepartment: "Road Maintenance & Pavement Division",
    priority: "P1",
    priorityLabel: "P1 - Critical Hazard",
    severity: "Critical",
    slaHours: 4,
    color: "#EF4444",
    droneMissionType: "LiDAR Road Surface Volume Profiling",
    tags: ["Pothole", "Road Damage", "Asphalt Cavity", "Open Manhole", "Chamber Breach"]
  },
  "Water / Drainage Burst": {
    canonicalCategory: "Water / Drainage Burst",
    defectName: "High-Pressure Water Main Burst & Flooding",
    department: "Hydro / Water Supply",
    assignedDepartment: "Municipal Hydro & Water Supply Grid",
    priority: "P1",
    priorityLabel: "P1 - Critical Hazard",
    severity: "Critical",
    slaHours: 3,
    color: "#00F0FF",
    droneMissionType: "Thermal Infrared Plume & Subsurface Flow Scan",
    tags: ["Waterlogging", "Drainage Burst", "Water Main Leak", "Flooded Surface", "Subsurface Pipe Rupture"]
  },
  "Solid Waste Overflow": {
    canonicalCategory: "Solid Waste Overflow",
    defectName: "Solid Waste Accumulation & Dump Overflow",
    department: "Sanitation",
    assignedDepartment: "Sanitation & Solid Waste Logistics Unit",
    priority: "P2",
    priorityLabel: "P2 - High Priority",
    severity: "High",
    slaHours: 8,
    color: "#F59E0B",
    droneMissionType: "Volumetric Debris & Bio-hazard Perimeter Survey",
    tags: ["Solid Waste", "Garbage Overflow", "Plastic Debris Heap", "Sidewalk Obstruction"]
  },
  "Electrical & Streetlight": {
    canonicalCategory: "Electrical & Streetlight",
    defectName: "Electrical Grid & Streetlight Blackout Hazard",
    department: "Power",
    assignedDepartment: "Municipal Power & Electrical Grid",
    priority: "P1",
    priorityLabel: "P1 - Critical Hazard",
    severity: "Critical",
    slaHours: 2,
    color: "#F97316",
    droneMissionType: "Electromagnetic & Corona Discharge Infrared Scan",
    tags: ["Exposed Wiring", "Streetlight Outage", "Transformer Spark", "Feeder Pillar Tripped"]
  },
  "Structural Anomaly / Bridge Crack": {
    canonicalCategory: "Structural Anomaly / Bridge Crack",
    defectName: "Structural Concrete Shear & Bridge Crack",
    department: "Structural Engineering",
    assignedDepartment: "Structural Engineering & Bridge Safety Division",
    priority: "P1",
    priorityLabel: "P1 - Critical Hazard",
    severity: "Critical",
    slaHours: 4,
    color: "#8B5CF6",
    droneMissionType: "Structural Resonance & Optical Crack Measurement",
    tags: ["Wall Crack", "Bridge Shear", "Pillar Fracture", "Structural Defect", "Load Bearing Anomaly"]
  },
  "Public Park & Greenery Hazard": {
    canonicalCategory: "Public Park & Greenery Hazard",
    defectName: "Fallen Tree & Roadway Greenery Obstruction",
    department: "Forestry",
    assignedDepartment: "Urban Forestry & Public Parks Department",
    priority: "P2",
    priorityLabel: "P2 - High Priority",
    severity: "High",
    slaHours: 6,
    color: "#10B981",
    droneMissionType: "Canopy LiDAR & Arboreal Clearance Analysis",
    tags: ["Fallen Tree", "Overhanging Branch", "Greenery Obstruction", "Canopy Blockade"]
  },
  "Fire & Smoke Hazard": {
    canonicalCategory: "Fire & Smoke Hazard",
    defectName: "Urban Fire & Smoke Outbreak Hazard",
    department: "Fire & Emergency",
    assignedDepartment: "Fire & Emergency Disaster Response Unit",
    priority: "P1",
    priorityLabel: "P1 - Immediate Emergency",
    severity: "Critical",
    slaHours: 1,
    color: "#DC2626",
    droneMissionType: "Thermal Infrared Flame Perimeter & Toxic Gas Dispersion Scan",
    tags: ["Active Fire", "Smoke Plume", "Combustion Hazard", "Thermal Flare", "Emergency Evacuation Alert"]
  }
};

/**
 * Raw ONNX model class name mapping to Canonical Categories
 */
export const AI_CLASS_MAPPING = {
  // 1. Road Damage / Pothole
  "pothole_road_defect": "Road Damage / Pothole",
  "pothole": "Road Damage / Pothole",
  "potholes": "Road Damage / Pothole",
  "road_defect": "Road Damage / Pothole",
  "road_damage": "Road Damage / Pothole",
  "open_manhole": "Road Damage / Pothole",
  "open manhole": "Road Damage / Pothole",
  "Road Damage / Pothole": "Road Damage / Pothole",
  "0": "Road Damage / Pothole",

  // 2. Water / Drainage Burst
  "water_drainage_burst": "Water / Drainage Burst",
  "water_burst": "Water / Drainage Burst",
  "drainage_burst": "Water / Drainage Burst",
  "waterlogging": "Water / Drainage Burst",
  "water_logging": "Water / Drainage Burst",
  "water_leak": "Water / Drainage Burst",
  "Water / Drainage Burst": "Water / Drainage Burst",
  "1": "Water / Drainage Burst",

  // 3. Solid Waste Overflow
  "garbage_waste_overflow": "Solid Waste Overflow",
  "garbage_overflow": "Solid Waste Overflow",
  "waste_overflow": "Solid Waste Overflow",
  "solid_waste": "Solid Waste Overflow",
  "trash_overflow": "Solid Waste Overflow",
  "garbage": "Solid Waste Overflow",
  "Solid Waste Overflow": "Solid Waste Overflow",
  "2": "Solid Waste Overflow",

  // 4. Electrical & Streetlight
  "electrical_hazard": "Electrical & Streetlight",
  "electrical_streetlight": "Electrical & Streetlight",
  "streetlight_hazard": "Electrical & Streetlight",
  "power_hazard": "Electrical & Streetlight",
  "exposed_wiring": "Electrical & Streetlight",
  "Electrical & Streetlight": "Electrical & Streetlight",
  "Electrical / Streetlight": "Electrical & Streetlight",
  "Electrical & Streetlight Hazard": "Electrical & Streetlight",
  "3": "Electrical & Streetlight",

  // 5. Structural Anomaly / Bridge Crack
  "structural_bridge_crack": "Structural Anomaly / Bridge Crack",
  "bridge_crack": "Structural Anomaly / Bridge Crack",
  "structural_crack": "Structural Anomaly / Bridge Crack",
  "structural_defect": "Structural Anomaly / Bridge Crack",
  "wall_crack": "Structural Anomaly / Bridge Crack",
  "pillar_crack": "Structural Anomaly / Bridge Crack",
  "Structural Anomaly / Bridge Crack": "Structural Anomaly / Bridge Crack",
  "Structural / Bridge Crack": "Structural Anomaly / Bridge Crack",
  "4": "Structural Anomaly / Bridge Crack",

  // 6. Public Park & Greenery Hazard
  "tree_greenery_hazard": "Public Park & Greenery Hazard",
  "tree_hazard": "Public Park & Greenery Hazard",
  "greenery_hazard": "Public Park & Greenery Hazard",
  "fallen_tree": "Public Park & Greenery Hazard",
  "broken_tree": "Public Park & Greenery Hazard",
  "Public Park & Greenery Hazard": "Public Park & Greenery Hazard",
  "Fallen Tree & Greenery Hazard": "Public Park & Greenery Hazard",
  "5": "Public Park & Greenery Hazard",

  // 7. Fire & Smoke Hazard
  "fire_smoke_hazard": "Fire & Smoke Hazard",
  "fire_hazard": "Fire & Smoke Hazard",
  "fire": "Fire & Smoke Hazard",
  "flame": "Fire & Smoke Hazard",
  "smoke": "Fire & Smoke Hazard",
  "smoke_plume": "Fire & Smoke Hazard",
  "building_fire": "Fire & Smoke Hazard",
  "transformer_fire": "Fire & Smoke Hazard",
  "Fire & Smoke Hazard": "Fire & Smoke Hazard",
  "Fire / Smoke Hazard": "Fire & Smoke Hazard",
  "6": "Fire & Smoke Hazard"
};

/**
 * Resolves any raw model output or sensor string to its Canonical Civic Category
 */
export function getCanonicalCategory(rawClass) {
  if (rawClass === null || rawClass === undefined) {
    return "Road Damage / Pothole";
  }

  const key = String(rawClass).trim();
  if (AI_CLASS_MAPPING[key]) {
    return AI_CLASS_MAPPING[key];
  }

  const lower = key.toLowerCase();
  if (AI_CLASS_MAPPING[lower]) {
    return AI_CLASS_MAPPING[lower];
  }

  // Fuzzy keyword matching
  if (lower.includes("fire") || lower.includes("smoke") || lower.includes("flame") || lower.includes("burn") || lower.includes("blaze")) {
    return "Fire & Smoke Hazard";
  }
  if (lower.includes("pothole") || lower.includes("manhole") || lower.includes("asphalt") || lower.includes("road")) {
    return "Road Damage / Pothole";
  }
  if (lower.includes("water") || lower.includes("drain") || lower.includes("flood") || lower.includes("pipe")) {
    return "Water / Drainage Burst";
  }
  if (lower.includes("garbage") || lower.includes("waste") || lower.includes("trash") || lower.includes("debris")) {
    return "Solid Waste Overflow";
  }
  if (lower.includes("electric") || lower.includes("wire") || lower.includes("light") || lower.includes("power") || lower.includes("spark")) {
    return "Electrical & Streetlight";
  }
  if (lower.includes("crack") || lower.includes("bridge") || lower.includes("pillar") || lower.includes("structur")) {
    return "Structural Anomaly / Bridge Crack";
  }
  if (lower.includes("tree") || lower.includes("branch") || lower.includes("green") || lower.includes("park") || lower.includes("forest")) {
    return "Public Park & Greenery Hazard";
  }

  return "Road Damage / Pothole";
}

/**
 * Returns full canonical metadata for a raw class or canonical category
 */
export function getCanonicalMetadata(rawClass) {
  const canonical = getCanonicalCategory(rawClass);
  return CANONICAL_METADATA[canonical] || CANONICAL_METADATA["Road Damage / Pothole"];
}
