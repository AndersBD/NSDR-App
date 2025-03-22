import { pgTable, text, serial, integer, boolean, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
});

export const meditations = pgTable("meditations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  duration: integer("duration").notNull(), // in seconds
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const feedback = pgTable("feedback", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: integer("user_id").references(() => users.id),
  meditationId: integer("meditation_id").references(() => meditations.id),
  wellbeingChange: integer("wellbeing_change").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertMeditationSchema = createInsertSchema(meditations).pick({
  title: true,
  duration: true,
  fileName: true,
  fileUrl: true,
});

export const insertFeedbackSchema = createInsertSchema(feedback)
  .pick({
    meditationId: true,
    wellbeingChange: true,
  })
  .extend({
    wellbeingChange: z.number().min(-2).max(2),
  });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Meditation = typeof meditations.$inferSelect;
export type InsertMeditation = z.infer<typeof insertMeditationSchema>;
export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
