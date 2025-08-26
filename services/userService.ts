import { db } from "@/db/connection";
import { users, locations } from "@/db/schema";
import { eq, and, or, ilike } from "drizzle-orm";
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

type GetUsersOptions = {
  page?: number;
  limit?: number;
  search?: string;
  role?: "admin" | "keeper" | "viewer";
  departmentName?: string;
  regionName?: string;
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

  /**
   * Build search conditions for users
   */
  private static buildSearchConditions(options: GetUsersOptions) {
    const conditions = [];

    // Search by payroll number, first name, or last name
    if (options.search && options.search.trim()) {
      const searchTerm = `%${options.search.trim()}%`;
      conditions.push(
        or(
          ilike(users.payrollNumber, searchTerm),
          ilike(users.firstName, searchTerm),
          ilike(users.lastName, searchTerm),
          // Also search in concatenated full name
          ilike(
            sql`${users.firstName} || ' ' || ${users.lastName}`,
            searchTerm,
          ),
        ),
      );
    }

    // Filter by role
    if (options.role) {
      conditions.push(eq(users.role, options.role));
    }

    // Filter by department
    if (options.departmentName) {
      conditions.push(
        ilike(locations.departmentName, `%${options.departmentName}%`),
      );
    }

    // Filter by region
    if (options.regionName) {
      conditions.push(ilike(locations.regionName, `%${options.regionName}%`));
    }

    return conditions.length > 0 ? and(...conditions) : undefined;
  }

  static async getAllUsers(options: GetUsersOptions = {}) {
    const { page = 1, limit = 10 } = options;
    const safePage = page < 1 ? 1 : page;
    const safeLimit = limit > 100 ? 100 : limit;
    const offset = (safePage - 1) * safeLimit;

    // Build WHERE conditions
    const whereConditions = this.buildSearchConditions(options);

    // Build the data query
    const baseDataQuery = db
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
      .leftJoin(locations, eq(users.defaultLocationId, locations.locationId));

    // Build the count query
    const baseCountQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .leftJoin(locations, eq(users.defaultLocationId, locations.locationId));

    // Execute queries with or without WHERE conditions
    const [data, totalCountResult] = await Promise.all([
      whereConditions
        ? baseDataQuery
            .where(whereConditions)
            .limit(safeLimit)
            .offset(offset)
            .orderBy(users.firstName, users.lastName)
        : baseDataQuery
            .limit(safeLimit)
            .offset(offset)
            .orderBy(users.firstName, users.lastName),
      whereConditions ? baseCountQuery.where(whereConditions) : baseCountQuery,
    ]);

    const total = totalCountResult[0]?.count ?? 0;

    return {
      page: safePage,
      limit: safeLimit,
      total: total.toString(), // Convert to string to match your interface
      totalPages: Math.ceil(total / safeLimit),
      data,
    };
  }

  /**
   * Search users with a simple text query (alternative method)
   */
  static async searchUsers(query: string, page = 1, limit = 10) {
    return this.getAllUsers({
      page,
      limit,
      search: query,
    });
  }

  /**
   * Get users by role
   */
  static async getUsersByRole(
    role: "admin" | "keeper" | "viewer",
    page = 1,
    limit = 10,
  ) {
    return this.getAllUsers({
      page,
      limit,
      role,
    });
  }

  /**
   * Get users by location
   */
  static async getUsersByLocation(
    departmentName?: string,
    regionName?: string,
    page = 1,
    limit = 10,
  ) {
    return this.getAllUsers({
      page,
      limit,
      departmentName,
      regionName,
    });
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

  /**
   * Get users count by role (for dashboard/stats)
   */
  static async getUsersCountByRole() {
    const result = await db
      .select({
        role: users.role,
        count: sql<number>`count(*)`,
      })
      .from(users)
      .groupBy(users.role);

    return result.reduce(
      (acc, { role, count }) => {
        acc[role] = count;
        return acc;
      },
      {} as Record<string, number>,
    );
  }

  /**
   * Get users count by location (for dashboard/stats)
   */
  static async getUsersCountByLocation() {
    const result = await db
      .select({
        departmentName: locations.departmentName,
        regionName: locations.regionName,
        count: sql<number>`count(*)`,
      })
      .from(users)
      .innerJoin(locations, eq(users.defaultLocationId, locations.locationId))
      .groupBy(locations.departmentName, locations.regionName)
      .orderBy(locations.regionName, locations.departmentName);

    return result;
  }
}
