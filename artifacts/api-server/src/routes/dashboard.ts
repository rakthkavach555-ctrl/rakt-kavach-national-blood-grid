import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, donorsTable, hospitalsTable, bloodBanksTable, laboratoriesTable, ambulancesTable, bloodInventoryTable, emergencySosTable, bloodRequestsTable, walletsTable, donationHistoryTable, auditLogsTable, usersTable } from "@workspace/db";
import { authenticate, type AuthRequest } from "../lib/auth";

const router: IRouter = Router();
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

async function getInventorySummary() {
  const rows = await db.select().from(bloodInventoryTable).where(eq(bloodInventoryTable.status, "AVAILABLE"));
  const totalUnits = rows.reduce((s, r) => s + r.units, 0);
  const byBloodGroup = BLOOD_GROUPS.map(bg => {
    const units = rows.filter(r => r.bloodGroup === bg).reduce((s, r) => s + r.units, 0);
    const pct = totalUnits > 0 ? (units / totalUnits) * 100 : 0;
    const status = units < 5 ? "CRITICAL" : units < 20 ? "LOW" : units < 50 ? "ADEQUATE" : "SURPLUS";
    return { bloodGroup: bg, units, percentage: pct, status };
  });
  const criticalGroups = byBloodGroup.filter(b => b.status === "CRITICAL" || b.status === "LOW").map(b => b.bloodGroup);
  return { totalUnits, byBloodGroup, criticalGroups, lastUpdated: new Date().toISOString() };
}

router.get("/dashboard/national", authenticate, async (req, res) => {
  try {
    const [donors, hospitals, banks, labs, ambulances, emergencies, inventory] = await Promise.all([
      db.select().from(donorsTable),
      db.select().from(hospitalsTable),
      db.select().from(bloodBanksTable),
      db.select().from(laboratoriesTable),
      db.select().from(ambulancesTable),
      db.select().from(emergencySosTable).orderBy(desc(emergencySosTable.createdAt)).limit(10),
      getInventorySummary(),
    ]);
    const allEmergencies = await db.select().from(emergencySosTable);
    const activeEmergencies = allEmergencies.filter(e => ["ACTIVE","BROADCAST","DISPATCHED"].includes(e.status)).length;
    const totalUnits = inventory.totalUnits;
    const byBloodGroup = inventory.byBloodGroup;
    const stats = {
      totalBloodUnits: totalUnits, activeDonors: donors.filter(d => d.eligibilityStatus).length,
      registeredHospitals: hospitals.length, bloodBanks: banks.length,
      laboratories: labs.length, ambulances: ambulances.length,
      activeEmergencies, totalDonations: donors.reduce((s, d) => s + d.donationCount, 0),
      livesImpacted: donors.reduce((s, d) => s + d.livesImpacted, 0),
      stateData: [],
      byBloodGroup,
      lastUpdated: new Date().toISOString(),
    };
    const recentEmergencies = emergencies.map(e => ({ id: e.id, sosCode: e.sosCode, patientName: e.patientName, bloodGroup: e.bloodGroup, unitsRequired: e.unitsRequired, status: e.status, hospitalId: e.hospitalId, hospitalName: null, contactNumber: e.contactNumber, patientAge: e.patientAge, medicalCondition: e.medicalCondition, latitude: e.latitude, longitude: e.longitude, ambulanceId: e.ambulanceId, ambulanceNumber: null, bloodBankId: e.bloodBankId, bloodBankName: null, notes: e.notes, resolvedAt: e.resolvedAt?.toISOString() ?? null, createdAt: e.createdAt.toISOString() }));
    const criticalStates = [
      { stateCode: "UP", stateName: "Uttar Pradesh", totalUnits: 12, donors: 450, hospitals: 18, bloodBanks: 8, activeEmergencies: 4, supplyStatus: "CRITICAL" as const },
      { stateCode: "BR", stateName: "Bihar", totalUnits: 8, donors: 290, hospitals: 12, bloodBanks: 5, activeEmergencies: 3, supplyStatus: "CRITICAL" as const },
    ];
    const supplyDemandTrend = {
      period: "30d",
      data: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split("T")[0]!,
        supply: Math.floor(Math.random() * 100 + 200),
        demand: Math.floor(Math.random() * 80 + 150),
      })),
      supplyTotal: 7200, demandTotal: 6400, surplus: 800,
    };
    const whoReadiness = { overallScore: 78.5, icd11Compatible: true, fhirReady: true, abdmIntegrated: false, reportingReady: true, lastAudit: new Date().toISOString() };
    res.json({ stats, recentEmergencies, criticalStates, inventorySummary: inventory, supplyDemandTrend, whoReadiness });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.get("/dashboard/donor/:userId", authenticate, async (req, res) => {
  try {
    const userId = parseInt(String(req.params["userId"]));
    const [donor] = await db.select().from(donorsTable).where(eq(donorsTable.userId, userId)).limit(1);
    if (!donor) { res.status(404).json({ error: "Donor profile not found" }); return; }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    let [wallet] = await db.select().from(walletsTable).where(eq(walletsTable.userId, userId)).limit(1);
    if (!wallet) { [wallet] = await db.insert(walletsTable).values({ userId }).returning(); }
    const donations = await db.select().from(donationHistoryTable).where(eq(donationHistoryTable.donorId, donor.id)).orderBy(desc(donationHistoryTable.donatedAt)).limit(5);
    const dob = new Date(donor.dateOfBirth);
    const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 86400000));
    const lastDonation = donor.lastDonationDate ? new Date(donor.lastDonationDate) : null;
    const daysSince = lastDonation ? Math.floor((Date.now() - lastDonation.getTime()) / 86400000) : null;
    const eligible = daysSince == null || daysSince >= 90;
    const donorFormatted = { id: donor.id, userId: donor.userId, name: user?.name ?? null, email: user?.email ?? null, phone: user?.phone ?? null, bloodGroup: donor.bloodGroup, dateOfBirth: donor.dateOfBirth, age, gender: donor.gender, weight: donor.weight, height: donor.height, abhaId: donor.abhaId, address: donor.address, state: donor.state, district: donor.district, photo: donor.photo, donationCount: donor.donationCount, lastDonationDate: donor.lastDonationDate, eligibilityStatus: eligible, livesImpacted: donor.livesImpacted, rewardPoints: donor.rewardPoints, healthCredits: donor.healthCredits, createdAt: donor.createdAt.toISOString() };
    const walletFormatted = { id: wallet!.id, userId: wallet!.userId, userName: user?.name ?? "", bloodCredits: wallet!.bloodCredits, donationCredits: wallet!.donationCredits, emergencyCredits: wallet!.emergencyCredits, familyProtected: wallet!.familyProtected, qrCode: wallet!.qrCode, createdAt: wallet!.createdAt.toISOString() };
    const eligibilityStatus = { eligible, reason: eligible ? "You are eligible to donate" : `Wait ${90 - (daysSince ?? 0)} more days`, nextEligibleDate: !eligible && lastDonation ? new Date(lastDonation.getTime() + 90 * 86400000).toISOString() : null, lastDonationDate: donor.lastDonationDate, daysSinceLastDonation: daysSince };
    const impactStats = { livesImpacted: donor.livesImpacted, totalUnits: donor.donationCount, donationStreak: Math.min(donor.donationCount, 5), rewardPoints: donor.rewardPoints };
    const upcomingCamps = [{ name: "National Blood Donation Camp", date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]!, location: "City Hospital Grounds", district: donor.district ?? "Local" }];
    res.json({ donor: donorFormatted, wallet: walletFormatted, recentDonations: donations.map(d => ({ id: d.id, donorId: d.donorId, donatedAt: d.donatedAt.toISOString(), bloodGroup: d.bloodGroup, units: d.units, bloodBankName: "Blood Bank", certificateUrl: d.certificateUrl, impactMessage: d.impactMessage })), eligibilityStatus, impactStats, upcomingCamps });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.get("/dashboard/hospital/:hospitalId", authenticate, async (req, res) => {
  try {
    const hospitalId = parseInt(String(req.params["hospitalId"]));
    const [hospital] = await db.select().from(hospitalsTable).where(eq(hospitalsTable.id, hospitalId)).limit(1);
    if (!hospital) { res.status(404).json({ error: "Hospital not found" }); return; }
    const [inventory, pendingRequests, recentRequests, activeEmergencies] = await Promise.all([
      getInventorySummary(),
      db.select().from(bloodRequestsTable).where(eq(bloodRequestsTable.hospitalId, hospitalId)).limit(10),
      db.select().from(bloodRequestsTable).where(eq(bloodRequestsTable.hospitalId, hospitalId)).orderBy(desc(bloodRequestsTable.createdAt)).limit(5),
      db.select().from(emergencySosTable).where(eq(emergencySosTable.hospitalId, hospitalId)).limit(5),
    ]);
    const fmt = (r: typeof bloodRequestsTable.$inferSelect) => ({ ...r, patientName: null, hospitalName: hospital.name, bloodBankName: null, createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString() });
    const fmtE = (e: typeof emergencySosTable.$inferSelect) => ({ id: e.id, sosCode: e.sosCode, patientName: e.patientName, bloodGroup: e.bloodGroup, unitsRequired: e.unitsRequired, status: e.status, hospitalId: e.hospitalId, hospitalName: hospital.name, contactNumber: e.contactNumber, patientAge: e.patientAge, medicalCondition: e.medicalCondition, latitude: e.latitude, longitude: e.longitude, ambulanceId: e.ambulanceId, ambulanceNumber: null, bloodBankId: e.bloodBankId, bloodBankName: null, notes: e.notes, resolvedAt: e.resolvedAt?.toISOString() ?? null, createdAt: e.createdAt.toISOString() });
    res.json({ hospital: { ...hospital, createdAt: hospital.createdAt.toISOString(), updatedAt: hospital.updatedAt.toISOString() }, inventory, pendingRequests: pendingRequests.map(fmt), recentRequests: recentRequests.map(fmt), activeEmergencies: activeEmergencies.map(fmtE) });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.get("/dashboard/blood-bank/:bloodBankId", authenticate, async (req, res) => {
  try {
    const bloodBankId = parseInt(String(req.params["bloodBankId"]));
    const [bank] = await db.select().from(bloodBanksTable).where(eq(bloodBanksTable.id, bloodBankId)).limit(1);
    if (!bank) { res.status(404).json({ error: "Blood bank not found" }); return; }
    const inv = await db.select().from(bloodInventoryTable).where(eq(bloodInventoryTable.bloodBankId, bloodBankId));
    const totalUnits = inv.filter(i => i.status === "AVAILABLE").reduce((s, i) => s + i.units, 0);
    const byBloodGroup = BLOOD_GROUPS.map(bg => {
      const units = inv.filter(i => i.bloodGroup === bg && i.status === "AVAILABLE").reduce((s, i) => s + i.units, 0);
      const pct = totalUnits > 0 ? (units / totalUnits) * 100 : 0;
      const status = units < 5 ? "CRITICAL" : units < 20 ? "LOW" : units < 50 ? "ADEQUATE" : "SURPLUS";
      return { bloodGroup: bg, units, percentage: pct, status };
    });
    const expiringUnits = inv.filter(i => {
      const expiry = new Date(i.expiryDate);
      return expiry.getTime() - Date.now() < 7 * 86400000 && i.status === "AVAILABLE";
    });
    const inventorySummary = { totalUnits, byBloodGroup, criticalGroups: byBloodGroup.filter(b => b.status === "CRITICAL" || b.status === "LOW").map(b => b.bloodGroup), lastUpdated: new Date().toISOString() };
    const stats = { totalUnits, unitsExpiringSoon: expiringUnits.length, requestsFulfilled: 0, requestsPending: 0 };
    res.json({ bloodBank: { ...bank, totalUnitsInStock: totalUnits, createdAt: bank.createdAt.toISOString(), updatedAt: bank.updatedAt.toISOString() }, inventory: inventorySummary, incomingRequests: [], outgoingRequests: [], expiringUnits: expiringUnits.map(e => ({ ...e, bloodBankName: bank.name, createdAt: e.createdAt.toISOString(), updatedAt: e.updatedAt.toISOString() })), stats });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.get("/dashboard/state/:stateCode", authenticate, async (req, res) => {
  try {
    const { stateCode } = req.params;
    const [hospitals, banks, ambulances, emergencies] = await Promise.all([
      db.select().from(hospitalsTable).limit(5),
      db.select().from(bloodBanksTable).limit(5),
      db.select().from(ambulancesTable).limit(5),
      db.select().from(emergencySosTable).where(eq(emergencySosTable.status, "ACTIVE")).limit(5),
    ]);
    const inv = await getInventorySummary();
    res.json({
      stateCode, stateName: stateCode,
      analytics: { stateCode, stateName: stateCode, totalUnits: inv.totalUnits, donors: 500, hospitals: hospitals.length, bloodBanks: banks.length, activeEmergencies: emergencies.length, byBloodGroup: inv.byBloodGroup, districtBreakdown: [] },
      activeEmergencies: emergencies.map(e => ({ id: e.id, sosCode: e.sosCode, patientName: e.patientName, bloodGroup: e.bloodGroup, unitsRequired: e.unitsRequired, status: e.status, hospitalId: e.hospitalId, hospitalName: null, contactNumber: e.contactNumber, patientAge: e.patientAge, medicalCondition: e.medicalCondition, latitude: e.latitude, longitude: e.longitude, ambulanceId: e.ambulanceId, ambulanceNumber: null, bloodBankId: e.bloodBankId, bloodBankName: null, notes: e.notes, resolvedAt: e.resolvedAt?.toISOString() ?? null, createdAt: e.createdAt.toISOString() })),
      districtBreakdown: [],
      bloodBanks: banks.map(b => ({ ...b, totalUnitsInStock: 0, createdAt: b.createdAt.toISOString(), updatedAt: b.updatedAt.toISOString() })),
      hospitals: hospitals.map(h => ({ ...h, createdAt: h.createdAt.toISOString(), updatedAt: h.updatedAt.toISOString() })),
    });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.get("/dashboard/district/:districtCode", authenticate, async (req, res) => {
  try {
    const { districtCode } = req.params;
    const [hospitals, banks, ambulances, emergencies] = await Promise.all([
      db.select().from(hospitalsTable).limit(3),
      db.select().from(bloodBanksTable).limit(3),
      db.select().from(ambulancesTable).limit(3),
      db.select().from(emergencySosTable).limit(3),
    ]);
    const inv = await getInventorySummary();
    res.json({
      districtCode, districtName: districtCode,
      analytics: { districtCode, districtName: districtCode, stateName: "India", totalUnits: Math.floor(inv.totalUnits / 10), donors: 50, hospitals: hospitals.length, bloodBanks: banks.length, activeEmergencies: 0, byBloodGroup: inv.byBloodGroup },
      activeEmergencies: [],
      bloodBanks: banks.map(b => ({ ...b, totalUnitsInStock: 0, createdAt: b.createdAt.toISOString(), updatedAt: b.updatedAt.toISOString() })),
      hospitals: hospitals.map(h => ({ ...h, createdAt: h.createdAt.toISOString(), updatedAt: h.updatedAt.toISOString() })),
      ambulances: ambulances.map(a => ({ ...a, createdAt: a.createdAt.toISOString(), updatedAt: a.updatedAt.toISOString() })),
    });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.get("/dashboard/ai-predictions", authenticate, async (req, res) => {
  try {
    const BLOOD_GROUPS_TYPED = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;
    const predictions = BLOOD_GROUPS_TYPED.map(bg => ({
      bloodGroup: bg,
      predictedDemand: Math.floor(Math.random() * 100 + 50),
      predictedSupply: Math.floor(Math.random() * 80 + 40),
      confidence: Math.floor(Math.random() * 20 + 75),
      recommendation: bg === "O-" ? "CRITICAL: Stock O- urgently. Universal donor shortage." : `Maintain current ${bg} donation drives.`,
      riskLevel: (["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const)[Math.floor(Math.random() * 4)]!,
    }));
    res.json({ predictions, forecastPeriod: "Next 7 days", generatedAt: new Date().toISOString(), overallRisk: "MEDIUM" });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.get("/dashboard/audit-logs", authenticate, async (req, res) => {
  try {
    const page = parseInt(String(req.query["page"] ?? "1"));
    const limit = parseInt(String(req.query["limit"] ?? "20"));
    const logs = await db.select().from(auditLogsTable).orderBy(desc(auditLogsTable.createdAt)).limit(limit).offset((page - 1) * limit);
    const users = await db.select().from(usersTable);
    const userMap = new Map(users.map(u => [u.id, u]));
    res.json({
      logs: logs.map(l => ({ id: l.id, action: l.action, userId: l.userId, userName: userMap.get(l.userId)?.name ?? null, resourceType: l.resourceType, resourceId: l.resourceId, metadata: l.metadata ? JSON.stringify(l.metadata) : null, ipAddress: l.ipAddress, createdAt: l.createdAt.toISOString() })),
      total: logs.length, page, limit,
    });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.get("/users", authenticate, async (req, res) => {
  try {
    const page = parseInt(String(req.query["page"] ?? "1"));
    const limit = parseInt(String(req.query["limit"] ?? "20"));
    const users = await db.select().from(usersTable).limit(limit).offset((page - 1) * limit).orderBy(desc(usersTable.createdAt));
    res.json({ users: users.map(u => ({ id: u.id, email: u.email, name: u.name, role: u.role, phone: u.phone, state: u.state, district: u.district, isActive: u.isActive, isVerified: u.isVerified, createdAt: u.createdAt.toISOString() })), total: users.length, page, limit });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.get("/users/:id", authenticate, async (req, res) => {
  try {
    const [u] = await db.select().from(usersTable).where(eq(usersTable.id, parseInt(String(req.params["id"])))).limit(1);
    if (!u) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ id: u.id, email: u.email, name: u.name, role: u.role, phone: u.phone, state: u.state, district: u.district, isActive: u.isActive, isVerified: u.isVerified, createdAt: u.createdAt.toISOString() });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

export default router;
