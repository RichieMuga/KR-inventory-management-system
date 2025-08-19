import { db } from "@/db/connection";
import { users, locations } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";

// Updated type to support both approaches
type CreateUserInput = {
  payrollNumber: string;
  firstName: string;
  lastName: string;
  role: "admin" | "keeper" | "viewer";
  password: string;

  // Option 1: Use existing location ID (new approach)
  defaultLocationId?: number | null;

  // Option 2: Create location from department/region (legacy approach)
  departmentName?: string;
  regionName?: string;
  locationNotes?: string;
};

type UpdateUserInput = Partial<
  Omit<CreateUserInput, "payrollNumber" | "password">
> & {
  // Allow updating location by providing new department/region
  departmentName?: string;
  regionName?: string;
  locationNotes?: string;
};

export class UserService {
  /**
   * Find or create a location based on department and region
   */
  static async findOrCreateLocation(
    departmentName: string,
    regionName: string,
    notes?: string,
  ) {
    // Try to find existing location
    const existingLocation = await db
      .select()
      .from(locations)
      .where(
        and(
          eq(locations.departmentName, departmentName),
          eq(locations.regionName, regionName),
        ),
      )
      .limit(1);

    if (existingLocation.length > 0) {
      return existingLocation[0];
    }

    // Create new location if it doesn't exist
    const [newLocation] = await db
      .insert(locations)
      .values({
        departmentName,
        regionName,
        notes: notes || `${departmentName} - ${regionName}`,
      })
      .returning();

    return newLocation;
  }

  static async createUser(input: CreateUserInput) {
    const {
      payrollNumber,
      firstName,
      lastName,
      role,
      password,
      defaultLocationId,
      departmentName,
      regionName,
      locationNotes,
    } = input;

    // Check if user already exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.payrollNumber, payrollNumber))
      .limit(1);

    if (existing.length > 0) {
      throw new Error("User with this payroll number already exists");
    }

    let finalLocationId: number | null = null;

    // Determine which approach to use for location
    if (defaultLocationId !== undefined) {
      // Option 1: Use provided defaultLocationId (can be null)
      finalLocationId = defaultLocationId;
    } else if (departmentName && regionName) {
      // Option 2: Find or create location from department/region
      const location = await this.findOrCreateLocation(
        departmentName,
        regionName,
        locationNotes,
      );
      finalLocationId = location.locationId;
    }
    // If neither is provided, finalLocationId remains null

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with location reference
    const [insertedUser] = await db
      .insert(users)
      .values({
        payrollNumber,
        firstName,
        lastName,
        role,
        password: hashedPassword,
        mustChangePassword: true,
        defaultLocationId: finalLocationId,
      })
      .returning();

    // If we have a location, fetch it for the response
    let defaultLocation = null;
    if (finalLocationId) {
      const locationResult = await db
        .select()
        .from(locations)
        .where(eq(locations.locationId, finalLocationId))
        .limit(1);
      defaultLocation = locationResult[0] || null;
    }

    return {
      ...insertedUser,
      defaultLocation,
    };
  }

  static async getUserByPayroll(payrollNumber: string) {
    const result = await db
      .select({
        payrollNumber: users.payrollNumber,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        mustChangePassword: users.mustChangePassword,
        defaultLocationId: users.defaultLocationId,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        // Include location details
        defaultLocation: {
          locationId: locations.locationId,
          departmentName: locations.departmentName,
          regionName: locations.regionName,
          notes: locations.notes,
        },
      })
      .from(users)
      .leftJoin(locations, eq(users.defaultLocationId, locations.locationId))
      .where(eq(users.payrollNumber, payrollNumber))
      .limit(1);

    return result[0] ?? null;
  }

  static async updateUser(payrollNumber: string, data: UpdateUserInput) {
    let locationId = undefined;

    // If department/region info is provided, find or create location
    if (data.departmentName && data.regionName) {
      const location = await this.findOrCreateLocation(
        data.departmentName,
        data.regionName,
        data.locationNotes,
      );
      locationId = location.locationId;
    } else if (data.defaultLocationId !== undefined) {
      // If defaultLocationId is provided directly
      locationId = data.defaultLocationId;
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.role && { role: data.role }),
        ...(locationId !== undefined && { defaultLocationId: locationId }),
        updatedAt: new Date(),
      })
      .where(eq(users.payrollNumber, payrollNumber))
      .returning();

    return updatedUser ?? null;
  }

  static async deleteUser(payrollNumber: string) {
    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.payrollNumber, payrollNumber))
      .returning();

    return deletedUser ?? null;
  }

  static async getAllUsers(page = 1, limit = 10) {
    const safePage = page < 1 ? 1 : page;
    const safeLimit = limit > 100 ? 100 : limit;
    const offset = (safePage - 1) * safeLimit;

    // Fetch paginated data with location details
    const data = await db
      .select({
        payrollNumber: users.payrollNumber,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        mustChangePassword: users.mustChangePassword,
        defaultLocationId: users.defaultLocationId,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        // Include location details
        defaultLocation: {
          locationId: locations.locationId,
          departmentName: locations.departmentName,
          regionName: locations.regionName,
          notes: locations.notes,
        },
      })
      .from(users)
      .leftJoin(locations, eq(users.defaultLocationId, locations.locationId))
      .limit(safeLimit)
      .offset(offset);

    // Fetch total count
    const totalCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);
    const total = totalCountResult[0]?.count ?? 0;

    return {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
      data,
    };
  }

  /**
   * Get all locations for dropdowns in UI
   */
  static async getAllLocations() {
    return await db
      .select()
      .from(locations)
      .orderBy(locations.regionName, locations.departmentName);
  }

  /**
   * Get user's location for assignment purposes
   */
  static async getUserLocation(payrollNumber: string) {
    const result = await db
      .select({
        locationId: locations.locationId,
        departmentName: locations.departmentName,
        regionName: locations.regionName,
      })
      .from(users)
      .innerJoin(locations, eq(users.defaultLocationId, locations.locationId))
      .where(eq(users.payrollNumber, payrollNumber))
      .limit(1);

    return result[0] ?? null;
  }
}
