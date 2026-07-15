import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, patientsTable, usersTable, bloodRequestsTable, hospitalsTable } from "@workspace/db";
import { authenticate, type AuthRequest } from "../lib/auth";

const router: IRouter = Router();

function formatPatient(p: typeof patientsTable.$inferSelect, u?: typeof usersTable.$inferSelect) {
  return {
    id: p.id, userId: p.userId, name: u?.name ?? null, email: u?.email ?? null, phone: u?.phone ?? null,
    bloodGroup: p.bloodGroup, dateOfBirth: p.dateOfBirth, gender: p.gender,
    weight: p.weight, height: p.height, abhaId: p.abhaId, medicalNotes: p.medicalNotes,
    address: p.address, state: p.state, district: p.district,
    createdAt: p.createdAt.toISOString(),
  };
}

router.get("/patients", authenticate, async (req: AuthRequest, res) => {
  try {
    const page = parseInt(String(req.query["page"] ?? "1"));
    const limit = parseInt(String(req.query["limit"] ?? "20"));
    const offset = (page - 1) * limit;
    const rows = await db.select().from(patientsTable).limit(limit).offset(offset).orderBy(desc(patientsTable.createdAt));
    const users = await db.select().from(usersTable);
    const userMap = new Map(users.map(u => [u.id, u]));
    res.json({ patients: rows.map(p => formatPatient(p, userMap.get(p.userId))), total: rows.length, page, limit });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.post("/patients", authenticate, async (req: AuthRequest, res) => {
  try {
    const { bloodGroup, dateOfBirth, gender, weight, height, abhaId, medicalNotes, address, state, district } = req.body;
    const [patient] = await db.insert(patientsTable).values({
      userId: req.user!.userId, bloodGroup, dateOfBirth, gender,
      weight: weight ? parseFloat(weight) : null, height: height ? parseFloat(height) : null,
      abhaId: abhaId ?? null, medicalNotes: medicalNotes ?? null,
      address: address ?? null, state: state ?? null, district: district ?? null,
    }).returning();
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.userId)).limit(1);
    res.status(201).json(formatPatient(patient!, user));
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.get("/patients/:id", authenticate, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(String(req.params["id"]));
    const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.id, id)).limit(1);
    if (!patient) { res.status(404).json({ error: "Patient not found" }); return; }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, patient.userId)).limit(1);
    res.json(formatPatient(patient, user));
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.patch("/patients/:id", authenticate, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(String(req.params["id"]));
    const { weight, height, medicalNotes, address } = req.body;
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (weight != null) updates["weight"] = parseFloat(weight);
    if (height != null) updates["height"] = parseFloat(height);
    if (medicalNotes != null) updates["medicalNotes"] = medicalNotes;
    if (address != null) updates["address"] = address;
    const [patient] = await db.update(patientsTable).set(updates).where(eq(patientsTable.id, id)).returning();
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, patient!.userId)).limit(1);
    res.json(formatPatient(patient!, user));
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.get("/patients/:id/requests", authenticate, async (req, res) => {
  try {
    const id = parseInt(String(req.params["id"]));
    const requests = await db.select().from(bloodRequestsTable).where(eq(bloodRequestsTable.patientId, id)).orderBy(desc(bloodRequestsTable.createdAt));
    const hospitals = await db.select().from(hospitalsTable);
    const hospitalMap = new Map(hospitals.map(h => [h.id, h]));
    res.json({
      requests: requests.map(r => ({
        id: r.id, bloodGroup: r.bloodGroup, units: r.units, urgency: r.urgency, status: r.status,
        patientId: r.patientId, patientName: null, hospitalId: r.hospitalId,
        hospitalName: hospitalMap.get(r.hospitalId)?.name ?? null,
        bloodBankId: r.bloodBankId, bloodBankName: null,
        requiredBy: r.requiredBy, notes: r.notes, createdAt: r.createdAt.toISOString(),
      })),
      total: requests.length, page: 1, limit: 50,
    });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

export default router;
