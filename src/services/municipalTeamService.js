/**
 * NEXINFRA MUNICIPAL TEAM & FIELD DISPATCH SERVICE
 * Manages municipal response units, member rosters, live task allotments,
 * time duration tracking, and late delay calculations.
 */

const STORAGE_KEY_TEAMS = "nexinfra_municipal_teams";

export const DEFAULT_MUNICIPAL_TEAMS = [
  {
    id: "TEAM-RD-01",
    name: "Unit Alpha - Rapid Asphalt Patch Crew",
    department: "Road Works & Asphalt Pavement Division",
    ward: "Central District - Ward 4 (Civic Centre)",
    leader: "Lead Supervisor Rajesh Kumar",
    leaderPhone: "+91 98112-45201",
    members: [
      { name: "Rajesh Kumar", role: "Crew Chief / Senior Paving Tech" },
      { name: "Suresh Pal", role: "Heavy Asphalt Roller Operator" },
      { name: "Manoj Yadav", role: "Bituminous Sealant Technician" },
      { name: "Vikram Negi", role: "Traffic Safety & Perimeter Guard" }
    ],
    equipment: ["Dynapac Asphalt Compactor #04", "Infrared Thermal Patch Heaters", "Rapid Cold-Mix Reservoir"],
    status: "available", // available | occupied | maintenance
    activeJob: null,
  },
  {
    id: "TEAM-HY-02",
    name: "Unit Beta - Hydro Plume & Main Suction Unit",
    department: "Municipal Hydro & Water Supply Grid",
    ward: "South Zone - Ward 14 (Hauz Khas & Green Park)",
    leader: "Er. Sandeep Mukherjee",
    leaderPhone: "+91 98730-88123",
    members: [
      { name: "Er. Sandeep Mukherjee", role: "Hydraulic Systems Engineer" },
      { name: "Amitav Roy", role: "High-Pressure Jetting Specialist" },
      { name: "Kishore Sen", role: "Pipeline Acoustic Leak Detector" },
      { name: "Deepak Rawat", role: "Submersible Pump Mechanic" }
    ],
    equipment: ["Tata Hydro-Jetting & Vacuum Suction Tanker #12", "Electrofusion Pipe Welder", "Digital Pipe Flow Sonar"],
    status: "occupied",
    activeJob: {
      taskId: "CIVIC-103",
      taskTitle: "Water Main Pipe Rupture & Inundation",
      category: "Water / Drainage Burst",
      ward: "South Zone - Ward 14 (Hauz Khas)",
      address: "Aurobindo Marg, Near Green Park Metro",
      allottedHours: 3.0,
      startTime: new Date(Date.now() - 3.75 * 3600 * 1000).toISOString(), // 3 hours 45 mins ago -> 45 mins late!
      status: "On-Site Remediating",
      notes: "Excavation completed, secondary pressure valve replacement in progress.",
      priority: "P1"
    }
  },
  {
    id: "TEAM-SW-03",
    name: "Unit Gamma - Solid Waste & Biowaste Rapid Logistics",
    department: "Sanitation & Solid Waste Logistics Unit",
    ward: "Central District - Ward 1 (Connaught Place)",
    leader: "Supervisor Anjali Sharma",
    leaderPhone: "+91 98105-33987",
    members: [
      { name: "Anjali Sharma", role: "Sanitation Logistics Officer" },
      { name: "Pappu Ram", role: "Hydraulic Waste Compactor Driver" },
      { name: "Ramkesh Meena", role: "Biowaste Remediation Specialist" },
      { name: "Santosh Lal", role: "Chemical Disinfection Operator" },
      { name: "Brijesh Gupta", role: "Sorting & Recovery Tech" }
    ],
    equipment: ["Ashok Leyland 16-Ton Hydraulic Compactor #07", "Odor Neutralizer Fogger", "Heavy-Duty Crane Grabber"],
    status: "occupied",
    activeJob: {
      taskId: "CIVIC-102",
      taskTitle: "Unattended Solid Waste & Landfill Spill",
      category: "Solid Waste Overflow",
      ward: "Central District - Ward 1 (CP)",
      address: "Outer Circle, Opp Block M",
      allottedHours: 6.0,
      startTime: new Date(Date.now() - 2.5 * 3600 * 1000).toISOString(), // 2.5 hours ago -> On track!
      status: "Dispatched & Loading",
      notes: "Debris clearance in progress, compactor bin at 70% capacity.",
      priority: "P2"
    }
  },
  {
    id: "TEAM-EL-04",
    name: "Unit Delta - High-Voltage Grid & Line Unit",
    department: "Municipal Power & Street Lighting Grid",
    ward: "West Zone - Ward 26 (Dwarka Sub-City)",
    leader: "Master Electrician Vinod Thakur",
    leaderPhone: "+91 99110-66442",
    members: [
      { name: "Vinod Thakur", role: "High-Tension Power Lineman Lead" },
      { name: "Dinesh Kumar", role: "Aerial Cherry-Picker Crane Operator" },
      { name: "Mohit Panwar", role: "Smart LED Luminaire Specialist" },
      { name: "Gopal Joshi", role: "Insulated Line Safety Inspector" }
    ],
    equipment: ["Mahindra 18m Aerial Insulated Boom Lift #02", "1000V High-Tension Insulation Gloves & Rods", "Digital Thermal Imaging Multimeter"],
    status: "available",
    activeJob: null
  },
  {
    id: "TEAM-ST-05",
    name: "Unit Epsilon - Heavy Structural & Bridge Inspection",
    department: "Structural Engineering & Bridge Safety Division",
    ward: "East Zone - Ward 54 (Preet Vihar)",
    leader: "Er. Arvind Swaminathan",
    leaderPhone: "+91 98401-22910",
    members: [
      { name: "Er. Arvind Swaminathan", role: "Structural Bridge Specialist" },
      { name: "Bhupinder Singh", role: "Ultrasonic Concrete NDT Tester" },
      { name: "Tariq Ali", role: "Carbon Fiber Reinforcement Mason" },
      { name: "Kunal Ghosh", role: "Structural Strain Gauge Analyst" }
    ],
    equipment: ["Proceq Ultrasonic Concrete Integrity Scanner", "High-Reach Scaffolding Unit", "Epoxy High-Pressure Injection Pump"],
    status: "available",
    activeJob: null
  },
  {
    id: "TEAM-FR-06",
    name: "Unit Zeta - Urban Forestry & Heavy Tree Removal",
    department: "Urban Forestry & Public Parks Department",
    ward: "NOIDA Sector Zone 3 - Ward 62",
    leader: "Forester Mahender Singh",
    leaderPhone: "+91 98188-77211",
    members: [
      { name: "Mahender Singh", role: "Chief Arborist & Tree Surgeon" },
      { name: "Ranbir Chawla", role: "Heavy Stihl Chainsaw Specialist" },
      { name: "Devender Kumar", role: "Mobile Wood Chipper Operator" },
      { name: "Sanjay Pal", role: "Roadway Hazard Barrier Marshall" }
    ],
    equipment: ["Stihl MS 661 Heavy Timber Chainsaws", "Bandit 12-inch Heavy Wood Chipper", "Hydraulic Log Hauler"],
    status: "available",
    activeJob: null
  }
];

export function getMunicipalTeams() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TEAMS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_TEAMS, JSON.stringify(DEFAULT_MUNICIPAL_TEAMS));
      return DEFAULT_MUNICIPAL_TEAMS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading municipal teams:", e);
    return DEFAULT_MUNICIPAL_TEAMS;
  }
}

export function saveMunicipalTeams(teams) {
  try {
    localStorage.setItem(STORAGE_KEY_TEAMS, JSON.stringify(teams));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("municipal_teams_updated", { detail: { teams } }));
    }
  } catch (e) {
    console.error("Error saving municipal teams:", e);
  }
}

/**
 * Calculates late time duration for an active job
 */
export function calculateJobTimeMetrics(activeJob) {
  if (!activeJob || !activeJob.startTime) {
    return {
      elapsedMinutes: 0,
      allottedMinutes: 0,
      remainingMinutes: 0,
      isLate: false,
      lateMinutes: 0,
      formattedElapsed: "0h 0m",
      formattedRemaining: "0h 0m",
      formattedLate: "0m",
      statusClass: "text-emerald-400"
    };
  }

  const startMs = new Date(activeJob.startTime).getTime();
  const nowMs = Date.now();
  const elapsedMs = Math.max(0, nowMs - startMs);
  const elapsedMinutes = Math.floor(elapsedMs / (1000 * 60));

  const allottedMinutes = Math.floor((activeJob.allottedHours || 4) * 60);
  const diffMinutes = allottedMinutes - elapsedMinutes;

  const isLate = diffMinutes < 0;
  const lateMinutes = isLate ? Math.abs(diffMinutes) : 0;
  const remainingMinutes = isLate ? 0 : diffMinutes;

  const formatHoursMins = (totalMins) => {
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    return `${h}h ${m}m`;
  };

  return {
    elapsedMinutes,
    allottedMinutes,
    remainingMinutes,
    isLate,
    lateMinutes,
    formattedElapsed: formatHoursMins(elapsedMinutes),
    formattedRemaining: formatHoursMins(remainingMinutes),
    formattedLate: formatHoursMins(lateMinutes),
    percentageElapsed: Math.min(150, Math.round((elapsedMinutes / allottedMinutes) * 100)),
    statusClass: isLate ? "text-red-400" : remainingMinutes < 30 ? "text-amber-400" : "text-emerald-400"
  };
}

/**
 * Allots an available municipal team to a task
 */
export function allotTeamToTask(teamId, taskDetails, allottedHours = 4) {
  const teams = getMunicipalTeams();
  const updated = teams.map((team) => {
    if (team.id === teamId) {
      return {
        ...team,
        status: "occupied",
        activeJob: {
          taskId: taskDetails.id || `JOB-${Date.now().toString().slice(-4)}`,
          taskTitle: taskDetails.title || taskDetails.defectName || taskDetails.category || "Municipal Remediate Task",
          category: taskDetails.category || "Road Damage / Pothole",
          ward: taskDetails.ward || team.ward,
          address: taskDetails.address || taskDetails.location || "Locality Ward Site",
          allottedHours: parseFloat(allottedHours) || 4,
          startTime: new Date().toISOString(),
          status: "Dispatched to Site",
          notes: `Team ${team.name} dispatched with ${team.members?.length || 4} technicians.`,
          priority: taskDetails.priority || "P1"
        }
      };
    }
    return team;
  });

  saveMunicipalTeams(updated);
  return { success: true, teams: updated };
}

/**
 * Updates progress note and status of an active job
 */
export function updateTeamJobStatus(teamId, newStatus, newNotes) {
  const teams = getMunicipalTeams();
  const updated = teams.map((team) => {
    if (team.id === teamId && team.activeJob) {
      return {
        ...team,
        activeJob: {
          ...team.activeJob,
          status: newStatus || team.activeJob.status,
          notes: newNotes !== undefined ? newNotes : team.activeJob.notes,
          lastUpdated: new Date().toISOString()
        }
      };
    }
    return team;
  });

  saveMunicipalTeams(updated);
  return { success: true, teams: updated };
}

/**
 * Completes a job, resolves the task, and frees the team back to available status
 */
export function completeJobAndReleaseTeam(teamId) {
  const teams = getMunicipalTeams();
  let completedTaskId = null;

  const updated = teams.map((team) => {
    if (team.id === teamId) {
      completedTaskId = team.activeJob?.taskId;
      return {
        ...team,
        status: "available",
        activeJob: null
      };
    }
    return team;
  });

  saveMunicipalTeams(updated);
  return { success: true, completedTaskId, teams: updated };
}

/**
 * Adds a new municipal field team
 */
export function createMunicipalTeam(teamData) {
  const teams = getMunicipalTeams();
  const newTeam = {
    id: `TEAM-${Date.now().toString().slice(-6)}`,
    name: teamData.name || "Specialized Response Unit",
    department: teamData.department || "Road Works & Asphalt Pavement Division",
    ward: teamData.ward || "Central District - Ward 4 (Civic Centre)",
    leader: teamData.leader || "Senior Field Supervisor",
    leaderPhone: teamData.leaderPhone || "+91 98000-00000",
    members: teamData.members || [
      { name: teamData.leader || "Field Lead", role: "Crew Lead" },
      { name: "Field Technician 1", role: "Equipment Specialist" },
      { name: "Field Technician 2", role: "Safety Officer" }
    ],
    equipment: teamData.equipment || ["Standard Municipal Repair Rig #01"],
    status: "available",
    activeJob: null
  };

  const updated = [...teams, newTeam];
  saveMunicipalTeams(updated);
  return { success: true, team: newTeam };
}
