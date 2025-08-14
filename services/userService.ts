import { db } from "@/db/connection";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";

type CreateUserInput = {
  payrollNumber: string;
  firstName: string;
  lastName: string;
  role: "admin" | "keeper" | "viewer";
  password: string;
};

type UpdateUserInput = Partial<Omit<CreateUserInput, "payrollNumber">>;

export class UserService {
  static async createUser({
    payrollNumber,
    firstName,
    lastName,
    role,
    password,
  }: CreateUserInput) {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.payrollNumber, payrollNumber))
      .limit(1);

    if (existing.length > 0) {
      throw new Error("User with this payroll number already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [insertedUser] = await db
      .insert(users)
      .values({
        payrollNumber,
        firstName,
        lastName,
        role,
        password: hashedPassword,
        mustChangePassword: true,
      })
      .returning();

    return insertedUser;
  }

  static async getUserByPayroll(payrollNumber: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.payrollNumber, payrollNumber))
      .limit(1);

    return user ?? null;
  }

  static async updateUser(payrollNumber: string, data: UpdateUserInput) {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.role && { role: data.role }),
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

    // Fetch paginated data
    const data = await db.select().from(users).limit(safeLimit).offset(offset);

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
}
