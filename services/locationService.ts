import { db } from "@/db/connection";
import * as schema from "@/db/schema";
import { sql } from "drizzle-orm";
import { eq } from "drizzle-orm";

export class LocationService {
  // Create location
  static async create(
    locationData: schema.NewLocation,
  ): Promise<schema.Location> {
    try {
      const [location] = await db
        .insert(schema.locations)
        .values(locationData)
        .returning();
      return location;
    } catch (error) {
      console.error("Error creating location:", error);
      throw error;
    }
  }

  // Update location (for PATCH)
  static async update(
    locationId: number,
    updates: Partial<schema.NewLocation>,
  ): Promise<schema.Location> {
    try {
      const [location] = await db
        .update(schema.locations)
        .set(updates)
        .where(eq(schema.locations.locationId, locationId))
        .returning();

      return location;
    } catch (error) {
      console.error("Error updating location:", error);
      throw error;
    }
  }

  // Get all locations
  static async getAll(): Promise<schema.Location[]> {
    try {
      const locations = await db.query.locations.findMany({
        orderBy: (locations, { asc }) => [
          asc(locations.regionName),
          asc(locations.departmentName),
        ],
      });
      return locations;
    } catch (error) {
      console.error("Error fetching locations:", error);
      throw error;
    }
  }

  // Get all locations paginated
  static async getAllPaginated(
    limit: number,
    offset: number,
  ): Promise<schema.Location[]> {
    try {
      return await db.query.locations.findMany({
        limit,
        offset,
        orderBy: (locations, { asc }) => [
          asc(locations.regionName),
          asc(locations.departmentName),
        ],
      });
    } catch (error) {
      console.error("Error fetching paginated locations:", error);
      throw error;
    }
  }

  // Count all locations
  static async count(): Promise<number> {
    try {
      const result = await db
        .select({ count: sql`count(*)` })
        .from(schema.locations);
      return Number(result[0].count);
    } catch (error) {
      console.error("Error counting locations:", error);
      throw error;
    }
  }

  // Get location by ID
  static async getById(
    locationId: number,
  ): Promise<schema.Location | undefined> {
    try {
      const location = await db.query.locations.findFirst({
        where: (locations, { eq }) => eq(locations.locationId, locationId),
      });
      return location;
    } catch (error) {
      console.error("Error fetching location:", error);
      throw error;
    }
  }

  // Delete location
  static async delete(locationId: number): Promise<boolean> {
    const deletedLocation = await db
      .delete(schema.locations)
      .where(eq(schema.locations.locationId, locationId))
      .returning();

    return deletedLocation.length > 0;
  }
}
