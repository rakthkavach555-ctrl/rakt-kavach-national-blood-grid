import { Router, type IRouter } from "express";
import { eq, and, desc, sql } from "drizzle-orm";
import { db, bloodInventoryTable, bloodBanksTable, bloodUnitsTable, bloodUnitTimelineTable, bloodRequestsTable, hospitalsTable, patientsTable, donorsTable, usersTable } from "@workspace/db";
import { authenticate, type AuthRequest } from "../lib/auth";

const router: IRouter = Router();

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

// INVENTORY
router.get("/inventory", async (req, res) => {
  try {
    const page = parseInt(String(req.query["page"] ?? "1"));
    const limit = parseInt(String(req.query["limit"] ?? "20"));
    const rows = await db.select().from(bloodInventoryTable).limit(limit).offset((page - 1) * limit).orderBy(desc(bloodInventoryTable.createdAt));
    const banks = await db.select().from(bloodBanksTable);
    const bankMap = new Map(banks.map(b => [b.id, b]));
    res.json({ inventory: rows.map(r => ({ ...r, bloodBankName: bankMap.get(r.bloodBankId)?.name ?? "", createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString() })), total: rows.length, page, limit });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.get("/inventory/summary", async (req, res) => {
  try {
    const rows = await db.select().from(bloodInventoryTable).where(eq(bloodInventoryTable.status, "AVAILABLE"));
    const totalUnits = rows.reduce((s, r) => s + r.units, 0);
    const byGroup = BLOOD_GROUPS.map(bg => {
      const groupRows = rows.filter(r => r.bloodGroup === bg);
      const units = groupRows.reduce((s, r) => s + r.units, 0);
      const percentage = totalUnits > 0 ? (units / totalUnits) * 100 : 0;
      const status = units < 5 ? "CRITICAL" : units < 20 ? "LOW" : units < 50 ? "ADEQUATE" : "SURPLUS";
      return { bloodGroup: bg, units, percentage, status };
    });
    const criticalGroups = byGroup.filter(b => b.status === "CRITICAL" || b.status === "LOW").map(b => b.bloodGroup);
    res.json({ totalUnits, byBloodGroup: byGroup, criticalGroups, lastUpdated: new Date().toISOString() });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.get("/inventory/search", async (req, res) => {
  try {
    const { bloodGroup, units = 1, state, district } = req.query;
    if (!bloodGroup) { res.status(400).json({ error: "bloodGroup is required" }); return; }
    const rows = await db.select().from(bloodInventoryTable).where(and(eq(bloodInventoryTable.bloodGroup, String(bloodGroup) as any), eq(bloodInventoryTable.status, "AVAILABLE"))).orderBy(desc(bloodInventoryTable.units));
    const banks = await db.select().from(bloodBanksTable);
    const bankMap = new Map(banks.map(b => [b.id, b]));
    const results = rows.map(r => {
      const bank = bankMap.get(r.bloodBankId);
      return { bloodBankId: r.bloodBankId, bloodBankName: bank?.name ?? "", bloodGroup: r.bloodGroup, units: r.units, state: bank?.state ?? "", district: bank?.district ?? "", distance: null, contactNumber: bank?.contactNumber ?? "", latitude: bank?.latitude ?? null, longitude: bank?.longitude ?? null };
    });
    res.json({ results, totalFound: results.length, bloodGroup: String(bloodGroup) });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

// BLOOD UNITS
router.get("/blood-units", async (req, res) => {
  try {
    const page = parseInt(String(req.query["page"] ?? "1"));
    const limit = parseInt(String(req.query["limit"] ?? "20"));
    const rows = await db.select().from(bloodUnitsTable).limit(limit).offset((page - 1) * limit).orderBy(desc(bloodUnitsTable.createdAt));
    const donors = await db.select().from(donorsTable);
    const donorUsers = await db.select().from(usersTable);
    const donorUserMap = new Map(donorUsers.map(u => [u.id, u]));
    const donorMap = new Map(donors.map(d => [d.id, { ...d, name: donorUserMap.get(d.userId)?.name ?? null }]));
    const banks = await db.select().from(bloodBanksTable);
    const bankMap = new Map(banks.map(b => [b.id, b]));
    const hospitals = await db.select().from(hospitalsTable);
    const hospitalMap = new Map(hospitals.map(h => [h.id, h]));
    res.json({
      bloodUnits: rows.map(u => ({ ...u, donorName: u.donorId ? (donorMap.get(u.donorId)?.name ?? null) : null, bloodBankName: u.bloodBankId ? (bankMap.get(u.bloodBankId)?.name ?? null) : null, hospitalName: u.hospitalId ? (hospitalMap.get(u.hospitalId)?.name ?? null) : null, createdAt: u.createdAt.toISOString(), updatedAt: u.updatedAt.toISOString() })),
      total: rows.length, page, limit,
    });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.post("/blood-units", authenticate, async (req, res) => {
  try {
    const { bloodGroup, donorId, collectionDate, bloodBankId } = req.body;
    const unitCode = `BU-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const collDate = new Date(collectionDate);
    const expiryDate = new Date(collDate.getTime() + 42 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]!;
    const [unit] = await db.insert(bloodUnitsTable).values({ unitCode, bloodGroup, donorId: parseInt(donorId), collectionDate, expiryDate, bloodBankId: bloodBankId ? parseInt(bloodBankId) : null }).returning();
    await db.insert(bloodUnitTimelineTable).values({ bloodUnitId: unit!.id, status: "DONATED", location: "Donation Center", notes: "Blood unit registered" });
    res.status(201).json({ ...unit!, donorName: null, bloodBankName: null, hospitalName: null, createdAt: unit!.createdAt.toISOString(), updatedAt: unit!.updatedAt.toISOString() });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.get("/blood-units/:id", async (req, res) => {
  try {
    const [unit] = await db.select().from(bloodUnitsTable).where(eq(bloodUnitsTable.id, parseInt(String(req.params["id"])))).limit(1);
    if (!unit) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ ...unit, donorName: null, bloodBankName: null, hospitalName: null, createdAt: unit.createdAt.toISOString(), updatedAt: unit.updatedAt.toISOString() });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.patch("/blood-units/:id", authenticate, async (req, res) => {
  try {
    const id = parseInt(String(req.params["id"]));
    const { status, currentLocation, hospitalId, notes } = req.body;
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (status) updates["status"] = status;
    if (currentLocation) updates["currentLocation"] = currentLocation;
    if (hospitalId !== undefined) updates["hospitalId"] = hospitalId ? parseInt(hospitalId) : null;
    const [unit] = await db.update(bloodUnitsTable).set(updates).where(eq(bloodUnitsTable.id, id)).returning();
    if (status) {
      await db.insert(bloodUnitTimelineTable).values({ bloodUnitId: id, status, location: currentLocation ?? "Unknown", notes: notes ?? null, updatedBy: null });
    }
    res.json({ ...unit!, donorName: null, bloodBankName: null, hospitalName: null, createdAt: unit!.createdAt.toISOString(), updatedAt: unit!.updatedAt.toISOString() });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.get("/blood-units/:id/timeline", async (req, res) => {
  try {
    const id = parseInt(String(req.params["id"]));
    const [unit] = await db.select().from(bloodUnitsTable).where(eq(bloodUnitsTable.id, id)).limit(1);
    if (!unit) { res.status(404).json({ error: "Not found" }); return; }
    const timeline = await db.select().from(bloodUnitTimelineTable).where(eq(bloodUnitTimelineTable.bloodUnitId, id)).orderBy(bloodUnitTimelineTable.createdAt);
    res.json({
      unitId: id, unitCode: unit.unitCode, bloodGroup: unit.bloodGroup,
      timeline: timeline.map(t => ({ status: t.status, timestamp: t.createdAt.toISOString(), location: t.location, notes: t.notes, updatedBy: t.updatedBy })),
    });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

// BLOOD REQUESTS
router.get("/blood-requests", async (req, res) => {
  try {
    const page = parseInt(String(req.query["page"] ?? "1"));
    const limit = parseInt(String(req.query["limit"] ?? "20"));
    const rows = await db.select().from(bloodRequestsTable).limit(limit).offset((page - 1) * limit).orderBy(desc(bloodRequestsTable.createdAt));
    const hospitals = await db.select().from(hospitalsTable);
    const hospitalMap = new Map(hospitals.map(h => [h.id, h]));
    const banks = await db.select().from(bloodBanksTable);
    const bankMap = new Map(banks.map(b => [b.id, b]));
    res.json({
      requests: rows.map(r => ({ ...r, patientName: null, hospitalName: hospitalMap.get(r.hospitalId)?.name ?? null, bloodBankName: r.bloodBankId ? (bankMap.get(r.bloodBankId)?.name ?? null) : null, createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString() })),
      total: rows.length, page, limit,
    });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.post("/blood-requests", authenticate, async (req, res) => {
  try {
    const { bloodGroup, units, urgency = "ROUTINE", patientId, hospitalId, requiredBy, notes } = req.body;
    const [r] = await db.insert(bloodRequestsTable).values({ bloodGroup, units: parseFloat(units), urgency, patientId: parseInt(patientId), hospitalId: parseInt(hospitalId), requiredBy: requiredBy ?? null, notes: notes ?? null }).returning();
    res.status(201).json({ ...r!, patientName: null, hospitalName: null, bloodBankName: null, createdAt: r!.createdAt.toISOString(), updatedAt: r!.updatedAt.toISOString() });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.get("/blood-requests/:id", async (req, res) => {
  try {
    const [r] = await db.select().from(bloodRequestsTable).where(eq(bloodRequestsTable.id, parseInt(String(req.params["id"])))).limit(1);
    if (!r) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ ...r, patientName: null, hospitalName: null, bloodBankName: null, createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString() });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.patch("/blood-requests/:id", authenticate, async (req, res) => {
  try {
    const id = parseInt(String(req.params["id"]));
    const { status, bloodBankId, notes } = req.body;
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (status) updates["status"] = status;
    if (bloodBankId) updates["bloodBankId"] = parseInt(bloodBankId);
    if (notes) updates["notes"] = notes;
    const [r] = await db.update(bloodRequestsTable).set(updates).where(eq(bloodRequestsTable.id, id)).returning();
    res.json({ ...r!, patientName: null, hospitalName: null, bloodBankName: null, createdAt: r!.createdAt.toISOString(), updatedAt: r!.updatedAt.toISOString() });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

export default router;
