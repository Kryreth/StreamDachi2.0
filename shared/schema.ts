// shared/schema.ts (SQLite version)
// Converts your original Postgres pg-core schema to SQLite sqlite-core
// Uses better-sqlite3 + drizzle-orm/sqlite-core
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { randomUUID } from "node:crypto";

// Helper for UUID generation in SQLite
const uuid = () => randomUUID();

/* ================================
   User Profiles
================================ */
// (rest of file unchanged)
