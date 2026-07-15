import { pgTable, serial, integer, text, timestamp, real, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { bloodGroupEnum } from "./donors";

export const inventoryStatusEnum = pgEnum("inventory_status", ["AVAILABLE", "RESERVED", "DISPATCHED", "EXPIRED", "DISCARDED"]);
export const bloodUnitStatusEnum = pgEnum("blood_unit_status", [
  "DONATED", "COLLECTED", "TESTING", "LAB_VALIDATION", "STORAGE",
  "RESERVED", "DISPATCHED", "IN_TRANSIT", "AT_HOSPITAL", "TRANSFUSED", "EXPIRED", "DISCARDED"
]);
export const requestUrgencyEnum = pgEnum("request_urgency", ["ROUTINE", "URGENT", "EMERGENCY"]);
export const requestStatusEnum = pgEnum("request_status", ["PENDING", "APPROVED", "FULFILLED", "PARTIALLY_FULFILLED", "CANCELLED", "REJECTED"]);
export const labTestTypeEnum = pgEnum("lab_test_type", ["HIV", "HBV", "HCV", "SYPHILIS", "MALARIA", "BLOOD_GROUP_CONFIRM", "CROSSMATCH"]);
export const labTestResultEnum = pgEnum("lab_test_result", ["POSITIVE", "NEGATIVE", "INCONCLUSIVE"]);

export const bloodInventoryTable = pgTable("blood_inventory", {
  id: serial("id").primaryKey(),
  bloodBankId: integer("blood_bank_id").notNull(),
  bloodGroup: bloodGroupEnum("blood_group").notNull(),
  units: real("units").notNull().default(0),
  collectionDate: text("collection_date").notNull(),
  expiryDate: text("expiry_date").notNull(),
  status: inventoryStatusEnum("status").notNull().default("AVAILABLE"),
  donorId: integer("donor_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const bloodUnitsTable = pgTable("blood_units", {
  id: serial("id").primaryKey(),
  unitCode: text("unit_code").notNull().unique(),
  qrCode: text("qr_code"),                          // QR payload (URL or JSON)
  bloodGroup: bloodGroupEnum("blood_group").notNull(),
  donorId: integer("donor_id").notNull(),
  collectionDate: text("collection_date").notNull(),
  expiryDate: text("expiry_date").notNull(),
  status: bloodUnitStatusEnum("status").notNull().default("DONATED"),
  currentLocation: text("current_location"),
  bloodBankId: integer("blood_bank_id"),
  labVerificationStatus: text("lab_verification_status").default("PENDING"), // PENDING | VERIFIED | REJECTED
  hospitalId: integer("hospital_id"),
  patientId: integer("patient_id"),                 // final usage reference
  dispatchedAt: text("dispatched_at"),
  receivedAt: text("received_at"),
  transfusedAt: text("transfused_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const bloodUnitTimelineTable = pgTable("blood_unit_timeline", {
  id: serial("id").primaryKey(),
  bloodUnitId: integer("blood_unit_id").notNull(),
  status: text("status").notNull(),
  location: text("location").notNull().default("Unknown"),
  notes: text("notes"),
  updatedBy: text("updated_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const bloodRequestsTable = pgTable("blood_requests", {
  id: serial("id").primaryKey(),
  bloodGroup: bloodGroupEnum("blood_group").notNull(),
  units: real("units").notNull(),
  urgency: requestUrgencyEnum("urgency").notNull().default("ROUTINE"),
  status: requestStatusEnum("status").notNull().default("PENDING"),
  patientId: integer("patient_id").notNull(),
  hospitalId: integer("hospital_id").notNull(),
  bloodBankId: integer("blood_bank_id"),
  requiredBy: text("required_by"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const labTestsTable = pgTable("lab_tests", {
  id: serial("id").primaryKey(),
  laboratoryId: integer("laboratory_id").notNull(),
  bloodUnitId: integer("blood_unit_id").notNull(),
  testType: labTestTypeEnum("test_type").notNull(),
  result: labTestResultEnum("result").notNull(),
  notes: text("notes"),
  testedBy: text("tested_by"),
  testedAt: timestamp("tested_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBloodInventorySchema = createInsertSchema(bloodInventoryTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBloodUnitSchema = createInsertSchema(bloodUnitsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBloodRequestSchema = createInsertSchema(bloodRequestsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertLabTestSchema = createInsertSchema(labTestsTable).omit({ id: true, createdAt: true });

export type BloodInventory = typeof bloodInventoryTable.$inferSelect;
export type BloodUnit = typeof bloodUnitsTable.$inferSelect;
export type BloodUnitTimeline = typeof bloodUnitTimelineTable.$inferSelect;
export type BloodRequest = typeof bloodRequestsTable.$inferSelect;
export type LabTest = typeof labTestsTable.$inferSelect;
