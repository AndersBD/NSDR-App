import { User, InsertUser, Meditation, InsertMeditation, Feedback, InsertFeedback } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { users, meditations, feedback } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getMeditations(): Promise<Meditation[]>;
  getMeditation(id: number): Promise<Meditation | undefined>;
  createMeditation(meditation: InsertMeditation): Promise<Meditation>;
  deleteMeditation(id: number): Promise<void>;

  createFeedback(feedback: InsertFeedback & { userId: number }): Promise<Feedback>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getMeditations(): Promise<Meditation[]> {
    return await db.select().from(meditations);
  }

  async getMeditation(id: number): Promise<Meditation | undefined> {
    const [meditation] = await db.select().from(meditations).where(eq(meditations.id, id));
    return meditation;
  }

  async createMeditation(meditation: InsertMeditation): Promise<Meditation> {
    const [newMeditation] = await db.insert(meditations).values(meditation).returning();
    return newMeditation;
  }

  async deleteMeditation(id: number): Promise<void> {
    await db.delete(meditations).where(eq(meditations.id, id));
  }

  async createFeedback(data: InsertFeedback & { userId: number }): Promise<Feedback> {
    const [newFeedback] = await db.insert(feedback)
      .values({
        userId: data.userId,
        meditationId: data.meditationId,
        wellbeingChange: data.wellbeingChange,
      })
      .returning();
    return newFeedback;
  }
}

export const storage = new DatabaseStorage();