import { eq, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { InsertChatMessage, InsertUser, chatMessages, userProfiles, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;
let _client: postgres.Sql | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      // Supabase connection string logic
      _client = postgres(process.env.DATABASE_URL, { prepare: false });
      _db = drizzle(_client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      // @ts-ignore dynamic assignment
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.

/**
 * Get user by email for login authentication
 */
export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Create or update user session on login
 */
export async function loginUser(email: string, name?: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot login user: database not available");
    return undefined;
  }

  try {
    const openId = `local_${email}`;
    
    await db.insert(users).values({
      openId,
      email,
      name: name || email.split('@')[0],
      loginMethod: 'email',
      lastSignedIn: new Date(),
    }).onConflictDoUpdate({
      target: users.openId,
      set: {
        lastSignedIn: new Date(),
      },
    });

    return await getUserByEmail(email);
  } catch (error) {
    console.error("[Database] Failed to login user:", error);
    return undefined;
  }
}

/**
 * Get full student profile by userId
 */
export async function getStudentProfile(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Save a message to the chat history
 */
export async function saveChatMessage(userId: number, sender: "user" | "assistant", message: string) {
  const db = await getDb();
  if (!db) return;

  try {
    await db.insert(chatMessages).values({
      userId,
      sender,
      message,
    });
  } catch (error) {
    console.error("[Database] Failed to save chat message:", error);
  }
}

/**
 * Get aggregate statistics for the landing page
 */
export async function getGlobalStats() {
  const db = await getDb();
  if (!db) return { totalStudents: 0, totalMessages: 0 };

  try {
    const [userCount] = await db.select({ value: count() }).from(users);
    const [messageCount] = await db.select({ value: count() }).from(chatMessages);

    return {
      totalStudents: Number(userCount?.value ?? 0),
      totalMessages: Number(messageCount?.value ?? 0),
    };
  } catch (error) {
    console.error("[Database] Failed to fetch global stats:", error);
    return { totalStudents: 0, totalMessages: 0 };
  }
}
