import { db } from "@/db/connection";
import * as schema from "@/db/schema";
import { sql, or, ilike, and } from "drizzle-orm";
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

  // Updated: Get all locations paginated with optional search
  static async getAllPaginated(
    limit: number,
    offset: number,
    search?: string,
  ): Promise<schema.Location[]> {
    try {
      // If no search term, use the original query
      if (!search || search.trim() === "") {
        return await db.query.locations.findMany({
          limit,
          offset,
          orderBy: (locations, { asc }) => [
            asc(locations.regionName),
            asc(locations.departmentName),
          ],
        });
      }

      // With search term, use select query with where clause
      const searchPattern = `%${search.trim()}%`;

      return await db
        .select()
        .from(schema.locations)
        .where(
          or(
            ilike(schema.locations.regionName, searchPattern),
            ilike(schema.locations.departmentName, searchPattern),
            ilike(schema.locations.notes, searchPattern),
          ),
        )
        .orderBy(schema.locations.regionName, schema.locations.departmentName)
        .limit(limit)
        .offset(offset);
    } catch (error) {
      console.error("Error fetching paginated locations:", error);
      throw error;
    }
  }

  // Updated: Count all locations with optional search
  static async count(search?: string): Promise<number> {
    try {
      // If no search term, count all
      if (!search || search.trim() === "") {
        const result = await db
          .select({ count: sql`count(*)` })
          .from(schema.locations);
        return Number(result[0].count);
      }

      // With search term, count filtered results
      const searchPattern = `%${search.trim()}%`;

      const result = await db
        .select({ count: sql`count(*)` })
        .from(schema.locations)
        .where(
          or(
            ilike(schema.locations.regionName, searchPattern),
            ilike(schema.locations.departmentName, searchPattern),
            ilike(schema.locations.notes, searchPattern),
          ),
        );

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
    try {
      const deletedLocation = await db
        .delete(schema.locations)
        .where(eq(schema.locations.locationId, locationId))
        .returning();
      return deletedLocation.length > 0;
    } catch (error) {
      console.error("Error deleting location:", error);
      throw error;
    }
  }

  // Additional search methods (optional - for more specific searches)

  // Search by region only
  static async searchByRegion(
    regionName: string,
    limit: number,
    offset: number,
  ): Promise<schema.Location[]> {
    try {
      return await db
        .select()
        .from(schema.locations)
        .where(ilike(schema.locations.regionName, `%${regionName}%`))
        .orderBy(schema.locations.regionName, schema.locations.departmentName)
        .limit(limit)
        .offset(offset);
    } catch (error) {
      console.error("Error searching locations by region:", error);
      throw error;
    }
  }

  // Search by department only
  static async searchByDepartment(
    departmentName: string,
    limit: number,
    offset: number,
  ): Promise<schema.Location[]> {
    try {
      return await db
        .select()
        .from(schema.locations)
        .where(ilike(schema.locations.departmentName, `%${departmentName}%`))
        .orderBy(schema.locations.regionName, schema.locations.departmentName)
        .limit(limit)
        .offset(offset);
    } catch (error) {
      console.error("Error searching locations by department:", error);
      throw error;
    }
  }
}
