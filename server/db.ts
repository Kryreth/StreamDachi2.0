// Dual-mode database: Auto-switches between PostgreSQL (Replit) and SQLite (local)
// Uses db-config.ts to detect environment and configure database accordingly

export { db, pool, sqliteInstance, schema, isReplit, isLocal } from './db-config';
