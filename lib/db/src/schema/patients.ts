import { pgTable, serial, integer, text, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { bloodGroupEnum, genderEnum } from "./donors";

export const patientsTable = pgTable("patients", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  bloodGroup: bloodGroupEnum("blood_group").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  gender: genderEnum("gender").notNull(),
  weight: real("weight"),
  height: real("height"),
  abhaId: text("abha_id"),
  medicalNotes: text("medical_notes"),
  address: text("address"),
  state: text("state"),
  district: text("district"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertPatientSchema = createInsertSchema(patientsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Patient = typeof patientsTable.$inferSelect;
