// lib/data.js
// In-memory data store (persisted via JSON file in production, or use a simple KV)
// For Vercel deployment, this uses a JSON file approach with environment variable override

export const DEFAULT_DATA = {
  regions: [
    { id: "central", name: "Central" },
    { id: "east", name: "East" },
    { id: "south", name: "South" },
    { id: "north", name: "North" },
    { id: "west", name: "West" },
    { id: "ncr", name: "NCR" },
    { id: "rajasthan", name: "Rajasthan" }
  ],
  branches: [
    { id: "agra", name: "Agra", regionId: "west" },
    { id: "agra-taj-nagari", name: "Agra - Taj Nagari", regionId: "west" },
    { id: "aligarh", name: "Aligarh", regionId: "ncr" },
    { id: "bareilly", name: "Bareilly", regionId: "north" },
    { id: "dehradun-rajpur-road", name: "Dehradun (Rajpur Road)", regionId: "north" },
    { id: "dehradun-ballupur-chowk", name: "Dehradun (Ballupur Chowk)", regionId: "north" },
    { id: "etawah", name: "Etawah", regionId: "west" },
    { id: "haridwar", name: "Haridwar", regionId: "north" },
    { id: "jhansi", name: "Jhansi", regionId: "east" },
    { id: "kanpur-1-kakadeo", name: "Kanpur-1 (Kakadeo)", regionId: "central" },
    { id: "kanpur-2-phoolbagh", name: "Kanpur-2 (Phoolbagh)", regionId: "central" },
    { id: "lucknow-alambagh", name: "Lucknow - Alambagh", regionId: "central" },
    { id: "lucknow-gomti-nagar", name: "Lucknow - Gomti Nagar", regionId: "central" },
    { id: "lucknow-hazratganj", name: "Lucknow - Hazratganj", regionId: "central" },
    { id: "lucknow-vrindavan-yojana", name: "Lucknow - Vrindavan Yojana", regionId: "central" },
    { id: "mathura", name: "Mathura", regionId: "west" },
    { id: "medical-road", name: "Medical Road", regionId: "north" },
    { id: "meerut", name: "Meerut", regionId: "ncr" },
    { id: "meerut-modipuram", name: "Meerut - Modipuram", regionId: "ncr" },
    { id: "muzaffarnagar", name: "Muzaffarnagar", regionId: "ncr" },
    { id: "raebareli", name: "Raebareli", regionId: "central" },
    { id: "unnao", name: "Unnao", regionId: "central" }
  ],
  settings: {
    sheetUrl: "https://docs.google.com/spreadsheets/d/18U8hwcqpXKuOZyfjy-6LHz3gFnmc4CDq3CS0EUCZHJo/edit?usp=sharing",
    sheetId: "18U8hwcqpXKuOZyfjy-6LHz3gFnmc4CDq3CS0EUCZHJo"
  }
};

// Extract sheet ID from URL
export function extractSheetId(url) {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

// Slug helper
export function toSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
