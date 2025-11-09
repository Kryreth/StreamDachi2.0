import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is missing (e.g., file:./app.db)');

export default defineConfig({
  out: "./drizzle",
  schema: "./shared/schema.ts",   // keep this (you actually have this file)
  dialect: "sqlite",
  dbCredentials: { url },
});

