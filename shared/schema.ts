import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const scans = pgTable("scans", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  fileName: text("file_name").notNull(),
  diagnosis: text("diagnosis").notNull(), // e.g., "Meningioma", "Glioma", "Pituitary Tumor", "No Tumor"
  confidence: real("confidence").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertScanSchema = createInsertSchema(scans).omit({ 
  id: true, 
  createdAt: true 
});

export type Scan = typeof scans.$inferSelect;
export type InsertScan = z.infer<typeof insertScanSchema>;

export type AnalyzeResponse = Scan;
