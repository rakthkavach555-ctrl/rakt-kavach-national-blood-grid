import { pgTable, serial, text, boolean, timestamp, integer, real, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const hospitalTypeEnum = pgEnum("hospital_type", ["GOVERNMENT", "PRIVATE", "TRUST", "MILITARY"]);
export const ambulanceTypeEnum = pgEnum("ambulance_type", ["BASIC", "ADVANCED", "MOBILE_ICU", "BLOOD_TRANSPORT"]);
export const ambulanceStatusEnum = pgEnum("ambulance_status", ["AVAILABLE", "DISPATCHED", "IN_TRANSIT", "AT_SCENE", "RETURNING", "MAINTENANCE"]);
export const volunteerAvailabilityEnum = pgEnum("volunteer_availability", ["FULL_TIME", "PART_TIME", "EMERGENCY_ONLY", "WEEKENDS"]);

export const hospitalsTable = pgTable("hospitals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  registrationNumber: text("registration_number").notNull().unique(),
  state: text("state").notNull(),
  district: text("district").notNull(),
  address: text("address").notNull(),
  contactNumber: text("contact_number").notNull(),
  email: text("email"),
  type: hospitalTypeEnum("type").notNull().default("GOVERNMENT"),
  totalBeds: integer("total_beds"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const bloodBanksTable = pgTable("blood_banks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  licenseNumber: text("license_number").notNull().unique(),
  state: text("state").notNull(),
  district: text("district").notNull(),
  address: text("address").notNull(),
  contactNumber: text("contact_number").notNull(),
  email: text("email"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  isComponentFacility: boolean("is_component_facility").notNull().default(false),
  is24x7: boolean("is_24x7").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const laboratoriesTable = pgTable("laboratories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  licenseNumber: text("license_number").notNull().unique(),
  state: text("state").notNull(),
  district: text("district").notNull(),
  address: text("address").notNull(),
  contactNumber: text("contact_number").notNull(),
  email: text("email"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const ambulancesTable = pgTable("ambulances", {
  id: serial("id").primaryKey(),
  vehicleNumber: text("vehicle_number").notNull().unique(),
  state: text("state").notNull(),
  district: text("district").notNull(),
  contactNumber: text("contact_number").notNull(),
  type: ambulanceTypeEnum("type").notNull().default("BASIC"),
  driverName: text("driver_name"),
  status: ambulanceStatusEnum("status").notNull().default("AVAILABLE"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  emergencyId: integer("emergency_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const volunteersTable = pgTable("volunteers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  state: text("state").notNull(),
  district: text("district").notNull(),
  skills: text("skills").array().notNull().default([]),
  availability: volunteerAvailabilityEnum("availability"),
  isVerified: boolean("is_verified").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  totalEventsParticipated: integer("total_events_participated").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertHospitalSchema = createInsertSchema(hospitalsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBloodBankSchema = createInsertSchema(bloodBanksTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertLaboratorySchema = createInsertSchema(laboratoriesTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAmbulanceSchema = createInsertSchema(ambulancesTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertVolunteerSchema = createInsertSchema(volunteersTable).omit({ id: true, createdAt: true, updatedAt: true });

export type Hospital = typeof hospitalsTable.$inferSelect;
export type BloodBank = typeof bloodBanksTable.$inferSelect;
export type Laboratory = typeof laboratoriesTable.$inferSelect;
export type Ambulance = typeof ambulancesTable.$inferSelect;
export type Volunteer = typeof volunteersTable.$inferSelect;
