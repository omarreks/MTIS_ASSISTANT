/**
 * Database Seeder — Egyptian Students
 *
 * Reads `egyptian_students_complete_final.xlsx` from the project root
 * and bulk-inserts all student records into the `users` and `userProfiles`
 * tables using safe UPSERT logic (safe to run multiple times).
 *
 * Usage (from project root):
 *   pnpm run db:seed
 */

import "dotenv/config";
import * as XLSX from "xlsx";
import * as fs from "fs";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import { resolve } from "path";
import { users, userProfiles } from "../../drizzle/schema";

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Resolve the Excel file path relative to the project root */
const EXCEL_PATH = resolve(process.cwd(), "egyptian_students_complete_final.xlsx");

/** Read DATABASE_URL from environment */
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL is not set. Add it to your .env file and retry.");
  process.exit(1);
}

// ── Row type matching the spreadsheet columns ─────────────────────────────────

interface StudentRow {
  Username: string;
  Gender: string;
  "National ID": string | number;
  "Academic Email": string;
  "Academic Year": string | number;
  GPA: number | string;
  "Passed Subjects": number | string;
  Governorate: string;
}

// ── GPA → Tier mapping ────────────────────────────────────────────────────────

function getTier(gpa: number): "bronze" | "silver" | "gold" | "platinum" {
  if (gpa >= 3.7) return "platinum";
  if (gpa >= 3.0) return "gold";
  if (gpa >= 2.0) return "silver";
  return "bronze";
}

function getTierProgress(gpa: number): number {
  if (gpa >= 3.7) return 100;
  if (gpa >= 3.0) return Math.round(((gpa - 3.0) / 0.7) * 100);
  if (gpa >= 2.0) return Math.round(((gpa - 2.0) / 1.0) * 100);
  return Math.round((gpa / 2.0) * 100);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function seed() {
  console.log("📂 Reading Excel file:", EXCEL_PATH);

  let workbook: XLSX.WorkBook;
  try {
    const fileBuffer = fs.readFileSync(EXCEL_PATH);
    workbook = XLSX.read(fileBuffer, { type: "buffer" });
  } catch (err: any) {
    console.error(`❌ Could not open the Excel file at:\n   ${EXCEL_PATH}`);
    console.error(`   Error details:`, err);
    console.error("   Make sure you placed it in the project root folder.");
    process.exit(1);
  }

  // Take the first sheet regardless of its name
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<StudentRow>(sheet, { defval: "" });

  console.log(`📊 Found ${rows.length} student records in sheet: "${sheetName}"`);

  if (rows.length === 0) {
    console.warn("⚠️  No data rows found. Check that the Excel file has headers in row 1.");
    process.exit(0);
  }

  // Connect to database
  const client = postgres(DATABASE_URL!, { prepare: false });
  const db = drizzle(client);

  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (const [index, row] of rows.entries()) {
    // ── Validate required fields ──────────────────────────
    const email = String(row["Academic Email"] ?? "").trim().toLowerCase();
    const name = String(row["Username"] ?? "").trim();
    const nationalIdRaw = String(row["National ID"] ?? "").trim();

    if (!email || !email.includes("@")) {
      console.warn(`⚠️  Row ${index + 2}: Missing or invalid email — skipping.`);
      skipped++;
      continue;
    }

    if (!nationalIdRaw) {
      console.warn(`⚠️  Row ${index + 2}: Missing National ID for ${email} — skipping.`);
      skipped++;
      continue;
    }

    // ── Normalise cell values ─────────────────────────────
    const gender = String(row["Gender"] ?? "").trim();
    const academicYear = String(row["Academic Year"] ?? "").trim();
    const gpaRaw = parseFloat(String(row["GPA"] ?? "0").replace(",", "."));
    const gpa = isNaN(gpaRaw) ? 0 : gpaRaw;
    const passedSubjectsRaw = parseInt(String(row["Passed Subjects"] ?? "0"), 10);
    const passedSubjects = isNaN(passedSubjectsRaw) ? 0 : passedSubjectsRaw;
    const governorate = String(row["Governorate"] ?? "").trim();

    const openId = `student_${email}`;
    const tier = getTier(gpa);
    const tierProgress = getTierProgress(gpa);

    try {
      // ── 1. Upsert into `users` ────────────────────────────
      await db
        .insert(users)
        .values({
          openId,
          name,
          email,
          loginMethod: "email",
          lastSignedIn: new Date(),
        })
        .onConflictDoUpdate({
          target: users.openId,
          set: {
            name,
            lastSignedIn: new Date(),
          },
        });

      // ── 2. Fetch the user's auto-generated `id` ───────────
      const [user] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.openId, openId))
        .limit(1);

      if (!user) {
        console.error(`❌ Row ${index + 2}: Could not retrieve user record after insert.`);
        errors++;
        continue;
      }

      // ── 3. Upsert into `userProfiles` ─────────────────────
      await db
        .insert(userProfiles)
        .values({
          userId: user.id,
          nationalId: nationalIdRaw,
          gender,
          academicYear,
          gpa,
          passedSubjects,
          governorate,
          tier,
          tierProgress,
        })
        .onConflictDoUpdate({
          target: userProfiles.nationalId,
          set: {
            gender,
            academicYear,
            gpa,
            passedSubjects,
            governorate,
            tier,
            tierProgress,
          },
        });

      inserted++;

      // Print a progress dot every 50 records
      if (inserted % 50 === 0) {
        process.stdout.write(`   ✅ ${inserted} records processed...\n`);
      }
    } catch (err) {
      console.error(`❌ Row ${index + 2} (${email}):`, err);
      errors++;
    }
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log("\n─────────────────────────────────────");
  console.log(`✅ Inserted / Updated : ${inserted}`);
  console.log(`⏭️  Skipped (bad data) : ${skipped}`);
  console.log(`❌ Errors             : ${errors}`);
  console.log("─────────────────────────────────────");
  console.log("🎉 Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("💥 Fatal error during seeding:", err);
  process.exit(1);
});
