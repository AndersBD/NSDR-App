import { User, InsertUser, Meditation, InsertMeditation, Feedback, InsertFeedback } from "@shared/schema";
import { db, users, meditations, feedback } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import createMemoryStore from "memorystore";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const MemoryStore = createMemoryStore(session);
const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser, isAdmin?: boolean): Promise<User>;

  getMeditations(): Promise<Meditation[]>;
  getMeditation(id: number): Promise<Meditation | undefined>;
  createMeditation(meditation: InsertMeditation): Promise<Meditation>;
  deleteMeditation(id: number): Promise<void>;

  createFeedback(feedback: InsertFeedback & { userId: number }): Promise<Feedback>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    this.createDefaultAdmin();
  }

  private async createDefaultAdmin() {
    const existingAdmin = await this.getUserByUsername("admin");
    if (existingAdmin) return;

    const adminUser: InsertUser = {
      username: "admin",
      password: await hashPassword("admin"),
    };
    const user = await this.createUser(adminUser, true);
    console.log("Created default admin user:", user.username);

    // Add sample meditation sessions
    const sampleMeditations: InsertMeditation[] = [
      {
        title: "Hurtigt energiboost",
        duration: 600, // 10 minutes in seconds
        fileName: "10 minutes.mp3",
        fileUrl: "https://fnhfpyqwzugmljhgxlfd.supabase.co/storage/v1/object/public/lydfiler-til-nsdr/10%20minutes.mp3"
      },
      {
        title: "Klarhed og fokus",
        duration: 600,
        fileName: "10 minutes.mp3",
        fileUrl: "https://fnhfpyqwzugmljhgxlfd.supabase.co/storage/v1/object/public/lydfiler-til-nsdr/10%20minutes.mp3"
      },
      {
        title: "Mini mental genstart",
        duration: 600,
        fileName: "10 minutes.mp3",
        fileUrl: "https://fnhfpyqwzugmljhgxlfd.supabase.co/storage/v1/object/public/lydfiler-til-nsdr/10%20minutes.mp3"
      }
    ];

    // Create sample meditations
    for (const meditation of sampleMeditations) {
      await this.createMeditation(meditation);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return user;
  }

  async createUser(insertUser: InsertUser, isAdmin = false): Promise<User> {
    const [user] = await db.insert(users).values({ ...insertUser, isAdmin }).returning();
    return user;
  }

  async getMeditations(): Promise<Meditation[]> {
    return await db.select().from(meditations);
  }

  async getMeditation(id: number): Promise<Meditation | undefined> {
    const [meditation] = await db.select().from(meditations).where(eq(meditations.id, id)).limit(1);
    return meditation;
  }

  async createMeditation(meditation: InsertMeditation): Promise<Meditation> {
    const [newMeditation] = await db.insert(meditations).values(meditation).returning();
    return newMeditation;
  }

  async deleteMeditation(id: number): Promise<void> {
    await db.delete(meditations).where(eq(meditations.id, id));
  }

  async createFeedback(feedback: InsertFeedback & { userId: number }): Promise<Feedback> {
    const [newFeedback] = await db.insert(feedback).values(feedback).returning();
    return newFeedback;
  }
}

export const storage = new DatabaseStorage();