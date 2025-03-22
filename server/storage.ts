import { User, InsertUser, Meditation, InsertMeditation } from "@shared/schema";
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

  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private meditations: Map<number, Meditation>;
  private currentUserId: number;
  private currentMeditationId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.meditations = new Map();
    this.currentUserId = 1;
    this.currentMeditationId = 1;
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
        fileUrl: "https://fnhfpyqwzugmljhgxlfd.supabase.co/storage/v1/object/public/lydfiler-til-nsdr//10%20minutes.mp3"
      },
      {
        title: "Klarhed og fokus",
        duration: 600,
        fileName: "10 minutes.mp3",
        fileUrl: "https://fnhfpyqwzugmljhgxlfd.supabase.co/storage/v1/object/public/lydfiler-til-nsdr//10%20minutes.mp3"
      },
      {
        title: "Mini mental genstart",
        duration: 600,
        fileName: "10 minutes.mp3",
        fileUrl: "https://fnhfpyqwzugmljhgxlfd.supabase.co/storage/v1/object/public/lydfiler-til-nsdr//10%20minutes.mp3"
      },
      // 20 minute sessions
      {
        title: "Kreativ mental nulstilling",
        duration: 1200, // 20 minutes in seconds
        fileName: "20 minutes.mp3",
        fileUrl: "https://fnhfpyqwzugmljhgxlfd.supabase.co/storage/v1/object/public/lydfiler-til-nsdr//20%20minutes.mp3"
      },
      {
        title: "Stressreduktion",
        duration: 1200,
        fileName: "20 minutes.mp3",
        fileUrl: "https://fnhfpyqwzugmljhgxlfd.supabase.co/storage/v1/object/public/lydfiler-til-nsdr//20%20minutes.mp3"
      },
      {
        title: "Klar til eksamen",
        duration: 1200,
        fileName: "20 minutes.mp3",
        fileUrl: "https://fnhfpyqwzugmljhgxlfd.supabase.co/storage/v1/object/public/lydfiler-til-nsdr//20%20minutes.mp3"
      },
      // 30 minute sessions
      {
        title: "Forbedret søvnkvalitet",
        duration: 1800, // 30 minutes in seconds
        fileName: "sovn.mp3",
        fileUrl: "https://example.com/meditations/sovn.mp3"
      },
      {
        title: "Dyb restitution efter træning",
        duration: 1800,
        fileName: "traning.mp3",
        fileUrl: "https://example.com/meditations/traning.mp3"
      },
      {
        title: "Aften-afslapning",
        duration: 1800,
        fileName: "aften.mp3",
        fileUrl: "https://example.com/meditations/aften.mp3"
      },
      // 60 minute sessions
      {
        title: "Total mental genstart",
        duration: 3600, // 60 minutes in seconds
        fileName: "total.mp3",
        fileUrl: "https://example.com/meditations/total.mp3"
      },
      {
        title: "NSDR for optimal restitution",
        duration: 3600,
        fileName: "optimal.mp3",
        fileUrl: "https://example.com/meditations/optimal.mp3"
      },
      {
        title: "Intensiv mental restitution",
        duration: 3600,
        fileName: "intensiv.mp3",
        fileUrl: "https://example.com/meditations/intensiv.mp3"
      }
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
}

export const storage = new MemStorage();