import { pgTable, serial, integer, text, timestamp, real, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { bloodGroupEnum } from "./donors";

export const emergencyStatusEnum = pgEnum("emergency_status", ["ACTIVE", "BROADCAST", "DISPATCHED", "FULFILLED", "RESOLVED", "CANCELLED"]);

export const emergencySosTable = pgTable("emergency_sos", {
  id: serial("id").primaryKey(),
  sosCode: text("sos_code").notNull().unique(),
  patientName: text("patient_name").notNull(),
  bloodGroup: bloodGroupEnum("blood_group").notNull(),
  unitsRequired: real("units_required").notNull(),
  status: emergencyStatusEnum("status").notNull().default("ACTIVE"),
  hospitalId: integer("hospital_id").notNull(),
  contactNumber: text("contact_number").notNull(),
  patientAge: integer("patient_age"),
  medicalCondition: text("medical_condition"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  ambulanceId: integer("ambulance_id"),
  bloodBankId: integer("blood_bank_id"),
  notes: text("notes"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertEmergencySchema = createInsertSchema(emergencySosTable).omit({ id: true, sosCode: true, createdAt: true, updatedAt: true, resolvedAt: true });
export type InsertEmergency = z.infer<typeof insertEmergencySchema>;
export type EmergencySos = typeof emergencySosTable.$inferSelect;
