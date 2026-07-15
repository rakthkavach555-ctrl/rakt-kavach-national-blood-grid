import { Router, type IRouter } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, donorsTable, donationHistoryTable, usersTable } from "@workspace/db";
import { authenticate, type AuthRequest } from "../lib/auth";

const router: IRouter = Router();

function formatDonor(donor: typeof donorsTable.$inferSelect, user?: typeof usersTable.$inferSelect) {
  const dob = new Date(donor.dateOfBirth);
  const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  const lastDonation = donor.lastDonationDate ? new Date(donor.lastDonationDate) : null;
  let eligible = donor.eligibilityStatus;
  if (lastDonation) {
    const daysSince = Math.floor((Date.now() - lastDonation.getTime()) / (24 * 60 * 60 * 1000));
    eligible = daysSince >= 90;
  }
  return {
    id: donor.id, userId: donor.userId,
    name: user?.name ?? null, email: user?.email ?? null, phone: user?.phone ?? null,
    bloodGroup: donor.bloodGroup, dateOfBirth: donor.dateOfBirth, age, gender: donor.gender,
    weight: donor.weight, height: donor.height, abhaId: donor.abhaId,
    address: donor.address, state: donor.state, district: donor.district, photo: donor.photo,
    donationCount: donor.donationCount, lastDonationDate: donor.lastDonationDate,
    eligibilityStatus: eligible, livesImpacted: donor.livesImpacted,
    rewardPoints: donor.rewardPoints, healthCredits: donor.healthCredits,
    createdAt: donor.createdAt.toISOString(),
  };
}

router.get("/donors", async (req, res) => {
  try {
    const page = parseInt(String(req.query["page"] ?? "1"));
    const limit = parseInt(String(req.query["limit"] ?? "20"));
    const offset = (page - 1) * limit;
    const rows = await db.select().from(donorsTable).limit(limit).offset(offset).orderBy(desc(donorsTable.createdAt));
    const userIds = rows.map(r => r.userId);
    const users = userIds.length > 0
      ? await db.select().from(usersTable).where(eq(usersTable.id, userIds[0]!))
      : [];
    const userMap = new Map(users.map(u => [u.id, u]));
    res.json({ donors: rows.map(d => formatDonor(d, userMap.get(d.userId))), total: rows.length, page, limit });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.post("/donors", authenticate, async (req: AuthRequest, res) => {
  try {
    const { bloodGroup, dateOfBirth, gender, weight, height, abhaId, address, state, district, photo } = req.body;
    const [donor] = await db.insert(donorsTable).values({
      userId: req.user!.userId, bloodGroup, dateOfBirth, gender,
      weight: parseFloat(weight), height: parseFloat(height),
      abhaId: abhaId ?? null, address: address ?? null,
      state: state ?? null, district: district ?? null, photo: photo ?? null,
    }).returning();
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.userId)).limit(1);
    res.status(201).json(formatDonor(donor!, user));
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.get("/donors/nearby", async (req, res) => {
  try {
    const { bloodGroup, lat, lng, radius = 50 } = req.query;
    const conditions = bloodGroup ? [eq(donorsTable.bloodGroup, String(bloodGroup) as any)] : [];
    const rows = await db.select().from(donorsTable).where(conditions.length > 0 ? and(...conditions) : undefined).limit(20);
    const userIds = rows.map(r => r.userId);
    const users = userIds.length > 0
      ? await db.select().from(usersTable)
      : [];
    const userMap = new Map(users.map(u => [u.id, u]));
    res.json({ donors: rows.map(d => formatDonor(d, userMap.get(d.userId))), total: rows.length, page: 1, limit: 20 });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.get("/donors/:id", async (req, res) => {
  try {
    const id = parseInt(String(req.params["id"]));
    const [donor] = await db.select().from(donorsTable).where(eq(donorsTable.id, id)).limit(1);
    if (!donor) { res.status(404).json({ error: "Donor not found" }); return; }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, donor.userId)).limit(1);
    res.json(formatDonor(donor, user));
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.patch("/donors/:id", authenticate, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(String(req.params["id"]));
    const { weight, height, address, state, district, photo } = req.body;
    const updates: Record<string, unknown> = {};
    if (weight != null) updates["weight"] = parseFloat(weight);
    if (height != null) updates["height"] = parseFloat(height);
    if (address != null) updates["address"] = address;
    if (state != null) updates["state"] = state;
    if (district != null) updates["district"] = district;
    if (photo != null) updates["photo"] = photo;
    const [donor] = await db.update(donorsTable).set({ ...updates, updatedAt: new Date() }).where(eq(donorsTable.id, id)).returning();
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, donor!.userId)).limit(1);
    res.json(formatDonor(donor!, user));
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.get("/donors/:id/donations", async (req, res) => {
  try {
    const id = parseInt(String(req.params["id"]));
    const donations = await db.select().from(donationHistoryTable).where(eq(donationHistoryTable.donorId, id)).orderBy(desc(donationHistoryTable.donatedAt));
    res.json({
      donations: donations.map(d => ({
        id: d.id, donorId: d.donorId, donatedAt: d.donatedAt.toISOString(),
        bloodGroup: d.bloodGroup, units: d.units,
        bloodBankName: "Blood Bank", certificateUrl: d.certificateUrl, impactMessage: d.impactMessage,
      })),
      total: donations.length,
    });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

router.get("/donors/:id/eligibility", async (req, res) => {
  try {
    const id = parseInt(String(req.params["id"]));
    const [donor] = await db.select().from(donorsTable).where(eq(donorsTable.id, id)).limit(1);
    if (!donor) { res.status(404).json({ error: "Donor not found" }); return; }
    const lastDonation = donor.lastDonationDate ? new Date(donor.lastDonationDate) : null;
    const daysSince = lastDonation ? Math.floor((Date.now() - lastDonation.getTime()) / (24 * 60 * 60 * 1000)) : null;
    const eligible = daysSince == null || daysSince >= 90;
    const nextEligible = !eligible && lastDonation ? new Date(lastDonation.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString() : null;
    res.json({
      eligible,
      reason: eligible ? "You are eligible to donate" : `Please wait ${90 - (daysSince ?? 0)} more days`,
      nextEligibleDate: nextEligible,
      lastDonationDate: donor.lastDonationDate,
      daysSinceLastDonation: daysSince,
    });
  } catch (err) { req.log.error(err); res.status(500).json({ error: "Internal server error" }); }
});

export default router;
