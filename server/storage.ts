import { User, InsertUser, Meditation, InsertMeditation, Feedback, InsertFeedback } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { createClient } from "@supabase/supabase-js";

const MemoryStore = createMemoryStore(session);
const scryptAsync = promisify(scrypt);

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  throw new Error("Missing Supabase credentials");
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

function getPublicUrl(fileName: string, folder: string): string {
  const { data } = supabase.storage
    .from('lydfiler-til-nsdr')
    .getPublicUrl(`${folder}/${fileName}`);
  return data.publicUrl;
}

async function fetchAudioFiles() {
  const durations = ['10 minutter', '20 minutter', '30 minutter', '60 minutter'];
  let allFiles = [];

  for (const duration of durations) {
    const { data, error } = await supabase.storage
      .from('lydfiler-til-nsdr')
      .list(duration);

    if (error) {
      console.error(`Error fetching ${duration} files:`, error);
      continue;
    }

    const durationInMinutes = parseInt(duration.split(' ')[0]);
    const files = data.map(file => ({
      fileName: file.name,
      fileUrl: getPublicUrl(file.name, duration),
      duration: durationInMinutes * 60, // Convert minutes to seconds
      folder: duration
    }));

    allFiles = [...allFiles, ...files];
  }

  return allFiles;
}

// Store files in database for easy querying and relationships
async function syncAudioFilesToDatabase() {
  const audioFiles = await fetchAudioFiles();

  for (const file of audioFiles) {
    const meditation = {
      title: file.fileName.replace('.mp3', ''),
      duration: file.duration,
      fileName: `${file.folder}/${file.fileName}`,
      fileUrl: file.fileUrl,
    };

    await storage.createMeditation(meditation);
  }
}

// Update the IStorage interface
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getMeditations(): Promise<Meditation[]>;
  getMeditation(id: number): Promise<Meditation | undefined>;
  createMeditation(meditation: InsertMeditation): Promise<Meditation>;
  deleteMeditation(id: number): Promise<void>;

  createFeedback(feedback: Omit<InsertFeedback & { userId?: number }, "id">): Promise<Feedback>;

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

    // Create sample meditations from Supabase files
    await syncAudioFilesToDatabase();
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

  // Update the createFeedback implementation
  async createFeedback(feedback: Omit<InsertFeedback & { userId?: number }, "id">): Promise<Feedback> {
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

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export const storage = new MemStorage();