// Comprehensive Civic Issue Database with spatial coordinates, AI verification metadata & SLA timers

export const initialCivicIssues = [
  {
    id: "CIVIC-892A",
    title: "Critical Pothole & Road Cave-in",
    category: "Road Damage / Pothole",
    priority: "P1", // P1, P2, P3
    priorityLabel: "P1 - Critical Hazard",
    severity: "Critical",
    status: "AI Verified", // Reported, AI Verified, In Progress, Resolved
    address: "Intersection Sector 62 & Ring Road Expressway",
    ward: "Central District - Ward 4",
    latitude: 28.6139,
    longitude: 77.2090,
    imageUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
    description: "Deep structural road crater exceeding 15cm depth near school crosswalk causing severe vehicle damage and traffic bottleneck.",
    aiVerified: true,
    aiConfidence: 0.964,
    defectTags: ["Structural Pothole", "Asphalt Rupture", "Tire Hazard"],
    boundingBoxes: [
      { label: "Pothole Breach (0.96)", x: 22, y: 30, w: 56, h: 48, severity: "Critical" }
    ],
    estimatedDimensions: "1.9m x 1.3m (Depth: 16cm)",
    assignedDepartment: "Road Maintenance & Pavement Division",
    slaHours: 4,
    slaDeadline: new Date(Date.now() + 2.5 * 3600 * 1000).toISOString(),
    upvotes: 24,
    upvotedBy: ["citizen1@nexinfra.org", "citizen.demo@nexinfra.org"],
    reportCount: 5,
    createdBy: "citizen.demo@nexinfra.org",
    createdAt: new Date(Date.now() - 3.5 * 3600 * 1000).toISOString(),
  },
  {
    id: "CIVIC-114B",
    title: "High-Pressure Main Waterline Burst",
    category: "Water / Drainage Burst",
    priority: "P1",
    priorityLabel: "P1 - Critical Hazard",
    severity: "Critical",
    status: "In Progress",
    address: "Block C Main Avenue, Near Metro Gate 3",
    ward: "Sector 18 Ward - Zone A",
    latitude: 28.6220,
    longitude: 77.2140,
    imageUrl: "https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80",
    description: "300mm potable feeder line fractured underneath pavement. Active water flooding onto roadway at approx 80 liters/min.",
    aiVerified: true,
    aiConfidence: 0.982,
    defectTags: ["Subsurface Pipe Rupture", "Road Inundation", "Pressure Surge"],
    boundingBoxes: [
      { label: "Water Plume (0.98)", x: 18, y: 24, w: 64, h: 58, severity: "Critical" }
    ],
    estimatedDimensions: "Pressure Loss: 4.2 Bar • Flow: 80L/min",
    assignedDepartment: "Municipal Hydro & Water Supply Grid",
    slaHours: 3,
    slaDeadline: new Date(Date.now() + 1.2 * 3600 * 1000).toISOString(),
    upvotes: 38,
    upvotedBy: ["resident.kumar@domain.com"],
    reportCount: 8,
    createdBy: "resident.kumar@domain.com",
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
  },
  {
    id: "CIVIC-304D",
    title: "Overflowing Waste Compact Station",
    category: "Solid Waste Overflow",
    priority: "P2",
    priorityLabel: "P2 - High Priority",
    severity: "High",
    status: "AI Verified",
    address: "Greenway Market Square & 4th Cross",
    ward: "North Green Corridor - Ward 2",
    latitude: 28.6060,
    longitude: 77.1945,
    imageUrl: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80",
    description: "Community waste bin at 160% capacity overflowing onto pedestrian walkway, causing hygiene hazard.",
    aiVerified: true,
    aiConfidence: 0.915,
    defectTags: ["Solid Waste Accumulation", "Bio-hazard Risk", "Sidewalk Obstruction"],
    boundingBoxes: [
      { label: "Waste Overflow (0.91)", x: 15, y: 20, w: 68, h: 62, severity: "High" }
    ],
    estimatedDimensions: "Volume: ~3.4 Cubic Meters",
    assignedDepartment: "Sanitation & Solid Waste Logistics",
    slaHours: 12,
    slaDeadline: new Date(Date.now() + 6.8 * 3600 * 1000).toISOString(),
    upvotes: 14,
    upvotedBy: [],
    reportCount: 3,
    createdBy: "greenway.watch@community.org",
    createdAt: new Date(Date.now() - 5.5 * 3600 * 1000).toISOString(),
  },
  {
    id: "CIVIC-508E",
    title: "Streetlight Circuit Blackout (500m Span)",
    category: "Electrical & Streetlight",
    priority: "P2",
    priorityLabel: "P2 - High Priority",
    severity: "High",
    status: "Reported",
    address: "Old Fort Radial Boulevard",
    ward: "Cyber Hub - Ward 12",
    latitude: 28.6185,
    longitude: 77.2210,
    imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
    description: "12 consecutive LED luminaire poles unpowered creating a pitch-black blind spot for evening commuters.",
    aiVerified: true,
    aiConfidence: 0.894,
    defectTags: ["Feeder Pillar Tripped", "Luminance Zero", "Safety Hazard"],
    boundingBoxes: [
      { label: "Dark Corridor (0.89)", x: 10, y: 15, w: 80, h: 70, severity: "High" }
    ],
    estimatedDimensions: "Affected Grid Span: 520 Meters",
    assignedDepartment: "Energy & Municipal Lighting Grid",
    slaHours: 18,
    slaDeadline: new Date(Date.now() + 14 * 3600 * 1000).toISOString(),
    upvotes: 19,
    upvotedBy: [],
    reportCount: 4,
    createdBy: "night.patrol@nexinfra.org",
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: "CIVIC-902C",
    title: "Bridge Expansion Joint Cable Stress Anomaly",
    category: "Structural Anomaly / Bridge Crack",
    priority: "P1",
    priorityLabel: "P1 - Critical Hazard",
    severity: "Critical",
    status: "In Progress",
    address: "East Flyover Span 14-B",
    ward: "East Ring - Ward 8",
    latitude: 28.6005,
    longitude: 77.2275,
    imageUrl: "https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&w=800&q=80",
    description: "Drone optical scan identified hairline diagonal shear fracture on concrete pier head cap.",
    aiVerified: true,
    aiConfidence: 0.978,
    defectTags: ["Concrete Pier Shear", "Load Bearing Anomaly", "Vibration Warning"],
    boundingBoxes: [
      { label: "Structural Crack (0.98)", x: 25, y: 35, w: 45, h: 40, severity: "Critical" }
    ],
    estimatedDimensions: "Crack Length: 42cm • Width: 3.8mm",
    assignedDepartment: "Civil Engineering & Structural Safety Unit",
    slaHours: 6,
    slaDeadline: new Date(Date.now() + 3.8 * 3600 * 1000).toISOString(),
    upvotes: 42,
    upvotedBy: ["admin@nexinfra.gov"],
    reportCount: 9,
    createdBy: "drone.scan.ai@nexinfra.gov",
    createdAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
  },
  {
    id: "CIVIC-721F",
    title: "Traffic Signal Controller Timing Drift",
    category: "Electrical & Streetlight",
    priority: "P3",
    priorityLabel: "P3 - Medium Priority",
    severity: "Medium",
    status: "Resolved",
    address: "Technology Park Circular Junction",
    ward: "Cyber Hub - Ward 12",
    latitude: 28.6290,
    longitude: 77.2020,
    imageUrl: "https://images.unsplash.com/photo-1508873696983-2df5293cb325?auto=format&fit=crop&w=800&q=80",
    description: "Signal cycle stuck on 180s red delay. Reprogrammed with adaptive timing profile.",
    aiVerified: true,
    aiConfidence: 0.941,
    defectTags: ["PLC Timing Error", "Traffic Queue"],
    boundingBoxes: [
      { label: "Signal Node (0.94)", x: 30, y: 20, w: 40, h: 60, severity: "Medium" }
    ],
    estimatedDimensions: "Delay Reduction: 74%",
    assignedDepartment: "Intelligent Traffic Management Unit",
    slaHours: 24,
    slaDeadline: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    upvotes: 11,
    upvotedBy: [],
    reportCount: 2,
    createdBy: "traffic.police@nexinfra.gov",
    createdAt: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
  }
];

// Distance Calculation using Haversine Formula (in meters)
export function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 999999;
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Local Storage In-Memory State
export function getLocalCivicIssues() {
  try {
    const saved = localStorage.getItem("nexinfra_civic_issues");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error("Error reading civic issues:", e);
  }
  localStorage.setItem("nexinfra_civic_issues", JSON.stringify(initialCivicIssues));
  return initialCivicIssues;
}

export function saveLocalCivicIssues(issues) {
  try {
    localStorage.setItem("nexinfra_civic_issues", JSON.stringify(issues));
  } catch (e) {
    console.error("Error saving civic issues:", e);
  }
}

export function addCivicIssue(issue) {
  const existing = getLocalCivicIssues();
  const updated = [issue, ...existing];
  saveLocalCivicIssues(updated);
  return updated;
}

// Proximity Duplicate Detection
export function findNearbySimilarIssues(lat, lng, category, thresholdMeters = 200) {
  const issues = getLocalCivicIssues();
  return issues
    .filter((issue) => issue.status !== "Resolved")
    .map((issue) => {
      const distance = calculateDistanceMeters(lat, lng, issue.latitude, issue.longitude);
      const isSameCategory = !category || issue.category.toLowerCase().includes(category.toLowerCase()) || category.toLowerCase().includes(issue.category.toLowerCase());
      return {
        ...issue,
        distanceMeters: distance,
        isSameCategory,
      };
    })
    .filter((issue) => issue.distanceMeters <= thresholdMeters && issue.isSameCategory)
    .sort((a, b) => a.distanceMeters - b.distanceMeters);
}

// Upvote / Join Report
export function upvoteIssue(issueId, userEmail = "citizen.user") {
  const issues = getLocalCivicIssues();
  const updated = issues.map((issue) => {
    if (issue.id === issueId) {
      const hasUpvoted = (issue.upvotedBy || []).includes(userEmail);
      const upvotedBy = hasUpvoted
        ? issue.upvotedBy.filter((u) => u !== userEmail)
        : [...(issue.upvotedBy || []), userEmail];
      return {
        ...issue,
        upvotes: hasUpvoted ? Math.max(0, issue.upvotes - 1) : (issue.upvotes || 0) + 1,
        reportCount: hasUpvoted ? issue.reportCount : (issue.reportCount || 1) + 1,
        upvotedBy,
      };
    }
    return issue;
  });
  saveLocalCivicIssues(updated);
  return updated;
}

export function updateCivicIssueStatus(issueId, newStatus) {
  const issues = getLocalCivicIssues();
  const updated = issues.map((issue) => {
    if (issue.id === issueId) {
      return {
        ...issue,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      };
    }
    return issue;
  });
  saveLocalCivicIssues(updated);
  return updated;
}

export function deleteCivicIssue(issueId) {
  const issues = getLocalCivicIssues();
  const updated = issues.filter((issue) => issue.id !== issueId);
  saveLocalCivicIssues(updated);
  return updated;
}


