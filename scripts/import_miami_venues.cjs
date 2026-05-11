// Importer v2: merges miami_venues_full.json into src/data/curatedPlaces.ts.
// - For collisions (same name as an existing Miami entry): overwrites description /
//   address / website with the JSON values, but keeps the handcrafted utility,
//   neighborhood, lat/lng, and image. Forces status to 'Pending verification'.
// - For net-new venues: appends with status 'Pending verification'.
// - Also emits scripts/place_secrets_seed.json (gitignored): the per-venue
//   verification_token bag the back-office bulk-importer will push into the
//   admin-only Firestore /place_secrets collection.
const fs = require('fs');
const path = require('path');

const FULL_JSON = '/root/.claude/uploads/372f278c-3905-4dbe-93ce-a120117fac2f/426a837a-miami_venues_full.json';
const TARGET_TS = path.resolve(__dirname, '../src/data/curatedPlaces.ts');
const SECRETS_OUT = path.resolve(__dirname, 'place_secrets_seed.json');
const PLACES_OUT = path.resolve(__dirname, 'places_seed.json');

const CATEGORY_MAP = {
  'Veterinary Clinics': 'Veterinary clinics',
  'Pet Shops': 'Pet shops',
  'Pet-Friendly Hotels': 'Pet-friendly hotels',
  'Dog-Friendly Restaurants': 'Dog-friendly restaurants',
  'Dog-Friendly Cafes': 'Dog-friendly cafes',
  'Pet-Friendly Coworking': 'Pet-friendly coworking spaces',
  'Beaches': 'Beaches',
  'Parks / Green Areas': 'Parks / green areas',
  'Grooming Services': 'Grooming services',
};

const NEIGHBORHOOD_COORDS = [
  ['Sunny Isles',         25.9434, -80.1226],
  ['Haulover',            25.9034, -80.1235],
  ['Hialeah',             25.8576, -80.2781],
  ['Medley',              25.8868, -80.3433],
  ['North Miami Beach',   25.9331, -80.1625],
  ['North Miami',         25.8901, -80.1867],
  ['Mid-Beach',           25.8128, -80.1228],
  ['South Beach',         25.7826, -80.1340],
  ['Lincoln Road',        25.7898, -80.1395],
  ['Miami Beach',         25.7907, -80.1300],
  ['South Pointe',        25.7681, -80.1352],
  ['Liberty City',        25.8295, -80.2278],
  ['Little Havana',       25.7673, -80.2199],
  ['Wynwood',             25.8010, -80.1990],
  ['Midtown',             25.8011, -80.1925],
  ['Edgewater',           25.7935, -80.1868],
  ['Downtown',            25.7743, -80.1937],
  ['Brickell Key',        25.7676, -80.1846],
  ['Brickell',            25.7616, -80.1918],
  ['Coconut Grove',       25.7283, -80.2378],
  ['Peacock Park',        25.7269, -80.2374],
  ['Coral Gables',        25.7215, -80.2683],
  ['Doral',               25.8195, -80.3553],
  ['Pinecrest',           25.6667, -80.3083],
  ['Palmetto Bay',        25.6220, -80.3245],
  ['Sweetwater',          25.7570, -80.3700],
  ['Tamiami',             25.7570, -80.3700],
  ['Kendall',             25.6792, -80.3173],
  ['Key Biscayne',        25.6939, -80.1599],
  ['Virginia Key',        25.7361, -80.1591],
  ['Crandon',             25.7188, -80.1564],
  ['Oleta',               25.9214, -80.1417],
  ['Greynolds',           25.9311, -80.1670],
  ['Matheson',            25.6800, -80.2700],
  ['Morningside',         25.8275, -80.1817],
  ['Tropical',            25.7308, -80.3300],
];
const DEFAULT_COORDS = [25.7617, -80.1918];

function jitter(seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = (h ^ seed.charCodeAt(i)) * 16777619;
  const a = (h >>> 0) / 0xffffffff;
  const b = ((h * 31) >>> 0) / 0xffffffff;
  return [(a - 0.5) * 0.012, (b - 0.5) * 0.012];
}

function pickCoords(address, name) {
  const haystack = `${address || ''} ${name || ''}`;
  for (const [key, lat, lng] of NEIGHBORHOOD_COORDS) {
    if (haystack.includes(key)) {
      const [dLat, dLng] = jitter(`${name}|${key}`);
      return [+(lat + dLat).toFixed(4), +(lng + dLng).toFixed(4), key];
    }
  }
  const [dLat, dLng] = jitter(name || '');
  return [+(DEFAULT_COORDS[0] + dLat).toFixed(4), +(DEFAULT_COORDS[1] + dLng).toFixed(4), null];
}

function normName(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function tsString(value) {
  return '"' + String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
}

function normaliseWebsite(w) {
  if (!w) return undefined;
  return w.startsWith('http') ? w : `https://${w}`;
}

// Slugified id used for curated entries that aren't yet in Firestore.
// Mirrors the derivation in src/components/Explore.tsx so secrets line up.
function curatedSlug(name) {
  return `curated_${name.replace(/\s/g, '_')}`;
}

const json = JSON.parse(fs.readFileSync(FULL_JSON, 'utf8'));
let tsSource = fs.readFileSync(TARGET_TS, 'utf8');

const miamiStart = tsSource.indexOf('// MIAMI (50)');
const miamiEnd = tsSource.indexOf('// NEW YORK CITY (50)');
if (miamiStart < 0 || miamiEnd < 0) {
  console.error('Could not locate Miami section markers');
  process.exit(1);
}
const beforeMiami = tsSource.slice(0, miamiStart);
const miamiBlock = tsSource.slice(miamiStart, miamiEnd);
const afterMiami = tsSource.slice(miamiEnd);

// Split miamiBlock into per-entry blocks. Each entry starts at /^  \{/m
// and ends at the matching /^  \},?/m. Conservative regex parser.
const entryRe = /(  \{\n[\s\S]*?\n  \},?\n)/g;
const matches = [...miamiBlock.matchAll(entryRe)];
const headerLine = miamiBlock.slice(0, matches.length ? matches[0].index : miamiBlock.length);
const trailing = matches.length
  ? miamiBlock.slice(matches[matches.length - 1].index + matches[matches.length - 1][0].length)
  : '';

function getField(block, field) {
  const re = new RegExp(`\\n\\s+${field}:\\s*"((?:\\\\.|[^"\\\\])*)"`, 'm');
  const m = block.match(re);
  return m ? m[1] : null;
}

function setOrAddString(block, field, value) {
  const re = new RegExp(`(\\n\\s+${field}:\\s*)"(?:\\\\.|[^"\\\\])*"(,?)`, 'm');
  if (re.test(block)) {
    return block.replace(re, `$1${tsString(value)}$2`);
  }
  return block.replace(/\n  \},/, `,\n    ${field}: ${tsString(value)}\n  },`)
              .replace(/\n  \}\n/, `,\n    ${field}: ${tsString(value)}\n  }\n`);
}

function setStatus(block, value) {
  return block.replace(/\n(\s+)status:\s*"[^"]*"/m, `\n$1status: ${tsString(value)}`);
}

const jsonByNorm = new Map();
for (const v of json.venues) {
  jsonByNorm.set(normName(v.name), v);
}

const usedFromJson = new Set();
const updatedBlocks = matches.map(([block]) => {
  const name = getField(block, 'name');
  if (!name) return block;
  const v = jsonByNorm.get(normName(name));
  let next = block;
  // Force every Miami entry to Pending verification — none of these were
  // admin-approved through any flow; they were hand-curated then wholesale
  // labelled as 'Verified', which the trust-foundation rules disallow.
  next = setStatus(next, 'Pending verification');
  if (v) {
    usedFromJson.add(normName(v.name));
    if (v.description) next = setOrAddString(next, 'description', v.description);
    if (v.address) next = setOrAddString(next, 'address', v.address);
    const site = normaliseWebsite(v.website);
    if (site) next = setOrAddString(next, 'website', site);
  }
  return next;
});

// Append net-new venues that aren't already represented.
const additions = [];
for (const v of json.venues) {
  if (usedFromJson.has(normName(v.name))) continue;
  const cat = CATEGORY_MAP[v.category];
  if (!cat) continue;
  const [lat, lng, neighborhood] = pickCoords(v.address, v.name);
  let entry = '  {\n';
  entry += `    name: ${tsString(v.name)},\n`;
  entry += `    category: ${tsString(cat)},\n`;
  entry += `    city: "Miami",\n`;
  if (neighborhood) entry += `    neighborhood: ${tsString(neighborhood)},\n`;
  entry += `    description: ${tsString(v.description || '')},\n`;
  entry += `    utility: ${tsString(v.description || '')},\n`;
  entry += `    status: "Pending verification",\n`;
  entry += `    lat: ${lat},\n`;
  entry += `    lng: ${lng},\n`;
  if (v.address) entry += `    address: ${tsString(v.address)},\n`;
  const site = normaliseWebsite(v.website);
  if (site) entry += `    website: ${tsString(site)},\n`;
  entry += '  },\n';
  additions.push(entry);
}

const newMiami = headerLine + updatedBlocks.join('') + additions.join('') + trailing;
fs.writeFileSync(TARGET_TS, beforeMiami + newMiami + afterMiami);

// Emit place_secrets seed. Keyed by the curated slug so the verify endpoint
// can look up secrets without round-tripping the JSON id. The slug derivation
// mirrors src/components/Explore.tsx.
const secrets = {};
for (const v of json.venues) {
  secrets[curatedSlug(v.name)] = {
    sourceId: v.id,
    placeName: v.name,
    verificationToken: v.verification_token,
    verificationStatus: v.verification_status || 'pending',
    addedAt: v.added_date,
    address: v.address || null,
    website: normaliseWebsite(v.website) || null,
    businessEmail: null,
    contactPhone: null,
    outreachNotes: null,
  };
}
fs.writeFileSync(SECRETS_OUT, JSON.stringify(secrets, null, 2));

// Emit the public-side seed for /places. Mirrors what the back-office
// bulk-importer should write so the verify endpoint has a real Firestore
// doc to flip from 'Pending verification' to 'Verified'.
const places = {};
for (const v of json.venues) {
  const cat = CATEGORY_MAP[v.category];
  if (!cat) continue;
  const [lat, lng, neighborhood] = pickCoords(v.address, v.name);
  const id = curatedSlug(v.name);
  places[id] = {
    name: v.name,
    category: cat,
    city: 'Miami',
    neighborhood: neighborhood || null,
    description: v.description || '',
    utility: v.description || '',
    status: 'Pending verification',
    lat, lng,
    address: v.address || null,
    website: normaliseWebsite(v.website) || null,
  };
}
fs.writeFileSync(PLACES_OUT, JSON.stringify(places, null, 2));

const stats = {
  totalInJson: json.venues.length,
  collisionsUpdated: usedFromJson.size,
  netNewAppended: additions.length,
  secretsEmitted: Object.keys(secrets).length,
  placesEmitted: Object.keys(places).length,
};
console.error(JSON.stringify(stats, null, 2));
