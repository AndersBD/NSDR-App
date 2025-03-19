import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertMeditationSchema } from "@shared/schema";
import { createClient } from "@supabase/supabase-js";

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  throw new Error("Missing Supabase credentials");
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Admin check middleware
  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).send("Admin access required");
    }
    next();
  };

  // Public route - Get all meditations
  app.get("/api/meditations", async (_req, res) => {
    try {
      const meditations = await storage.getMeditations();
      res.json(meditations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch meditations" });
    }
  });

  // Protected routes below this point
  app.use(["/api/upload-url", "/api/meditations"], (req, res, next) => {
    if (req.method === "GET") return next();
    if (!req.isAuthenticated()) return res.sendStatus(401);
    next();
  });

  // Upload meditation file
  app.post("/api/meditations", requireAdmin, async (req, res) => {
    try {
      const validation = insertMeditationSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json(validation.error);
      }

      const meditation = await storage.createMeditation(validation.data);
      res.status(201).json(meditation);
    } catch (error) {
      res.status(500).json({ error: "Failed to create meditation" });
    }
  });

  // Delete meditation
  app.delete("/api/meditations/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteMeditation(id);
      res.sendStatus(200);
    } catch (error) {
      res.status(500).json({ error: "Failed to delete meditation" });
    }
  });

  // Get upload URL
  app.get("/api/upload-url", requireAdmin, async (req, res) => {
    try {
      const fileName = req.query.fileName as string;
      if (!fileName) {
        return res.status(400).json({ error: "fileName is required" });
      }

      const { data, error } = await supabase.storage
        .from('meditations')
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