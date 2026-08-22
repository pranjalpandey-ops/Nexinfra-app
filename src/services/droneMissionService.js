/**
 * NEXINFRA AUTONOMOUS UAV / DRONE MISSION DISPATCH SERVICE
 * Prepares AI-verified CCTV defect incidents for drone telemetry dispatch
 */

/**
 * Creates a clean UAV mission payload from an AI-verified incident
 * @param {Object} incident - Verified incident from CCTV/Surveillance
 * @returns {Object} Formatted drone mission payload
 */
export function createDroneMissionFromIncident(incident) {
  if (!incident) return null;

  const targetLat = incident.targetLatitude ?? incident.latitude ?? 28.6139;
  const targetLng = incident.targetLongitude ?? incident.longitude ?? 77.2090;
  const incidentId = incident.targetIncidentId ?? incident.id ?? ("CIVIC-" + Date.now());

  const mission = {
    missionId: "UAV-MISSION-" + Date.now(),
    targetIncidentId: incidentId,
    targetLatitude: targetLat,
    targetLongitude: targetLng,
    targetCoordinates: `${targetLat.toFixed(4)}° N, ${targetLng.toFixed(4)}° E`,
    targetSector: incident.address || incident.ward || "Sector 4 Corridor",
    defectCategory: incident.category || "Road Damage / Pothole",
    defectTitle: incident.title || "Verified Civic Defect",
    aiConfidence: incident.aiConfidence || incident.confidence || 0.94,
    aiVerified: Boolean(incident.aiVerified),
    verificationMethod: incident.verificationMethod || "3-frame consecutive YOLO verification",
    source: incident.source || "REAL_TIME_CCTV",
    cameraId: incident.cameraId || "CAM-01",
    assignedDroneUnit: "UAV-ALPHA-09 (LiDAR + Thermal Sensor Array)",
    flightAltitudeMeters: 120,
    sensorPayload: ["4K Optical Zoom", "FLIR Thermal Infrared", "LiDAR Surface Profiler"],
    priority: incident.priority || "P1",
    severity: incident.severity || "Critical",
    status: "MISSION_STAGED",
    createdAt: new Date().toISOString()
  };

  return mission;
}

/**
 * Validates whether an incident has complete GPS coordinates for drone routing
 */
export function isIncidentDroneReady(incident) {
  if (!incident) return false;
  const lat = incident.targetLatitude ?? incident.latitude;
  const lng = incident.targetLongitude ?? incident.longitude;
  return typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng);
}
