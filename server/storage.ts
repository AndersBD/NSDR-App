import { User, InsertUser, Meditation, InsertMeditation, Feedback, InsertFeedback } from "@shared/schema";
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
  createUser(user: InsertUser): Promise<User>;

  getMeditations(): Promise<Meditation[]>;
  getMeditation(id: number): Promise<Meditation | undefined>;
  createMeditation(meditation: InsertMeditation): Promise<Meditation>;
  deleteMeditation(id: number): Promise<void>;

  createFeedback(feedback: InsertFeedback & { userId: number }): Promise<Feedback>;

  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private meditations: Map<number, Meditation>;
  private feedback: Map<number, Feedback>;
  private currentUserId: number;
  private currentMeditationId: number;
  private currentFeedbackId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.meditations = new Map();
    this.feedback = new Map();
    this.currentUserId = 1;
    this.currentMeditationId = 1;
    this.currentFeedbackId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });

    // Create default admin user
    this.createDefaultAdmin();
  }

  private async createDefaultAdmin() {
    const adminUser: InsertUser = {
      username: "admin",
      password: await hashPassword("admin"), // Default password: admin
    };
    const user = await this.createUser(adminUser, true);
    console.log("Created default admin user:", user.username);

    // Add sample meditation sessions
    const sampleMeditations: InsertMeditation[] = [
      // 10 minute sessions
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
      },
    ];

    // Create sample meditations
    for (const meditation of sampleMeditations) {
      await this.createMeditation(meditation);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser, isAdmin = false): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, isAdmin };
    this.users.set(id, user);
    return user;
  }

  async getMeditations(): Promise<Meditation[]> {
    return Array.from(this.meditations.values());
  }

  async getMeditation(id: number): Promise<Meditation | undefined> {
    return this.meditations.get(id);
  }

  async createMeditation(meditation: InsertMeditation): Promise<Meditation> {
    const id = this.currentMeditationId++;
    const newMeditation: Meditation = {
      ...meditation,
      id,
      createdAt: new Date(),
    };
    this.meditations.set(id, newMeditation);
    return newMeditation;
  }

  async deleteMeditation(id: number): Promise<void> {
    this.meditations.delete(id);
  }

  async createFeedback(feedback: InsertFeedback & { userId: number }): Promise<Feedback> {
    const id = this.currentFeedbackId++;
    const newFeedback: Feedback = {
      ...feedback,
      id,
      createdAt: new Date(),
    };
    this.feedback.set(id, newFeedback);
    return newFeedback;
  }
}

export const storage = new MemStorage();