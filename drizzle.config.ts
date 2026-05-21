// For some reason my editor can't see type definitions, hence this
/// <reference types="bun" />

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./server/database/schema.ts",
  out: "./server/database/migrations",
  verbose: true,
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
