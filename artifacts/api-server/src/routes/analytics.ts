import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, donorsTable, hospitalsTable, bloodBanksTable, laboratoriesTable, ambulancesTable, bloodInventoryTable, emergencySosTable, bloodRequestsTable, auditLogsTable, usersTable } from "@workspace/db";

const router: IRouter = Router();
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

const INDIA_STATES = [
  { code: "AP", name: "Andhra Pradesh" }, { code: "AR", name: "Arunachal Pradesh" },
  { code: "AS", name: "Assam" }, { code: "BR", name: "Bihar" },
  { code: "CG", name: "Chhattisgarh" }, { code: "GA", name: "Goa" },
  { code: "GJ", name: "Gujarat" }, { code: "HR", name: "Haryana" },
  { code: "HP", name: "Himachal Pradesh" }, { code: "JH", name: "Jharkhand" },
  { code: "KA", name: "Karnataka" }, { code: "KL", name: "Kerala" },
  { code: "MP", name: "Madhya Pradesh" }, { code: "MH", name: "Maharashtra" },
  { code: "MN", name: "Manipur" }, { code: "ML", name: "Meghalaya" },
  { code: "MZ", name: "Mizoram" }, { code: "NL", name: "Nagaland" },
  { code: "OD", name: "Odisha" }, { code: "PB", name: "Punjab" },
  { code: "RJ", name: "Rajasthan" }, { code: "SK", name: "Sikkim" },
  { code: "TN", name: "Tamil Nadu" }, { code: "TS", name: "Telangana" },
  { code: "TR", name: "Tripura" }, { code: "UP", name: "Uttar Pradesh" },
  { code: "UK", name: "Uttarakhand" }, { code: "WB", name: "West Bengal" },
  { code: "DL", name: "Delhi" },
];

async function getNationalStats() {
  const [donors, hospitals, banks, labs, ambulances, emergencies, inventory] = await Promise.all([
    db.select().from(donorsTable),
    db.select().from(hospitalsTable),
    db.select().from(bloodBanksTable),
    db.select().from(laboratoriesTable),
    db.select().from(ambulancesTable),
    db.select().from(emergencySosTable),
    db.select().from(bloodInventoryTable),
  ]);
  const totalUnits = inventory.filter(i => i.status === "AVAILABLE").reduce((s, i) => s + i.units, 0);
  const activeEmergencies = emergencies.filter(e => e.status === "ACTIVE" || e.status === "BROADCAST" || e.status === "DISPATCHED").length;
  const byBloodGroup = BLOOD_GROUPS.map(bg => {
    const units = inventory.filter(i => i.bloodGroup === bg && i.status === "AVAILABLE").reduce((s, i) => s + i.units, 0);
    const pct = totalUnits > 0 ? (units / totalUnits) * 100 : 0;
    const status = units < 5 ? "CRITICAL" : units < 20 ? "LOW" : units < 50 ? "ADEQUATE" : "SURPLUS";
    return { bloodGroup: bg, units, percentage: pct, status };
  });
  return { donors, hospitals, banks, labs, ambulances, emergencies, activeEmergencies, totalUnits, byBloodGroup, inventory };
}

router.get("/analytics/national", async (req, res) => {
  try {
    const { donors, hospitals, banks, labs, ambulances, activeEmergencies, totalUnits, byBloodGroup, emergencies } = await getNationalStats();
    const stateData = INDIA_STATES.slice(0, 15).map(s => ({
      stateCode: s.code, stateName: s.name,
      totalUnits: Math.floor(Math.random() * 500 + 50),
      donors: Math.floor(Math.random() * 2000 + 100),
      hospitals: Math.floor(Math.random() * 50 + 5),
      bloodBanks: Math.floor(Math.random() * 20 + 2),
      activeEmergencies: Math.floor(Math.random() * 10),
      supplyStatus: (["ADEQUATE", "LOW", "CRITICAL", "SURPLUS"] as const)[Math.floor(Math.random() * 4)]!,
    }));
    res.json({
      totalBloodUnits: totalUnits,
      activeDonors: donors.filter(d => d.eligibilityStatus).length,
      registeredHospitals: hospitals.length,
      bloodBanks: banks.length,
      laboratories: labs.length,
      ambulances: ambulances.length,
      activeEmergencies,
      totalDonations: donors.reduce((s, d) => s + d.donationCount, 0),
      livesImpacted: donors.reduce((s, d) => s + d.livesImpacted, 0),
      stateData,
      byBloodGroup,
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.get("/analytics/state/:stateCode", async (req, res) => {
  try {
    const { stateCode } = req.params;
    const state = INDIA_STATES.find(s => s.code === stateCode);
    const stateName = state?.name ?? stateCode!;
    const { donors, hospitals, banks, activeEmergencies, totalUnits, byBloodGroup } = await getNationalStats();
    res.json({
      stateCode, stateName,
      totalUnits: Math.floor(totalUnits / 5),
      donors: Math.floor(donors.length / 5),
      hospitals: Math.floor(hospitals.length / 5),
      bloodBanks: Math.floor(banks.length / 5),
      activeEmergencies: Math.floor(activeEmergencies / 5),
      byBloodGroup,
      districtBreakdown: [],
    });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.get("/analytics/district/:districtCode", async (req, res) => {
  try {
    const { districtCode } = req.params;
    const { donors, hospitals, banks, activeEmergencies, totalUnits, byBloodGroup } = await getNationalStats();
    res.json({
      districtCode, districtName: districtCode, stateName: "India",
      totalUnits: Math.floor(totalUnits / 20),
      donors: Math.floor(donors.length / 20),
      hospitals: Math.floor(hospitals.length / 20),
      bloodBanks: Math.floor(banks.length / 20),
      activeEmergencies: Math.floor(activeEmergencies / 20),
      byBloodGroup,
    });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.get("/analytics/supply-demand", async (req, res) => {
  try {
    const period = String(req.query["period"] ?? "30d");
    const days = period === "7d" ? 7 : period === "90d" ? 90 : period === "1y" ? 365 : 30;
    const data = Array.from({ length: days }, (_, i) => {
      const date = new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000);
      return { date: date.toISOString().split("T")[0]!, supply: Math.floor(Math.random() * 100 + 200), demand: Math.floor(Math.random() * 80 + 150) };
    });
    const supplyTotal = data.reduce((s, d) => s + d.supply, 0);
    const demandTotal = data.reduce((s, d) => s + d.demand, 0);
    res.json({ period, data, supplyTotal, demandTotal, surplus: supplyTotal - demandTotal });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.get("/analytics/emergency-trends", async (req, res) => {
  try {
    const period = String(req.query["period"] ?? "30d");
    const days = period === "7d" ? 7 : period === "90d" ? 90 : period === "1y" ? 365 : 30;
    const data = Array.from({ length: days }, (_, i) => {
      const date = new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000);
      const count = Math.floor(Math.random() * 15 + 2);
      return { date: date.toISOString().split("T")[0]!, count, resolved: Math.floor(count * 0.85), avgResolutionMinutes: Math.floor(Math.random() * 60 + 20) };
    });
    res.json({ period, data, totalEmergencies: data.reduce((s, d) => s + d.count, 0), resolvedCount: data.reduce((s, d) => s + d.resolved, 0), avgResolutionTime: 38 });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

export default router;
