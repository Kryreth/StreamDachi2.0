// Dual-mode database configuration
// Auto-detects Replit environment and switches between PostgreSQL (web) and SQLite (local)

import { drizzle as drizzlePg } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import { Pool, neonConfig } from '@neondatabase/serverless';
import Database from 'better-sqlite3';
import ws from "ws";
import * as schemaPg from "@shared/schema";
import * as schemaSqlite from "@shared/schema-sqlite";
import path from 'path';

// Detect if running on Replit or locally
export const isReplit = !!process.env.REPLIT || !!process.env.REPL_ID;
export const isLocal = !isReplit;

console.log(`🌍 Environment: ${isReplit ? 'Replit (Web Mode)' : 'Local Mode'}`);

let db: any;
let pool: Pool | undefined;
let sqliteInstance: Database.Database | undefined;

// Web mode: PostgreSQL with Neon
if (isReplit) {
  neonConfig.webSocketConstructor = ws;
  
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }

  pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  pool.on('error', (err) => {
    console.error('Unexpected database error on idle client', err);
  });

  pool.on('connect', () => {
    console.log('✅ PostgreSQL database connection established (Web Mode)');
  });

  db = drizzlePg({ client: pool, schema: schemaPg });
}

// Local mode: SQLite with better-sqlite3
else {
  const dbPath = path.join(process.cwd(), 'app.db');
  console.log(`📁 Using SQLite database at: ${dbPath}`);
  
  sqliteInstance = new Database(dbPath);
  
  // Enable WAL mode for better concurrent access
  sqliteInstance.pragma('journal_mode = WAL');
  
  console.log('✅ SQLite database initialized (Local Mode)');
  
  db = drizzleSqlite(sqliteInstance, { schema: schemaSqlite });
}

export { db, pool, sqliteInstance };
export const schema = isReplit ? schemaPg : schemaSqlite;
