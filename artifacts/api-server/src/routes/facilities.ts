import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, hospitalsTable, bloodBanksTable, laboratoriesTable, ambulancesTable, volunteersTable, usersTable, bloodInventoryTable, bloodRequestsTable, labTestsTable, bloodUnitsTable } from "@workspace/db";
import { authenticate, type AuthRequest } from "../lib/auth";

const router: IRouter = Router();

// HOSPITALS
router.get("/hospitals", async (req, res) => {
  try {
    const page = parseInt(String(req.query["page"] ?? "1"));
    const limit = parseInt(String(req.query["limit"] ?? "20"));
    const rows = await db.select().from(hospitalsTable).limit(limit).offset((page - 1) * limit).orderBy(desc(hospitalsTable.createdAt));
    res.json({ hospitals: rows.map(h => ({ ...h, createdAt: h.createdAt.toISOString(), updatedAt: h.updatedAt.toISOString() })), total: rows.length, page, limit });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.post("/hospitals", authenticate, async (req, res) => {
  try {
    const { name, registrationNumber, state, district, address, contactNumber, email, type = "GOVERNMENT", totalBeds, latitude, longitude } = req.body;
    const [h] = await db.insert(hospitalsTable).values({ name, registrationNumber, state, district, address, contactNumber, email: email ?? null, type, totalBeds: totalBeds ?? null, latitude: latitude ?? null, longitude: longitude ?? null }).returning();
    res.status(201).json({ ...h!, createdAt: h!.createdAt.toISOString(), updatedAt: h!.updatedAt.toISOString() });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.get("/hospitals/:id", async (req, res) => {
  try {
    const [h] = await db.select().from(hospitalsTable).where(eq(hospitalsTable.id, parseInt(String(req.params["id"])))).limit(1);
    if (!h) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ ...h, createdAt: h.createdAt.toISOString(), updatedAt: h.updatedAt.toISOString() });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.get("/hospitals/:id/inventory", async (req, res) => {
  try {
    const rows = await db.select().from(bloodInventoryTable).where(eq(bloodInventoryTable.bloodBankId, parseInt(String(req.params["id"])))).limit(50);
    const banks = await db.select().from(bloodBanksTable);
    const bankMap = new Map(banks.map(b => [b.id, b]));
    res.json({ inventory: rows.map(r => ({ ...r, bloodBankName: bankMap.get(r.bloodBankId)?.name ?? "", createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString() })), total: rows.length, page: 1, limit: 50 });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.get("/hospitals/:id/requests", async (req, res) => {
  try {
    const id = parseInt(String(req.params["id"]));
    const rows = await db.select().from(bloodRequestsTable).where(eq(bloodRequestsTable.hospitalId, id)).orderBy(desc(bloodRequestsTable.createdAt)).limit(50);
    res.json({ requests: rows.map(r => ({ ...r, patientName: null, hospitalName: null, bloodBankName: null, createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString() })), total: rows.length, page: 1, limit: 50 });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

// BLOOD BANKS
router.get("/blood-banks", async (req, res) => {
  try {
    const page = parseInt(String(req.query["page"] ?? "1"));
    const limit = parseInt(String(req.query["limit"] ?? "20"));
    const rows = await db.select().from(bloodBanksTable).limit(limit).offset((page - 1) * limit).orderBy(desc(bloodBanksTable.createdAt));
    const withStock = await Promise.all(rows.map(async (b) => {
      const inv = await db.select().from(bloodInventoryTable).where(eq(bloodInventoryTable.bloodBankId, b.id));
      const totalUnitsInStock = inv.reduce((s, i) => s + (i.status === "AVAILABLE" ? i.units : 0), 0);
      return { ...b, totalUnitsInStock, createdAt: b.createdAt.toISOString(), updatedAt: b.updatedAt.toISOString() };
    }));
    res.json({ bloodBanks: withStock, total: rows.length, page, limit });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.post("/blood-banks", authenticate, async (req, res) => {
  try {
    const { name, licenseNumber, state, district, address, contactNumber, email, latitude, longitude, isComponentFacility = false, is24x7 = false } = req.body;
    const [b] = await db.insert(bloodBanksTable).values({ name, licenseNumber, state, district, address, contactNumber, email: email ?? null, latitude: latitude ?? null, longitude: longitude ?? null, isComponentFacility, is24x7 }).returning();
    res.status(201).json({ ...b!, totalUnitsInStock: 0, createdAt: b!.createdAt.toISOString(), updatedAt: b!.updatedAt.toISOString() });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.get("/blood-banks/:id", async (req, res) => {
  try {
    const [b] = await db.select().from(bloodBanksTable).where(eq(bloodBanksTable.id, parseInt(String(req.params["id"])))).limit(1);
    if (!b) { res.status(404).json({ error: "Not found" }); return; }
    const inv = await db.select().from(bloodInventoryTable).where(eq(bloodInventoryTable.bloodBankId, b.id));
    const totalUnitsInStock = inv.reduce((s, i) => s + (i.status === "AVAILABLE" ? i.units : 0), 0);
    res.json({ ...b, totalUnitsInStock, createdAt: b.createdAt.toISOString(), updatedAt: b.updatedAt.toISOString() });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.get("/blood-banks/:id/inventory", async (req, res) => {
  try {
    const id = parseInt(String(req.params["id"]));
    const [bank] = await db.select().from(bloodBanksTable).where(eq(bloodBanksTable.id, id)).limit(1);
    const rows = await db.select().from(bloodInventoryTable).where(eq(bloodInventoryTable.bloodBankId, id)).orderBy(desc(bloodInventoryTable.createdAt)).limit(100);
    res.json({ inventory: rows.map(r => ({ ...r, bloodBankName: bank?.name ?? "", createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString() })), total: rows.length, page: 1, limit: 100 });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.post("/blood-banks/:id/inventory", authenticate, async (req, res) => {
  try {
    const bloodBankId = parseInt(String(req.params["id"]));
    const { bloodGroup, units, collectionDate, expiryDate, donorId } = req.body;
    const [inv] = await db.insert(bloodInventoryTable).values({ bloodBankId, bloodGroup, units: parseFloat(units), collectionDate, expiryDate: expiryDate ?? new Date(Date.now() + 42 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]!, donorId: donorId ?? null }).returning();
    const [bank] = await db.select().from(bloodBanksTable).where(eq(bloodBanksTable.id, bloodBankId)).limit(1);
    res.status(201).json({ ...inv!, bloodBankName: bank?.name ?? "", createdAt: inv!.createdAt.toISOString(), updatedAt: inv!.updatedAt.toISOString() });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

// LABORATORIES
router.get("/laboratories", async (req, res) => {
  try {
    const page = parseInt(String(req.query["page"] ?? "1"));
    const limit = parseInt(String(req.query["limit"] ?? "20"));
    const rows = await db.select().from(laboratoriesTable).limit(limit).offset((page - 1) * limit);
    res.json({ laboratories: rows.map(l => ({ ...l, createdAt: l.createdAt.toISOString(), updatedAt: l.updatedAt.toISOString() })), total: rows.length, page, limit });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.post("/laboratories", authenticate, async (req, res) => {
  try {
    const { name, licenseNumber, state, district, address, contactNumber, email } = req.body;
    const [l] = await db.insert(laboratoriesTable).values({ name, licenseNumber, state, district, address, contactNumber, email: email ?? null }).returning();
    res.status(201).json({ ...l!, createdAt: l!.createdAt.toISOString(), updatedAt: l!.updatedAt.toISOString() });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.get("/laboratories/:id", async (req, res) => {
  try {
    const [l] = await db.select().from(laboratoriesTable).where(eq(laboratoriesTable.id, parseInt(String(req.params["id"])))).limit(1);
    if (!l) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ ...l, createdAt: l.createdAt.toISOString(), updatedAt: l.updatedAt.toISOString() });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.get("/laboratories/:id/tests", async (req, res) => {
  try {
    const rows = await db.select().from(labTestsTable).where(eq(labTestsTable.laboratoryId, parseInt(String(req.params["id"])))).orderBy(desc(labTestsTable.testedAt)).limit(50);
    res.json({ tests: rows.map(t => ({ ...t, testedAt: t.testedAt.toISOString(), createdAt: t.createdAt.toISOString() })), total: rows.length });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.post("/laboratories/:id/tests", authenticate, async (req, res) => {
  try {
    const laboratoryId = parseInt(String(req.params["id"]));
    const { bloodUnitId, testType, result, notes } = req.body;
    const [t] = await db.insert(labTestsTable).values({ laboratoryId, bloodUnitId: parseInt(bloodUnitId), testType, result, notes: notes ?? null, testedBy: null }).returning();
    res.status(201).json({ ...t!, testedAt: t!.testedAt.toISOString(), createdAt: t!.createdAt.toISOString() });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

// AMBULANCES
router.get("/ambulances", async (req, res) => {
  try {
    const page = parseInt(String(req.query["page"] ?? "1"));
    const limit = parseInt(String(req.query["limit"] ?? "20"));
    const rows = await db.select().from(ambulancesTable).limit(limit).offset((page - 1) * limit);
    res.json({ ambulances: rows.map(a => ({ ...a, createdAt: a.createdAt.toISOString(), updatedAt: a.updatedAt.toISOString() })), total: rows.length, page, limit });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.post("/ambulances", authenticate, async (req, res) => {
  try {
    const { vehicleNumber, state, district, contactNumber, type = "BASIC", driverName, latitude, longitude } = req.body;
    const [a] = await db.insert(ambulancesTable).values({ vehicleNumber, state, district, contactNumber, type, driverName: driverName ?? null, latitude: latitude ?? null, longitude: longitude ?? null }).returning();
    res.status(201).json({ ...a!, createdAt: a!.createdAt.toISOString(), updatedAt: a!.updatedAt.toISOString() });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.get("/ambulances/:id", async (req, res) => {
  try {
    const [a] = await db.select().from(ambulancesTable).where(eq(ambulancesTable.id, parseInt(String(req.params["id"])))).limit(1);
    if (!a) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ ...a, createdAt: a.createdAt.toISOString(), updatedAt: a.updatedAt.toISOString() });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.patch("/ambulances/:id", authenticate, async (req, res) => {
  try {
    const id = parseInt(String(req.params["id"]));
    const { status, latitude, longitude, emergencyId } = req.body;
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (status) updates["status"] = status;
    if (latitude != null) updates["latitude"] = parseFloat(latitude);
    if (longitude != null) updates["longitude"] = parseFloat(longitude);
    if (emergencyId !== undefined) updates["emergencyId"] = emergencyId;
    const [a] = await db.update(ambulancesTable).set(updates).where(eq(ambulancesTable.id, id)).returning();
    res.json({ ...a!, createdAt: a!.createdAt.toISOString(), updatedAt: a!.updatedAt.toISOString() });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

// VOLUNTEERS
router.get("/volunteers", async (req, res) => {
  try {
    const page = parseInt(String(req.query["page"] ?? "1"));
    const limit = parseInt(String(req.query["limit"] ?? "20"));
    const rows = await db.select().from(volunteersTable).limit(limit).offset((page - 1) * limit);
    const users = await db.select().from(usersTable);
    const userMap = new Map(users.map(u => [u.id, u]));
    res.json({
      volunteers: rows.map(v => {
        const u = userMap.get(v.userId);
        return { ...v, name: u?.name ?? "", email: u?.email ?? "", phone: u?.phone ?? null, createdAt: v.createdAt.toISOString(), updatedAt: v.updatedAt.toISOString() };
      }),
      total: rows.length, page, limit,
    });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.post("/volunteers", authenticate, async (req: AuthRequest, res) => {
  try {
    const { state, district, skills = [], availability } = req.body;
    const [v] = await db.insert(volunteersTable).values({ userId: req.user!.userId, state, district, skills, availability: availability ?? null }).returning();
    const [u] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.userId)).limit(1);
    res.status(201).json({ ...v!, name: u?.name ?? "", email: u?.email ?? "", phone: u?.phone ?? null, createdAt: v!.createdAt.toISOString(), updatedAt: v!.updatedAt.toISOString() });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.get("/volunteers/:id", async (req, res) => {
  try {
    const [v] = await db.select().from(volunteersTable).where(eq(volunteersTable.id, parseInt(String(req.params["id"])))).limit(1);
    if (!v) { res.status(404).json({ error: "Not found" }); return; }
    const [u] = await db.select().from(usersTable).where(eq(usersTable.id, v.userId)).limit(1);
    res.json({ ...v, name: u?.name ?? "", email: u?.email ?? "", phone: u?.phone ?? null, createdAt: v.createdAt.toISOString(), updatedAt: v.updatedAt.toISOString() });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

export default router;
