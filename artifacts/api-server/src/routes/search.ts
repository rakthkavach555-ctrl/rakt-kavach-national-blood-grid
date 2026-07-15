import { Router, type IRouter } from "express";
import { like, or, ilike, desc } from "drizzle-orm";
import { db, donorsTable, usersTable, hospitalsTable, bloodBanksTable, laboratoriesTable, ambulancesTable, bloodUnitsTable, emergencySosTable } from "@workspace/db";
import { authenticate } from "../lib/auth";

const router: IRouter = Router();

router.get("/search", authenticate, async (req, res) => {
  try {
    const q = String(req.query["q"] ?? "").trim();
    const type = String(req.query["type"] ?? "all");
    const limit = Math.min(parseInt(String(req.query["limit"] ?? "10")), 50);

    if (!q || q.length < 2) {
      res.json({ query: q, results: { donors: [], hospitals: [], bloodBanks: [], bloodUnits: [], emergencies: [], laboratories: [], ambulances: [] }, total: 0 });
      return;
    }

    const results: Record<string, unknown[]> = {
      donors: [], hospitals: [], bloodBanks: [], bloodUnits: [], emergencies: [], laboratories: [], ambulances: [],
    };

    // Search donors
    if (type === "all" || type === "donors") {
      const users = await db.select().from(usersTable)
        .where(or(ilike(usersTable.name, `%${q}%`), ilike(usersTable.email, `%${q}%`), ilike(usersTable.phone, `%${q}%`)))
        .limit(limit);
      const donors = await db.select().from(donorsTable).limit(50);
      const donorMap = new Map(donors.map(d => [d.userId, d]));
      results["donors"] = users
        .filter(u => donorMap.has(u.id))
        .map(u => {
          const d = donorMap.get(u.id)!;
          return { id: d.id, name: u.name, email: u.email, phone: u.phone, bloodGroup: d.bloodGroup, donationCount: d.donationCount, state: d.state, district: d.district, eligibilityStatus: d.eligibilityStatus, type: "donor" };
        });
    }

    // Search hospitals
    if (type === "all" || type === "hospitals") {
      const hospitals = await db.select().from(hospitalsTable)
        .where(or(ilike(hospitalsTable.name, `%${q}%`), ilike(hospitalsTable.district, `%${q}%`), ilike(hospitalsTable.state, `%${q}%`), ilike(hospitalsTable.registrationNumber, `%${q}%`)))
        .limit(limit);
      results["hospitals"] = hospitals.map(h => ({ id: h.id, name: h.name, type: h.type, totalBeds: h.totalBeds, state: h.state, district: h.district, contactNumber: h.contactNumber, isActive: h.isActive, entityType: "hospital" }));
    }

    // Search blood banks
    if (type === "all" || type === "blood_banks") {
      const banks = await db.select().from(bloodBanksTable)
        .where(or(ilike(bloodBanksTable.name, `%${q}%`), ilike(bloodBanksTable.district, `%${q}%`), ilike(bloodBanksTable.state, `%${q}%`), ilike(bloodBanksTable.licenseNumber, `%${q}%`)))
        .limit(limit);
      results["bloodBanks"] = banks.map(b => ({ id: b.id, name: b.name, licenseNumber: b.licenseNumber, state: b.state, district: b.district, is24x7: b.is24x7, isComponentFacility: b.isComponentFacility, entityType: "blood_bank" }));
    }

    // Search blood units
    if (type === "all" || type === "blood_units") {
      const units = await db.select().from(bloodUnitsTable)
        .where(or(ilike(bloodUnitsTable.unitCode, `%${q}%`), ilike(bloodUnitsTable.currentLocation, `%${q}%`)))
        .limit(limit).orderBy(desc(bloodUnitsTable.createdAt));
      results["bloodUnits"] = units.map(u => ({ id: u.id, unitCode: u.unitCode, bloodGroup: u.bloodGroup, status: u.status, currentLocation: u.currentLocation, expiryDate: u.expiryDate, entityType: "blood_unit" }));
    }

    // Search emergencies
    if (type === "all" || type === "emergencies") {
      const emergencies = await db.select().from(emergencySosTable)
        .where(or(ilike(emergencySosTable.sosCode, `%${q}%`), ilike(emergencySosTable.patientName, `%${q}%`), ilike(emergencySosTable.medicalCondition, `%${q}%`)))
        .limit(limit).orderBy(desc(emergencySosTable.createdAt));
      results["emergencies"] = emergencies.map(e => ({ id: e.id, sosCode: e.sosCode, patientName: e.patientName, bloodGroup: e.bloodGroup, unitsRequired: e.unitsRequired, status: e.status, contactNumber: e.contactNumber, entityType: "emergency" }));
    }

    // Search laboratories
    if (type === "all" || type === "laboratories") {
      const labs = await db.select().from(laboratoriesTable)
        .where(or(ilike(laboratoriesTable.name, `%${q}%`), ilike(laboratoriesTable.district, `%${q}%`)))
        .limit(limit);
      results["laboratories"] = labs.map(l => ({ id: l.id, name: l.name, licenseNumber: l.licenseNumber, state: l.state, district: l.district, entityType: "laboratory" }));
    }

    // Search ambulances
    if (type === "all" || type === "ambulances") {
      const ambulances = await db.select().from(ambulancesTable)
        .where(or(ilike(ambulancesTable.vehicleNumber, `%${q}%`), ilike(ambulancesTable.driverName, `%${q}%`), ilike(ambulancesTable.district, `%${q}%`)))
        .limit(limit);
      results["ambulances"] = ambulances.map(a => ({ id: a.id, vehicleNumber: a.vehicleNumber, type: a.type, status: a.status, driverName: a.driverName, state: a.state, district: a.district, entityType: "ambulance" }));
    }

    const total = Object.values(results).reduce((s, arr) => s + arr.length, 0);
    res.json({ query: q, results, total });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
