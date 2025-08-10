import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { migrate } from "drizzle-orm/postgres-js/migrator";

// Environment variables for database connection
const {
  DB_HOST = "localhost",
  DB_PORT = "5432",
  DB_NAME = "asset_management",
  DB_USER = "postgres",
  DB_PASSWORD = "password",
  DATABASE_URL,
  NODE_ENV = "development",
} = process.env;

// Create connection string
const connectionString =
  DATABASE_URL ||
  `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

// Configure postgres client
const client = postgres(connectionString, {
  max: NODE_ENV === "production" ? 10 : 5,
  idle_timeout: 20,
  connect_timeout: 60,
});

// Create Drizzle database instance
export const db = drizzle(client, {
  schema,
  logger: NODE_ENV === "development",
});

// Migration function
export const runMigrations = async () => {
  try {
    console.log("Running migrations...");
    await migrate(db, { migrationsFolder: "./migrations" });
    console.log("Migrations completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
};

// Database connection test
export const testConnection = async () => {
  try {
    await client`SELECT 1`;
    console.log("✅ Database connection successful");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
};

// Graceful shutdown
export const closeConnection = async () => {
  try {
    await client.end();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Error closing database connection:", error);
  }
};

export { client };
