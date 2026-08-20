/**
 * NEXINFRA MUNICIPAL WARD & SECTOR ZONE SPATIAL DETECTOR ENGINE
 * Accurately analyzes coordinates and location text to determine the nearest
 * official Municipal Ward, Administrative Corporation, Sector Zone, and Zonal Response Depot.
 */

// Comprehensive Municipal Wards & Sector Zones Spatial Database
export const MUNICIPAL_WARD_DATABASE = [
  // 1. Central Delhi Zone (NDMC / CDMC)
  {
    id: "WARD-CD-01",
    name: "Central District - Ward 1 (Connaught Place & Barakhamba)",
    zone: "New Delhi Municipal Council (NDMC)",
    subDistrict: "Central Delhi",
    centerLat: 28.6315,
    centerLng: 77.2167,
    radiusKm: 2.2,
    officer: "Er. A. K. Malhotra (Chief Municipal Engineer)",
    depot: "NDMC Central Tactical Depot #1 - Shivaji Stadium",
    contact: "+91 11 2336 2200",
    keywords: ["connaught place", "cp", "barakhamba", "janpath", "mandir marg", "shivaji stadium", "bengali market"]
  },
  {
    id: "WARD-CD-04",
    name: "Central District - Ward 4 (Civic Centre & Delhi Gate)",
    zone: "Municipal Corporation Central Zone (MCD)",
    subDistrict: "Central Delhi",
    centerLat: 28.6430,
    centerLng: 77.2280,
    radiusKm: 2.5,
    officer: "Er. Rajesh Mehra (Zonal Officer)",
    depot: "Civic Centre Rapid Works Unit #4 - Minto Road",
    contact: "+91 11 2322 8400",
    keywords: ["civic centre", "delhi gate", "minto road", "daryaganj", "asar ali road", "ring road expressway", "sector 62"]
  },
  {
    id: "WARD-CD-08",
    name: "Central District - Ward 8 (Karol Bagh & Pusa Road)",
    zone: "North-Central Municipal Corporation",
    subDistrict: "Karol Bagh Zone",
    centerLat: 28.6517,
    centerLng: 77.1906,
    radiusKm: 2.8,
    officer: "Er. S. N. Gupta (Superintendent Engineer)",
    depot: "Karol Bagh Zonal Workshop - Desh Bandhu Gupta Rd",
    contact: "+91 11 2575 3300",
    keywords: ["karol bagh", "pusa road", "rajendra nagar", "db gupta road", "jhandewalan", "prasad nagar"]
  },

  // 2. South Delhi Zone (SDMC)
  {
    id: "WARD-SD-12",
    name: "South Zone - Ward 12 (Lajpat Nagar & Defence Colony)",
    zone: "South Delhi Municipal Corporation (SDMC)",
    subDistrict: "South District",
    centerLat: 28.5700,
    centerLng: 77.2400,
    radiusKm: 3.0,
    officer: "Er. Vikramjit Singh (Zonal Infrastructure Officer)",
    depot: "SDMC South Depot #12 - Ring Road Lajpat Nagar",
    contact: "+91 11 2983 4500",
    keywords: ["lajpat nagar", "defence colony", "moolchand", "ring road", "amar colony", "jangpura"]
  },
  {
    id: "WARD-SD-14",
    name: "South Zone - Ward 14 (Hauz Khas, Green Park & AIIMS)",
    zone: "South Delhi Municipal Corporation (SDMC)",
    subDistrict: "South District",
    centerLat: 28.5535,
    centerLng: 77.2065,
    radiusKm: 3.2,
    officer: "Er. Deepa Nair (Municipal Executive)",
    depot: "Green Park Emergency Response Hub #14 - Sri Aurobindo Marg",
    contact: "+91 11 2656 1200",
    keywords: ["hauz khas", "green park", "aiims", "safdarjung", "sri aurobindo marg", "sda", "iit flyover"]
  },
  {
    id: "WARD-SD-18",
    name: "South Zone - Ward 18 (Saket, Malviya Nagar & Mehrauli)",
    zone: "South Delhi Municipal Corporation (SDMC)",
    subDistrict: "South District",
    centerLat: 28.5245,
    centerLng: 77.2167,
    radiusKm: 3.5,
    officer: "Er. P. K. Srivastava (Assistant Commissioner)",
    depot: "Saket District Centre Civic Depot #18 - Press Enclave Marg",
    contact: "+91 11 2956 7800",
    keywords: ["saket", "malviya nagar", "press enclave", "mehrauli", "qutub", "pushp vihar", "khirki extension"]
  },
  {
    id: "WARD-SD-22",
    name: "South Zone - Ward 22 (Greater Kailash, Nehru Place & Kalkaji)",
    zone: "South Delhi Municipal Corporation (SDMC)",
    subDistrict: "South-East District",
    centerLat: 28.5482,
    centerLng: 77.2513,
    radiusKm: 3.0,
    officer: "Er. R. C. Joshi (Senior Municipal Engineer)",
    depot: "Nehru Place Infrastructure Hub #22 - Outer Ring Road",
    contact: "+91 11 2644 9100",
    keywords: ["greater kailash", "gk", "gk 1", "gk 2", "nehru place", "kalkaji", "cr park", "alaknanda"]
  },

  // 3. West Delhi Zone
  {
    id: "WARD-WD-26",
    name: "West Zone - Ward 26 (Dwarka Sub-City Sectors 1-12)",
    zone: "West Delhi Municipal Corporation / DDA",
    subDistrict: "Dwarka Sub-City",
    centerLat: 28.5921,
    centerLng: 77.0460,
    radiusKm: 4.5,
    officer: "Er. Naresh Yadav (Chief Zonal Engineer)",
    depot: "Dwarka Sector 10 Integrated Municipal Station",
    contact: "+91 11 2808 6700",
    keywords: ["dwarka", "dwarka sector", "sector 1", "sector 6", "sector 10", "sector 11", "sector 12", "dwarka expressway"]
  },
  {
    id: "WARD-WD-31",
    name: "West Zone - Ward 31 (Janakpuri & Tilak Nagar)",
    zone: "West Delhi Municipal Corporation",
    subDistrict: "West District",
    centerLat: 28.6219,
    centerLng: 77.0878,
    radiusKm: 3.2,
    officer: "Er. Manpreet Chadha (Zonal Engineer)",
    depot: "Janakpuri District Centre Response Depot #31",
    contact: "+91 11 2555 4200",
    keywords: ["janakpuri", "tilak nagar", "uttam nagar", "vikaspuri", "jail road", "district centre"]
  },

  // 4. North Delhi Zone
  {
    id: "WARD-ND-42",
    name: "North Zone - Ward 42 (Civil Lines & Model Town)",
    zone: "North Delhi Municipal Corporation",
    subDistrict: "North District",
    centerLat: 28.6814,
    centerLng: 77.2227,
    radiusKm: 3.5,
    officer: "Er. H. C. Sharma (Zonal Officer)",
    depot: "Civil Lines Municipal Works Depot #42 - Rajpur Road",
    contact: "+91 11 2392 1100",
    keywords: ["civil lines", "model town", "delhi university", "north campus", "kamla nagar", "rajpur road", "gt road"]
  },
  {
    id: "WARD-ND-48",
    name: "North Zone - Ward 48 (Rohini Sectors 1-25 & Pitampura)",
    zone: "North Delhi Municipal Corporation",
    subDistrict: "Rohini Zone",
    centerLat: 28.7166,
    centerLng: 77.1147,
    radiusKm: 4.8,
    officer: "Er. Sunil Bansal (Superintendent Engineer)",
    depot: "Rohini Sector 14 Zonal Engineering Station",
    contact: "+91 11 2755 8900",
    keywords: ["rohini", "pitampura", "rohini sector", "sector 3", "sector 7", "sector 8", "sector 14", "sector 15", "sector 18", "outer ring road"]
  },

  // 5. East Delhi Zone (EDMC)
  {
    id: "WARD-ED-54",
    name: "East Zone - Ward 54 (Preet Vihar, Laxmi Nagar & Mayur Vihar)",
    zone: "East Delhi Municipal Corporation (EDMC)",
    subDistrict: "East District",
    centerLat: 28.6369,
    centerLng: 77.2944,
    radiusKm: 3.8,
    officer: "Er. K. L. Verma (Chief Zonal Engineer)",
    depot: "Preet Vihar Vikas Marg Emergency Center #54",
    contact: "+91 11 2244 5500",
    keywords: ["preet vihar", "laxmi nagar", "mayur vihar", "mayur vihar phase 1", "mayur vihar phase 2", "patparganj", "vikas marg", "anand vihar"]
  },

  // 6. NOIDA Sector Zones (Noida Authority)
  {
    id: "ZONE-NOIDA-01",
    name: "NOIDA Sector Zone 1 - Ward 18 (Commercial Hub & Atta Market)",
    zone: "New Okhla Industrial Development Authority (NOIDA)",
    subDistrict: "Zone 1",
    centerLat: 28.5700,
    centerLng: 77.3200,
    radiusKm: 2.8,
    officer: "Er. Alok Sharma (Project Engineer)",
    depot: "Noida Sector 19 Municipal Dispatch Compound",
    contact: "+91 120 242 5000",
    keywords: ["noida sector 18", "sector 18", "atta", "sector 16", "sector 15", "film city", "noida city centre", "botanical garden"]
  },
  {
    id: "ZONE-NOIDA-03",
    name: "NOIDA Sector Zone 3 - Ward 62 (Electronic City & Institutional Corridor)",
    zone: "New Okhla Industrial Development Authority (NOIDA)",
    subDistrict: "Zone 3",
    centerLat: 28.6280,
    centerLng: 77.3680,
    radiusKm: 3.6,
    officer: "Er. Sandeep Chandra (Chief Infrastructure Engineer)",
    depot: "Sector 62 Institutional Support Depot - Fortis Radial",
    contact: "+91 120 240 6200",
    keywords: ["sector 62", "noida sector 62", "electronic city", "sector 63", "sector 59", "sector 60", "nh 24", "expressway"]
  },
  {
    id: "ZONE-NOIDA-05",
    name: "NOIDA Sector Zone 5 - Ward 128 (Expressway Corridor & Sector 137)",
    zone: "New Okhla Industrial Development Authority (NOIDA)",
    subDistrict: "Zone 5",
    centerLat: 28.5150,
    centerLng: 77.3850,
    radiusKm: 4.2,
    officer: "Er. Mohit Goel (Senior Engineer Pavement)",
    depot: "Expressway Maintenance Depot #5 - Sector 128",
    contact: "+91 120 248 1280",
    keywords: ["sector 128", "sector 137", "noida expressway", "sector 93", "sector 108", "sector 142", "advant navis"]
  },

  // 7. Gurugram Municipal Zones (MCG)
  {
    id: "ZONE-MCG-01",
    name: "Gurugram Zone 1 - Ward 24 (Cyber City & DLF Phase 1-3)",
    zone: "Municipal Corporation of Gurugram (MCG)",
    subDistrict: "MCG East",
    centerLat: 28.4900,
    centerLng: 77.0900,
    radiusKm: 3.5,
    officer: "Er. T. L. Sharma (Executive Engineer)",
    depot: "DLF Cyber City Emergency Reaction Unit #24",
    contact: "+91 124 237 0001",
    keywords: ["cyber city", "dlf", "dlf phase 1", "dlf phase 2", "dlf phase 3", "mg road", "udyog vihar", "sikanderpur", "gurgaon", "gurugram"]
  },
  {
    id: "ZONE-MCG-03",
    name: "Gurugram Zone 3 - Ward 32 (Golf Course Road & Sector 54-56)",
    zone: "Municipal Corporation of Gurugram (MCG)",
    subDistrict: "MCG South",
    centerLat: 28.4350,
    centerLng: 77.1050,
    radiusKm: 4.0,
    officer: "Er. Amit Kumar (Zonal Engineer)",
    depot: "Sector 56 Rapid Deployment Center #32",
    contact: "+91 124 238 5600",
    keywords: ["golf course road", "sector 54", "sector 56", "sector 55", "sector 57", "arjan garh", "sohna road", "sector 48"]
  }
];

/**
 * Calculates Haversine distance in Kilometers between two lat/lng coordinates
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Automatically finds the nearest municipal ward, administrative corporation, and sector zone
 * based on geographic coordinates (Latitude, Longitude).
 */
export function detectMunicipalWardByCoordinates(latitude, longitude) {
  if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
    return MUNICIPAL_WARD_DATABASE[1]; // Fallback to Central District - Ward 4
  }

  let nearestWard = MUNICIPAL_WARD_DATABASE[0];
  let minDistance = Infinity;

  for (const ward of MUNICIPAL_WARD_DATABASE) {
    const dist = calculateDistanceKm(latitude, longitude, ward.centerLat, ward.centerLng);
    if (dist < minDistance) {
      minDistance = dist;
      nearestWard = ward;
    }
  }

  return {
    ...nearestWard,
    distanceKm: parseFloat(minDistance.toFixed(2)),
    formattedWardString: `${nearestWard.name}`,
    zoneLabel: `${nearestWard.zone} (${minDistance.toFixed(1)} km from depot)`
  };
}

/**
 * Automatically matches address text or query string to the exact municipal ward and coordinates
 */
export function detectMunicipalWardByText(queryText) {
  if (!queryText || typeof queryText !== "string") {
    return MUNICIPAL_WARD_DATABASE[1];
  }

  const q = queryText.toLowerCase().trim();

  // Search keyword matches
  for (const ward of MUNICIPAL_WARD_DATABASE) {
    for (const keyword of ward.keywords) {
      if (q.includes(keyword)) {
        return {
          ...ward,
          distanceKm: 0.5,
          formattedWardString: `${ward.name}`,
          zoneLabel: `${ward.zone} (Matched by ${keyword.toUpperCase()})`
        };
      }
    }
  }

  // Fallback to Central District
  return {
    ...MUNICIPAL_WARD_DATABASE[1],
    distanceKm: 1.2,
    formattedWardString: `${MUNICIPAL_WARD_DATABASE[1].name}`,
    zoneLabel: `${MUNICIPAL_WARD_DATABASE[1].zone}`
  };
}

/**
 * Reverse geocodes coordinates via OpenStreetMap Nominatim with instant local ward resolution
 */
export async function reverseGeocodeAndDetectWard(lat, lng) {
  const detectedWard = detectMunicipalWardByCoordinates(lat, lng);
  let resolvedAddress = `${lat.toFixed(5)}° N, ${lng.toFixed(5)}° E (${detectedWard.subDistrict})`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.display_name) {
        const parts = data.display_name.split(",");
        resolvedAddress = parts.slice(0, 3).join(",").trim();
      }
    }
  } catch (e) {
    console.log("Online reverse geocoding skipped, using local spatial resolution:", e.message);
  }

  return {
    latitude: lat,
    longitude: lng,
    address: resolvedAddress,
    ward: detectedWard.name,
    zone: detectedWard.zone,
    officer: detectedWard.officer,
    depot: detectedWard.depot,
    contact: detectedWard.contact,
    distanceKm: detectedWard.distanceKm
  };
}
