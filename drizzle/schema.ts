import { integer, pgEnum, pgTable, text, timestamp, varchar, real } from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow.
 * Stores basic identity and login info for every student.
 */
export const roleEnum = pgEnum("role", ["user", "admin"]);

export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(), // Drizzle PG doesn't have .onUpdateNow() natively in the same way, handled via triggers or app logic
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Chat messages table — stores all conversations between users and AI assistant.
 */
export const senderEnum = pgEnum("sender", ["user", "assistant"]);

export const chatMessages = pgTable("chatMessages", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("userId").notNull(),
  sender: senderEnum("sender").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

/**
 * Student inquiries table — tracks academic questions and support requests.
 */
export const statusEnum = pgEnum("status", ["open", "in_progress", "resolved", "closed"]);
export const priorityEnum = pgEnum("priority", ["low", "medium", "high"]);

export const inquiries = pgTable("inquiries", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("userId").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  query: text("query").notNull(),
  status: statusEnum("status").default("open").notNull(),
  priority: priorityEnum("priority").default("medium").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  resolvedAt: timestamp("resolvedAt"),
});

export type Inquiry = typeof inquiries.$inferSelect;
export type InsertInquiry = typeof inquiries.$inferInsert;

/**
 * Daily metrics table — tracks engagement and performance metrics.
 */
export const metrics = pgTable("metrics", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  date: timestamp("date").defaultNow().notNull(),
  totalChats: integer("totalChats").default(0).notNull(),
  totalEmails: integer("totalEmails").default(0).notNull(),
  totalCalls: integer("totalCalls").default(0).notNull(),
  activeUsers: integer("activeUsers").default(0).notNull(),
  averageResponseTime: integer("averageResponseTime").default(0).notNull(), // in milliseconds
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Metric = typeof metrics.$inferSelect;
export type InsertMetric = typeof metrics.$inferInsert;

/**
 * User profiles table — extended student information sourced from the
 * university's Excel records.
 */
export const tierEnum = pgEnum("tier", ["bronze", "silver", "gold", "platinum"]);

export const userProfiles = pgTable("userProfiles", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("userId").notNull().unique(),

  // ── Fields from the Excel spreadsheet ──────────────────
  nationalId: varchar("nationalId", { length: 20 }).unique(),
  gender: varchar("gender", { length: 10 }),
  faculty: varchar("faculty", { length: 255 }),
  academicYear: varchar("academicYear", { length: 50 }),
  gpa: real("gpa"),
  passedSubjects: integer("passedSubjects"),
  governorate: varchar("governorate", { length: 100 }),
  studentId: varchar("studentId", { length: 100 }).unique(),

  // ── Tier / gamification ────────────────────────────────
  tier: tierEnum("tier").default("bronze").notNull(),
  tierProgress: integer("tierProgress").default(0).notNull(),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;