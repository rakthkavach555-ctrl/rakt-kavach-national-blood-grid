/**
 * Geography seed — India → State → District → Block hierarchy
 * Run: pnpm --filter @workspace/api-server exec tsx src/seed-geography.ts
 */
import { db, statesTable, districtsTable, blocksTable } from "@workspace/db";

const STATES = [
  { code: "DL", name: "Delhi",          capital: "New Delhi",  population: 33807403 },
  { code: "MH", name: "Maharashtra",   capital: "Mumbai",     population: 125711003 },
  { code: "UP", name: "Uttar Pradesh", capital: "Lucknow",    population: 231502578 },
  { code: "KA", name: "Karnataka",     capital: "Bengaluru",  population: 67562686 },
  { code: "TN", name: "Tamil Nadu",    capital: "Chennai",    population: 77841267 },
  { code: "WB", name: "West Bengal",   capital: "Kolkata",    population: 99609303 },
  { code: "GJ", name: "Gujarat",       capital: "Gandhinagar",population: 63872399 },
  { code: "RJ", name: "Rajasthan",     capital: "Jaipur",     population: 81032689 },
];

const DISTRICTS: Record<string, { name: string; headquarters?: string; population?: number }[]> = {
  DL: [
    { name: "Central Delhi",      headquarters: "Connaught Place",  population: 582320  },
    { name: "South Delhi",        headquarters: "Saket",            population: 2733752 },
    { name: "North Delhi",        headquarters: "Civil Lines",      population: 887978  },
    { name: "East Delhi",         headquarters: "Preet Vihar",      population: 1709346 },
    { name: "West Delhi",         headquarters: "Janakpuri",        population: 2535858 },
    { name: "New Delhi",          headquarters: "Connaught Place",  population: 142004  },
    { name: "North East Delhi",   headquarters: "Nand Nagri",       population: 2201273 },
    { name: "South West Delhi",   headquarters: "Dwarka",           population: 2292958 },
  ],
  MH: [
    { name: "Mumbai City",        headquarters: "Fort",             population: 3085411 },
    { name: "Mumbai Suburban",    headquarters: "Bandra",           population: 9356962 },
    { name: "Pune",               headquarters: "Pune",             population: 9429408 },
    { name: "Nagpur",             headquarters: "Nagpur",           population: 4653570 },
    { name: "Thane",              headquarters: "Thane",            population: 11054131},
  ],
  UP: [
    { name: "Lucknow",            headquarters: "Lucknow",          population: 4589838 },
    { name: "Agra",               headquarters: "Agra",             population: 4418797 },
    { name: "Kanpur Nagar",       headquarters: "Kanpur",           population: 4572951 },
    { name: "Varanasi",           headquarters: "Varanasi",         population: 3676841 },
    { name: "Prayagraj",          headquarters: "Prayagraj",        population: 5959798 },
  ],
  KA: [
    { name: "Bengaluru Urban",    headquarters: "Bengaluru",        population: 9621551 },
    { name: "Mysuru",             headquarters: "Mysuru",           population: 3001127 },
    { name: "Hubballi-Dharwad",   headquarters: "Hubballi",         population: 2143582 },
  ],
  TN: [
    { name: "Chennai",            headquarters: "Chennai",          population: 7088000 },
    { name: "Coimbatore",         headquarters: "Coimbatore",       population: 3458045 },
    { name: "Madurai",            headquarters: "Madurai",          population: 3038252 },
  ],
  WB: [
    { name: "Kolkata",            headquarters: "Kolkata",          population: 4486679 },
    { name: "North 24 Parganas",  headquarters: "Barasat",          population: 10009781},
    { name: "South 24 Parganas",  headquarters: "Alipore",          population: 8153176 },
  ],
  GJ: [
    { name: "Ahmedabad",          headquarters: "Ahmedabad",        population: 7208200 },
    { name: "Surat",              headquarters: "Surat",            population: 4996391 },
    { name: "Vadodara",           headquarters: "Vadodara",         population: 4165626 },
  ],
  RJ: [
    { name: "Jaipur",             headquarters: "Jaipur",           population: 6626178 },
    { name: "Jodhpur",            headquarters: "Jodhpur",          population: 3685681 },
    { name: "Kota",               headquarters: "Kota",             population: 1950491 },
  ],
};

// Sample blocks per state (3 blocks per district for brevity)
function makeBlocks(stateCode: string, districtCode: string, districtName: string) {
  const parts = districtName.split(" ");
  return [
    { code: `${districtCode}-BLK-001`, name: `${parts[0]} North Block`,  population: 85000  },
    { code: `${districtCode}-BLK-002`, name: `${parts[0]} Central Block`, population: 102000 },
    { code: `${districtCode}-BLK-003`, name: `${parts[0]} South Block`,  population: 91000  },
  ];
}

async function main() {
  console.log("Seeding India administrative hierarchy…");

  // States
  const stateRows = await db.insert(statesTable).values(
    STATES.map(s => ({ code: s.code, name: s.name, capital: s.capital, population: s.population }))
  ).onConflictDoNothing().returning();
  console.log(`States: ${stateRows.length} inserted`);

  const stateMap = new Map(stateRows.map(s => [s.code, s.id]));

  // Districts + Blocks
  let distTotal = 0, blockTotal = 0;
  for (const [stateCode, districts] of Object.entries(DISTRICTS)) {
    const stateId = stateMap.get(stateCode);
    if (!stateId) continue;
    for (const d of districts) {
      const distCode = `${stateCode}-${d.name.slice(0, 3).toUpperCase().replace(/\s/g, '')}`;
      const [distRow] = await db.insert(districtsTable).values({
        stateId, stateCode,
        code: distCode,
        name: d.name,
        headquarters: d.headquarters,
        population: d.population,
      }).onConflictDoNothing().returning();
      if (!distRow) continue;
      distTotal++;
      const blocks = makeBlocks(stateCode, distRow.code, d.name);
      const bRows = await db.insert(blocksTable).values(
        blocks.map(b => ({ districtId: distRow.id, districtCode: distRow.code, stateCode, ...b }))
      ).onConflictDoNothing().returning();
      blockTotal += bRows.length;
    }
  }
  console.log(`Districts: ${distTotal} inserted`);
  console.log(`Blocks: ${blockTotal} inserted`);
  console.log("India hierarchy seeded ✓");
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
