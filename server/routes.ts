import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertMeditationSchema, insertFeedbackSchema } from "@shared/schema";
import { createClient } from "@supabase/supabase-js";

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  throw new Error("Missing Supabase credentials");
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

function getPublicUrl(fileName: string): string {
  const { data } = supabase.storage
    .from('lydfiler-til-nsdr')
    .getPublicUrl(fileName);
  return data.publicUrl;
}

// Function to derive title from filename
function deriveTitleFromFilename(fileName: string): string {
  // Remove file extension
  const nameWithoutExt = fileName.split('.').slice(0, -1).join('.');
  // Replace hyphens and underscores with spaces
  const nameWithSpaces = nameWithoutExt.replace(/[-_]/g, ' ');
  // Capitalize first letter of each word
  return nameWithSpaces
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Admin check middleware
  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).send("Admin access required");
    }
    next();
  };

  // Add feedback endpoint
  app.post("/api/feedback", async (req, res) => {
    try {
      const validation = insertFeedbackSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json(validation.error);
      }

      const feedback = await storage.createFeedback({
        ...validation.data,
        userId: req.isAuthenticated() ? req.user.id : undefined,
      });

      res.status(201).json(feedback);
    } catch (error) {
      res.status(500).json({ error: "Failed to save feedback" });
    }
  });

  // Public routes - No authentication required
  app.get("/api/meditations", async (_req, res) => {
    try {
      const meditations = await storage.getMeditations();
      res.json(meditations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch meditations" });
    }
  });

  app.get("/api/meditations/:id", async (req, res) => {
    try {
      const meditation = await storage.getMeditation(parseInt(req.params.id));
      if (!meditation) {
        return res.status(404).json({ error: "Meditation not found" });
      }
      res.json(meditation);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch meditation" });
    }
  });

  // Protected admin routes
  app.use(["/api/upload-url", "/api/meditations"], (req, res, next) => {
    if (req.method === "GET") return next();
    if (!req.isAuthenticated()) return res.sendStatus(401);
    next();
  });

  // Admin only routes
  app.post("/api/meditations", requireAdmin, async (req, res) => {
    try {
      const validation = insertMeditationSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json(validation.error);
      }

      // Derive title from filename if not provided
      const meditationData = {
        ...validation.data,
        title: validation.data.title || deriveTitleFromFilename(validation.data.fileName),
        fileUrl: getPublicUrl(validation.data.fileName)
      };
      const meditation = await storage.createMeditation(meditationData);
      res.status(201).json(meditation);
    } catch (error) {
      res.status(500).json({ error: "Failed to create meditation" });
    }
  });

  app.delete("/api/meditations/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteMeditation(id);
      res.sendStatus(200);
    } catch (error) {
      res.status(500).json({ error: "Failed to delete meditation" });
    }
  });

  app.get("/api/upload-url", requireAdmin, async (req, res) => {
    try {
      const fileName = req.query.fileName as string;
      if (!fileName) {
        return res.status(400).json({ error: "fileName is required" });
      }

      const { data, error } = await supabase.storage
        .from('lydfiler-til-nsdr')
        .createSignedUploadUrl(fileName);

      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}