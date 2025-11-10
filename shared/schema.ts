// shared/schema.ts (SQLite version)
// Converts your original Postgres pg-core schema to SQLite sqlite-core
// Uses better-sqlite3 + drizzle-orm/sqlite-core

import { randomUUID } from "node:crypto";

// Helper for UUID generation in SQLite
export const uuid = () => randomUUID();

/* ================================
   User Profiles
================================ */
// (rest of file unchanged)
