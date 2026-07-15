import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, emergencySosTable, hospitalsTable, ambulancesTable, bloodBanksTable, notificationsTable } from "@workspace/db";
import { authenticate, type AuthRequest } from "../lib/auth";
import { auditLog } from "../lib/audit";

const router: IRouter = Router();

function formatEmergency(e: typeof emergencySosTable.$inferSelect, hospitalName?: string | null, ambulanceNumber?: string | null, bloodBankName?: string | null) {
  return {
    id: e.id, sosCode: e.sosCode, patientName: e.patientName, bloodGroup: e.bloodGroup,
    unitsRequired: e.unitsRequired, status: e.status, hospitalId: e.hospitalId,
    hospitalName: hospitalName ?? null, contactNumber: e.contactNumber, patientAge: e.patientAge,
    medicalCondition: e.medicalCondition, latitude: e.latitude, longitude: e.longitude,
    ambulanceId: e.ambulanceId, ambulanceNumber: ambulanceNumber ?? null,
    bloodBankId: e.bloodBankId, bloodBankName: bloodBankName ?? null,
    notes: e.notes, resolvedAt: e.resolvedAt?.toISOString() ?? null,
    createdAt: e.createdAt.toISOString(),
  };
}

router.get("/emergency", async (req, res) => {
  try {
    const page = parseInt(String(req.query["page"] ?? "1"));
    const limit = parseInt(String(req.query["limit"] ?? "20"));
    const rows = await db.select().from(emergencySosTable).limit(limit).offset((page - 1) * limit).orderBy(desc(emergencySosTable.createdAt));
    const hospitals = await db.select().from(hospitalsTable);
    const hospitalMap = new Map(hospitals.map(h => [h.id, h]));
    const ambulances = await db.select().from(ambulancesTable);
    const ambulanceMap = new Map(ambulances.map(a => [a.id, a]));
    const banks = await db.select().from(bloodBanksTable);
    const bankMap = new Map(banks.map(b => [b.id, b]));
    res.json({
      emergencies: rows.map(e => formatEmergency(e, hospitalMap.get(e.hospitalId)?.name, e.ambulanceId ? ambulanceMap.get(e.ambulanceId)?.vehicleNumber : null, e.bloodBankId ? bankMap.get(e.bloodBankId)?.name : null)),
      total: rows.length, page, limit,
    });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.post("/emergency", authenticate, async (req: AuthRequest, res) => {
  try {
    const { patientName, bloodGroup, unitsRequired, hospitalId, contactNumber, patientAge, medicalCondition, latitude, longitude, notes } = req.body;
    const sosCode = `SOS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
    const [e] = await db.insert(emergencySosTable).values({
      sosCode, patientName, bloodGroup, unitsRequired: parseFloat(unitsRequired),
      hospitalId: parseInt(hospitalId), contactNumber, status: "ACTIVE",
      patientAge: patientAge ? parseInt(patientAge) : null,
      medicalCondition: medicalCondition ?? null,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      notes: notes ?? null,
    }).returning();
    await auditLog({ action: "SOS_CREATED", userId: req.user!.userId, resourceType: "emergency", resourceId: e!.id });
    const [hospital] = await db.select().from(hospitalsTable).where(eq(hospitalsTable.id, parseInt(hospitalId))).limit(1);
    res.status(201).json(formatEmergency(e!, hospital?.name));
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.get("/emergency/active", async (req, res) => {
  try {
    const rows = await db.select().from(emergencySosTable).where(eq(emergencySosTable.status, "ACTIVE")).orderBy(desc(emergencySosTable.createdAt)).limit(50);
    const hospitals = await db.select().from(hospitalsTable);
    const hospitalMap = new Map(hospitals.map(h => [h.id, h]));
    res.json({
      emergencies: rows.map(e => formatEmergency(e, hospitalMap.get(e.hospitalId)?.name)),
      total: rows.length, page: 1, limit: 50,
    });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.get("/emergency/:id", async (req, res) => {
  try {
    const [e] = await db.select().from(emergencySosTable).where(eq(emergencySosTable.id, parseInt(String(req.params["id"])))).limit(1);
    if (!e) { res.status(404).json({ error: "Not found" }); return; }
    const [hospital] = await db.select().from(hospitalsTable).where(eq(hospitalsTable.id, e.hospitalId)).limit(1);
    const ambulance = e.ambulanceId ? (await db.select().from(ambulancesTable).where(eq(ambulancesTable.id, e.ambulanceId)).limit(1))[0] : null;
    const bank = e.bloodBankId ? (await db.select().from(bloodBanksTable).where(eq(bloodBanksTable.id, e.bloodBankId)).limit(1))[0] : null;
    res.json(formatEmergency(e, hospital?.name, ambulance?.vehicleNumber, bank?.name));
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.patch("/emergency/:id", authenticate, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(String(req.params["id"]));
    const { status, ambulanceId, bloodBankId, notes } = req.body;
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (status) { updates["status"] = status; if (status === "RESOLVED" || status === "FULFILLED") updates["resolvedAt"] = new Date(); }
    if (ambulanceId !== undefined) updates["ambulanceId"] = ambulanceId ? parseInt(ambulanceId) : null;
    if (bloodBankId !== undefined) updates["bloodBankId"] = bloodBankId ? parseInt(bloodBankId) : null;
    if (notes) updates["notes"] = notes;
    const [e] = await db.update(emergencySosTable).set(updates).where(eq(emergencySosTable.id, id)).returning();
    await auditLog({ action: "SOS_UPDATED", userId: req.user!.userId, resourceType: "emergency", resourceId: id, metadata: { status } });
    res.json(formatEmergency(e!));
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

export default router;
