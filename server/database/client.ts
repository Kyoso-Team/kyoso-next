import { drizzle } from "drizzle-orm/postgres-js";
import { EnhancedQueryLogger } from "drizzle-query-logger";

export const db = drizzle(process.env.DATABASE_URL!, {
  logger: process.env.NODE_ENV === "development" ? new EnhancedQueryLogger() : undefined,
});
