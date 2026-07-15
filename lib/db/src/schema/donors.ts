import { pgTable, serial, integer, text, boolean, timestamp, real, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const bloodGroupEnum = pgEnum("blood_group", ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]);
export const genderEnum = pgEnum("gender", ["MALE", "FEMALE", "OTHER"]);

export const donorsTable = pgTable("donors", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  bloodGroup: bloodGroupEnum("blood_group").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  gender: genderEnum("gender").notNull(),
  weight: real("weight").notNull(),
  height: real("height").notNull(),
  abhaId: text("abha_id"),
  address: text("address"),
  state: text("state"),
  district: text("district"),
  photo: text("photo"),
  donationCount: integer("donation_count").notNull().default(0),
  lastDonationDate: text("last_donation_date"),
  eligibilityStatus: boolean("eligibility_status").notNull().default(true),
  livesImpacted: integer("lives_impacted").notNull().default(0),
  rewardPoints: integer("reward_points").notNull().default(0),
  healthCredits: integer("health_credits").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const donationHistoryTable = pgTable("donation_history", {
  id: serial("id").primaryKey(),
  donorId: integer("donor_id").notNull().references(() => donorsTable.id),
  bloodBankId: integer("blood_bank_id"),
  bloodGroup: bloodGroupEnum("blood_group").notNull(),
  units: real("units").notNull().default(1),
  donatedAt: timestamp("donated_at").notNull().defaultNow(),
  certificateUrl: text("certificate_url"),
  impactMessage: text("impact_message"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDonorSchema = createInsertSchema(donorsTable).omit({ id: true, createdAt: true, updatedAt: true, donationCount: true, livesImpacted: true, rewardPoints: true, healthCredits: true });
export type InsertDonor = z.infer<typeof insertDonorSchema>;
export type Donor = typeof donorsTable.$inferSelect;
export type DonationHistory = typeof donationHistoryTable.$inferSelect;
