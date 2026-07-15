import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * India Administrative Hierarchy
 * India → State → District → Block → Village/Town
 *
 * This table captures every administrative unit down to the Block level,
 * enabling future scaling to every district and block in India.
 */

export const statesTable = pgTable("states", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),       // e.g. "MH", "DL"
  name: text("name").notNull(),                 // e.g. "Maharashtra"
  capital: text("capital"),
  population: integer("population"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const districtsTable = pgTable("districts", {
  id: serial("id").primaryKey(),
  stateId: integer("state_id").notNull().references(() => statesTable.id),
  stateCode: text("state_code").notNull(),
  code: text("code").notNull().unique(),       // e.g. "MH-MUM"
  name: text("name").notNull(),                // e.g. "Mumbai"
  headquarters: text("headquarters"),
  population: integer("population"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const blocksTable = pgTable("blocks", {
  id: serial("id").primaryKey(),
  districtId: integer("district_id").notNull().references(() => districtsTable.id),
  districtCode: text("district_code").notNull(),
  stateCode: text("state_code").notNull(),
  code: text("code").notNull().unique(),        // e.g. "MH-MUM-BLK-001"
  name: text("name").notNull(),                 // e.g. "Andheri"
  population: integer("population"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertStateSchema = createInsertSchema(statesTable).omit({ id: true, createdAt: true });
export const insertDistrictSchema = createInsertSchema(districtsTable).omit({ id: true, createdAt: true });
export const insertBlockSchema = createInsertSchema(blocksTable).omit({ id: true, createdAt: true });

export type State = typeof statesTable.$inferSelect;
export type District = typeof districtsTable.$inferSelect;
export type Block = typeof blocksTable.$inferSelect;
