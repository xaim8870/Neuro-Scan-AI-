import { db } from "./db";
import {
  scans,
  type InsertScan,
  type Scan
} from "@shared/schema";
import { desc, eq } from "drizzle-orm";

export interface IStorage {
  getScans(): Promise<Scan[]>;
  getScan(id: number): Promise<Scan | undefined>;
  createScan(scan: InsertScan): Promise<Scan>;
}

export class DatabaseStorage implements IStorage {
  async getScans(): Promise<Scan[]> {
    return await db.select().from(scans).orderBy(desc(scans.createdAt)).limit(10);
  }

  async getScan(id: number): Promise<Scan | undefined> {
    const [scan] = await db.select().from(scans).where(eq(scans.id, id));
    return scan;
  }

  async createScan(insertScan: InsertScan): Promise<Scan> {
    const [scan] = await db.insert(scans).values(insertScan).returning();
    return scan;
  }
}

export const storage = new DatabaseStorage();
