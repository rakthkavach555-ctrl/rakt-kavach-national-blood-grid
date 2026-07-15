import { db } from "@workspace/db";
import {
  usersTable, donorsTable, donationHistoryTable,
  patientsTable, hospitalsTable, bloodBanksTable,
  laboratoriesTable, ambulancesTable, volunteersTable,
  bloodInventoryTable, bloodUnitsTable, bloodUnitTimelineTable,
  bloodRequestsTable, emergencySosTable, walletsTable,
  walletTransactionsTable, notificationsTable, auditLogsTable,
} from "@workspace/db";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding RAKT KAVACH database…");

  const pw = await bcrypt.hash("password123", 10);

  // ── Users ────────────────────────────────────────────────────────────────
  const userData = [
    { email: "admin@raktakavach.in", passwordHash: pw, name: "National Administrator", role: "NATIONAL_ADMIN" as const, phone: "9999900001", state: "Delhi", district: "New Delhi", isActive: true, isVerified: true },
    { email: "donor@raktakavach.in",  passwordHash: pw, name: "Arjun Sharma",          role: "DONOR"          as const, phone: "9876543210", state: "Maharashtra", district: "Mumbai",    isActive: true, isVerified: true },
    { email: "donor2@raktakavach.in", passwordHash: pw, name: "Priya Singh",           role: "DONOR"          as const, phone: "9876543211", state: "Tamil Nadu",  district: "Chennai",   isActive: true, isVerified: true },
    { email: "patient@raktakavach.in",passwordHash: pw, name: "Rahul Verma",           role: "PATIENT"        as const, phone: "9876543212", state: "Karnataka",   district: "Bengaluru", isActive: true, isVerified: true },
    { email: "hospital@raktakavach.in",passwordHash: pw, name: "Hospital Admin",       role: "HOSPITAL"       as const, phone: "9876543213", state: "Maharashtra", district: "Mumbai",    isActive: true, isVerified: true },
    { email: "state@raktakavach.in",  passwordHash: pw, name: "Maharashtra State Admin", role: "STATE_ADMIN"  as const, phone: "9876543214", state: "Maharashtra", district: "Mumbai",    isActive: true, isVerified: true },
  ];
  const users = await db.insert(usersTable).values(userData).onConflictDoNothing().returning();
  if (!users.length) {
    console.log("Users already seeded, skipping.");
    return;
  }
  console.log(`Created ${users.length} users.`);

  const adminUser   = users[0]!;
  const donorUser1  = users[1]!;
  const donorUser2  = users[2]!;
  const patientUser = users[3]!;

  // ── Hospitals ──────────────────────────────────────────────────────────
  const [hospital1, hospital2] = await db.insert(hospitalsTable).values([
    { name: "AIIMS New Delhi", registrationNumber: "DL-HOSP-001", state: "Delhi", district: "New Delhi", address: "Sri Aurobindo Marg, Ansari Nagar, New Delhi 110029", contactNumber: "011-26588500", email: "aiims@gov.in", type: "GOVERNMENT" as const, totalBeds: 2478, latitude: 28.5672, longitude: 77.2100 },
    { name: "Lilavati Hospital Mumbai", registrationNumber: "MH-HOSP-001", state: "Maharashtra", district: "Mumbai", address: "A-791, Bandra Reclamation, Bandra West, Mumbai 400050", contactNumber: "022-26568000", email: "info@lilavati.org", type: "PRIVATE" as const, totalBeds: 323, latitude: 19.0596, longitude: 72.8295 },
    { name: "Fortis Bengaluru", registrationNumber: "KA-HOSP-001", state: "Karnataka", district: "Bengaluru", address: "154/9, Bannerghatta Road, Opp. IIM-B, Bengaluru 560076", contactNumber: "080-66214444", email: "info@fortis.in", type: "PRIVATE" as const, totalBeds: 400, latitude: 12.9081, longitude: 77.5940 },
  ]).returning();

  // ── Blood Banks ────────────────────────────────────────────────────────
  const [bank1, bank2] = await db.insert(bloodBanksTable).values([
    { name: "AIIMS Blood Bank", licenseNumber: "DL-BB-001", state: "Delhi", district: "New Delhi", address: "AIIMS Campus, New Delhi 110029", contactNumber: "011-26588888", email: "bloodbank@aiims.edu", latitude: 28.5672, longitude: 77.2101, isComponentFacility: true, is24x7: true },
    { name: "Mumbai Central Blood Bank", licenseNumber: "MH-BB-001", state: "Maharashtra", district: "Mumbai", address: "Gandhi Hospital Rd, Agripada, Mumbai 400011", contactNumber: "022-23001234", email: "mcbb@maharashtra.gov.in", latitude: 18.9696, longitude: 72.8194, isComponentFacility: false, is24x7: true },
    { name: "Red Cross Bengaluru", licenseNumber: "KA-BB-001", state: "Karnataka", district: "Bengaluru", address: "1, Palace Road, Bengaluru 560001", contactNumber: "080-22281222", email: "bb@redcross.ka.in", latitude: 12.9820, longitude: 77.5921, isComponentFacility: true, is24x7: false },
  ]).returning();

  // ── Laboratories ───────────────────────────────────────────────────────
  await db.insert(laboratoriesTable).values([
    { name: "AIIMS Pathology Lab", licenseNumber: "DL-LAB-001", state: "Delhi", district: "New Delhi", address: "AIIMS Campus, New Delhi", contactNumber: "011-26588600", email: "path@aiims.edu" },
    { name: "SRL Diagnostics Mumbai", licenseNumber: "MH-LAB-001", state: "Maharashtra", district: "Mumbai", address: "Plot No 29, Bandra Kurla Complex, Mumbai 400070", contactNumber: "022-42034203", email: "mumbai@srl.in" },
  ]).returning();

  // ── Ambulances ─────────────────────────────────────────────────────────
  await db.insert(ambulancesTable).values([
    { vehicleNumber: "DL01AB1234", state: "Delhi",       district: "New Delhi", contactNumber: "9911001234", type: "ADVANCED"       as const, driverName: "Suresh Kumar",  status: "AVAILABLE"  as const, latitude: 28.5671, longitude: 77.2099 },
    { vehicleNumber: "MH02CD5678", state: "Maharashtra", district: "Mumbai",    contactNumber: "9922002345", type: "BLOOD_TRANSPORT" as const, driverName: "Ravi Patil",    status: "DISPATCHED" as const, latitude: 19.0598, longitude: 72.8298 },
    { vehicleNumber: "KA03EF9012", state: "Karnataka",   district: "Bengaluru", contactNumber: "9933003456", type: "MOBILE_ICU"      as const, driverName: "Mohan Gowda",  status: "AVAILABLE"  as const, latitude: 12.9082, longitude: 77.5942 },
  ]).returning();

  // ── Donors ─────────────────────────────────────────────────────────────
  const [donor1, donor2] = await db.insert(donorsTable).values([
    { userId: donorUser1.id, bloodGroup: "O+" as const, dateOfBirth: "1990-06-15", gender: "MALE" as const, weight: 72, height: 175, abhaId: "ABHA-1234-5678-9012", address: "14, Linking Road, Bandra West", state: "Maharashtra", district: "Mumbai",    donationCount: 7,  lastDonationDate: "2025-12-01", eligibilityStatus: true,  livesImpacted: 21, rewardPoints: 350, healthCredits: 700 },
    { userId: donorUser2.id, bloodGroup: "A+" as const, dateOfBirth: "1995-03-22", gender: "FEMALE" as const, weight: 56, height: 162, abhaId: "ABHA-9876-5432-1098", address: "22, Anna Nagar, Chennai",         state: "Tamil Nadu",  district: "Chennai",   donationCount: 3,  lastDonationDate: "2026-02-15", eligibilityStatus: false, livesImpacted: 9,  rewardPoints: 150, healthCredits: 300 },
  ]).returning();

  // ── Wallets ────────────────────────────────────────────────────────────
  await db.insert(walletsTable).values([
    { userId: adminUser.id,   bloodCredits: 0,    donationCredits: 0,   emergencyCredits: 50,  familyProtected: false },
    { userId: donorUser1.id,  bloodCredits: 7.0,  donationCredits: 14.0, emergencyCredits: 3.0, familyProtected: true  },
    { userId: donorUser2.id,  bloodCredits: 3.0,  donationCredits: 6.0,  emergencyCredits: 1.0, familyProtected: false },
    { userId: patientUser.id, bloodCredits: 0,    donationCredits: 0,   emergencyCredits: 2.0, familyProtected: false },
  ]).onConflictDoNothing();

  // ── Donation History ───────────────────────────────────────────────────
  await db.insert(donationHistoryTable).values([
    { donorId: donor1!.id, bloodBankId: bank1!.id, bloodGroup: "O+" as const, units: 1, donatedAt: new Date("2025-12-01"), impactMessage: "Your O+ blood saved 3 lives in road accident emergency." },
    { donorId: donor1!.id, bloodBankId: bank1!.id, bloodGroup: "O+" as const, units: 1, donatedAt: new Date("2025-08-15"), impactMessage: "Blood used in cardiac surgery at AIIMS." },
    { donorId: donor2!.id, bloodBankId: bank2!.id, bloodGroup: "A+" as const, units: 1, donatedAt: new Date("2026-02-15"), impactMessage: "Your donation helped a child with thalassemia." },
  ]);

  // ── Patient ────────────────────────────────────────────────────────────
  const [patient1] = await db.insert(patientsTable).values([
    { userId: patientUser.id, bloodGroup: "B+" as const, dateOfBirth: "1985-09-10", gender: "MALE" as const, weight: 68, abhaId: "ABHA-2345-6789-0123", state: "Karnataka", district: "Bengaluru", medicalNotes: "Thalassemia major, requires regular transfusions" },
  ]).returning();

  // ── Inventory ──────────────────────────────────────────────────────────
  const today = new Date().toISOString().split("T")[0]!;
  const expiry = new Date(Date.now() + 35 * 86400000).toISOString().split("T")[0]!;
  const expiry2 = new Date(Date.now() + 20 * 86400000).toISOString().split("T")[0]!;
  // We need the third bank ID — query it
  const allBanks = await db.select().from(bloodBanksTable);
  const bank3Id = allBanks[2]?.id ?? bank2!.id;
  await db.insert(bloodInventoryTable).values([
    { bloodBankId: bank1!.id, bloodGroup: "O+" as const, units: 45, collectionDate: today, expiryDate: expiry,  status: "AVAILABLE" as const },
    { bloodBankId: bank1!.id, bloodGroup: "O-" as const, units: 8,  collectionDate: today, expiryDate: expiry,  status: "AVAILABLE" as const },
    { bloodBankId: bank1!.id, bloodGroup: "A+" as const, units: 30, collectionDate: today, expiryDate: expiry,  status: "AVAILABLE" as const },
    { bloodBankId: bank1!.id, bloodGroup: "B+" as const, units: 3,  collectionDate: today, expiryDate: expiry2, status: "AVAILABLE" as const },
    { bloodBankId: bank1!.id, bloodGroup: "AB+"as const, units: 12, collectionDate: today, expiryDate: expiry,  status: "AVAILABLE" as const },
    { bloodBankId: bank2!.id, bloodGroup: "O+" as const, units: 55, collectionDate: today, expiryDate: expiry,  status: "AVAILABLE" as const },
    { bloodBankId: bank2!.id, bloodGroup: "A-" as const, units: 4,  collectionDate: today, expiryDate: expiry2, status: "AVAILABLE" as const },
    { bloodBankId: bank2!.id, bloodGroup: "B-" as const, units: 2,  collectionDate: today, expiryDate: expiry2, status: "AVAILABLE" as const },
    { bloodBankId: bank3Id,   bloodGroup: "AB-"as const, units: 1,  collectionDate: today, expiryDate: expiry2, status: "AVAILABLE" as const },
    { bloodBankId: bank3Id,   bloodGroup: "O+" as const, units: 28, collectionDate: today, expiryDate: expiry,  status: "AVAILABLE" as const },
  ]);

  // ── Blood Unit + Timeline ──────────────────────────────────────────────
  const [unit1] = await db.insert(bloodUnitsTable).values([
    { unitCode: "BU-2024-001-A", bloodGroup: "O+" as const, donorId: donor1!.id, collectionDate: today, expiryDate: expiry, status: "STORAGE" as const, currentLocation: "AIIMS Blood Bank Cold Room 3", bloodBankId: bank1!.id },
  ]).returning();
  await db.insert(bloodUnitTimelineTable).values([
    { bloodUnitId: unit1!.id, status: "DONATED",        location: "AIIMS Blood Donation Camp",      notes: "Voluntary donation, donor health check passed" },
    { bloodUnitId: unit1!.id, status: "COLLECTED",      location: "AIIMS Blood Bank Reception",     notes: "Sample collected and labelled" },
    { bloodUnitId: unit1!.id, status: "TESTING",        location: "AIIMS Pathology Lab",            notes: "HIV, HBV, HCV, Syphilis, Malaria tests initiated" },
    { bloodUnitId: unit1!.id, status: "LAB_VALIDATION", location: "AIIMS Pathology Lab",            notes: "All tests negative — blood cleared for storage" },
    { bloodUnitId: unit1!.id, status: "STORAGE",        location: "AIIMS Blood Bank Cold Room 3",   notes: "Stored at 4°C, shelf life 42 days" },
  ]);

  // ── Blood Request ──────────────────────────────────────────────────────
  await db.insert(bloodRequestsTable).values([
    { bloodGroup: "B+" as const, units: 2, urgency: "URGENT" as const, status: "PENDING" as const, patientId: patient1!.id, hospitalId: hospital1!.id, requiredBy: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0]!, notes: "Pre-op transfusion required for thalassemia patient" },
    { bloodGroup: "O+" as const, units: 4, urgency: "EMERGENCY" as const, status: "APPROVED" as const, patientId: patient1!.id, hospitalId: hospital2!.id, bloodBankId: bank2!.id, notes: "Trauma patient — road accident" },
  ]);

  // ── Emergency SOS ──────────────────────────────────────────────────────
  await db.insert(emergencySosTable).values([
    { sosCode: "SOS-2024-001-RED", patientName: "Ankit Tiwari",  bloodGroup: "O-" as const, unitsRequired: 3, status: "ACTIVE" as const, hospitalId: hospital1!.id, contactNumber: "9876543200", patientAge: 28, medicalCondition: "Severe road traffic accident — internal bleeding", latitude: 28.5672, longitude: 77.2100 },
    { sosCode: "SOS-2024-002-RED", patientName: "Meena Kumari",  bloodGroup: "B+" as const, unitsRequired: 2, status: "DISPATCHED" as const, hospitalId: hospital2!.id, contactNumber: "9876543201", patientAge: 45, medicalCondition: "Post-cardiac surgery transfusion", latitude: 19.0596, longitude: 72.8295 },
    { sosCode: "SOS-2024-003-YEL", patientName: "Suresh Reddy",  bloodGroup: "A+" as const, unitsRequired: 1, status: "FULFILLED" as const, hospitalId: hospital2!.id, contactNumber: "9876543202", patientAge: 62, medicalCondition: "Pre-op blood requirement", latitude: 19.0600, longitude: 72.8300, resolvedAt: new Date() },
  ]);

  // ── Notifications ──────────────────────────────────────────────────────
  await db.insert(notificationsTable).values([
    { userId: donorUser1.id, type: "ELIGIBILITY_RESTORED" as const, title: "You Are Eligible to Donate!", message: "90 days have passed since your last donation. You can now donate again and save more lives.", isRead: false, actionUrl: "/donor/donate" },
    { userId: donorUser1.id, type: "IMPACT_UPDATE" as const, title: "Your Blood Saved 3 Lives", message: "The O+ blood you donated on Dec 1, 2025 was used in an emergency surgery — 3 patients are recovering.", isRead: true },
    { userId: adminUser.id, type: "EMERGENCY_SOS" as const, title: "CRITICAL: O- Blood Shortage", message: "Delhi NCR region has only 8 units of O- remaining. Immediate donor outreach required.", isRead: false, actionUrl: "/inventory/search?bloodGroup=O-" },
  ]);

  // ── Audit Logs ─────────────────────────────────────────────────────────
  await db.insert(auditLogsTable).values([
    { action: "SEED_INITIATED", userId: adminUser.id, resourceType: "system", metadata: { version: "1.0.0" } },
    { action: "BLOOD_BANK_ADDED", userId: adminUser.id, resourceType: "blood_bank", resourceId: bank1!.id },
    { action: "SOS_CREATED", userId: adminUser.id, resourceType: "emergency", resourceId: 1 },
  ]);

  console.log("Database seeded successfully.");
}

seed().catch(e => { console.error(e); process.exit(1); });
