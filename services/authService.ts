// services/auth.service.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "@/db/connection";
import { users, type User, type NewUser } from "@/db/schema";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const SALT_ROUNDS = 12;

export class AuthService {
  // Generate a random temporary password
  private generateTemporaryPassword(): string {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Hash password
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  // Verify password
  private async verifyPassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Generate JWT token
  private generateToken(user: User): string {
    return jwt.sign(
      {
        payrollNumber: user.payrollNumber,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      JWT_SECRET,
      { expiresIn: "24h" },
    );
  }

  // 1. Signup (Admin only)
  async signup(userData: {
    payrollNumber: string;
    firstName: string;
    lastName: string;
    password: string;
    role?: "admin" | "keeper" | "viewer";
  }): Promise<{ success: boolean; message: string }> {
    try {
      // Check if user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.payrollNumber, userData.payrollNumber))
        .limit(1);

      if (existingUser.length > 0) {
        return {
          success: false,
          message: "User with this payroll number already exists",
        };
      }

      // Hash password
      const hashedPassword = await this.hashPassword(userData.password);

      // Create new user
      const newUser: NewUser = {
        payrollNumber: userData.payrollNumber,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role || "viewer",
        password: hashedPassword,
        mustChangePassword: false,
      };

      await db.insert(users).values(newUser);

      return { success: true, message: "User created successfully" };
    } catch (error) {
      console.error("Signup error:", error);
      return { success: false, message: "Failed to create user" };
    }
  }

  // 2. Login
  async login(
    payrollNumber: string,
    password: string,
  ): Promise<{
    success: boolean;
    accessToken?: string;
    mustChangePassword?: boolean;
    message?: string;
  }> {
    try {
      // Find user by payroll number
      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.payrollNumber, payrollNumber))
        .limit(1);

      if (userResult.length === 0) {
        return { success: false, message: "Invalid credentials" };
      }

      const user = userResult[0];

      // Verify password
      const isPasswordValid = await this.verifyPassword(
        password,
        user.password,
      );
      if (!isPasswordValid) {
        return { success: false, message: "Invalid credentials" };
      }

      // Generate token
      const accessToken = this.generateToken(user);

      return {
        success: true,
        accessToken,
        mustChangePassword: user.mustChangePassword,
      };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Login failed" };
    }
  }

  // 3. Admin Reset Password
  async resetUserPassword(targetPayrollNumber: string): Promise<{
    success: boolean;
    temporaryPassword?: string;
    message: string;
  }> {
    try {
      // Check if user exists
      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.payrollNumber, targetPayrollNumber))
        .limit(1);

      if (userResult.length === 0) {
        return { success: false, message: "User not found" };
      }

      // Generate temporary password
      const temporaryPassword = this.generateTemporaryPassword();
      const hashedTempPassword = await this.hashPassword(temporaryPassword);

      // Update user with temporary password and set mustChangePassword = true
      await db
        .update(users)
        .set({
          password: hashedTempPassword,
          mustChangePassword: true,
          updatedAt: new Date(),
        })
        .where(eq(users.payrollNumber, targetPayrollNumber));

      return {
        success: true,
        temporaryPassword,
        message: "Password reset successfully. Temporary password generated.",
      };
    } catch (error) {
      console.error("Reset password error:", error);
      return { success: false, message: "Failed to reset password" };
    }
  }

  // 4. Change Password
  async changePassword(
    payrollNumber: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<{
    success: boolean;
    accessToken?: string;
    message: string;
  }> {
    try {
      // Find user
      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.payrollNumber, payrollNumber))
        .limit(1);

      if (userResult.length === 0) {
        return { success: false, message: "User not found" };
      }

      const user = userResult[0];

      // Verify old password
      const isOldPasswordValid = await this.verifyPassword(
        oldPassword,
        user.password,
      );
      if (!isOldPasswordValid) {
        return { success: false, message: "Invalid current password" };
      }

      // Hash new password
      const hashedNewPassword = await this.hashPassword(newPassword);

      // Update password and set mustChangePassword = false
      await db
        .update(users)
        .set({
          password: hashedNewPassword,
          mustChangePassword: false,
          updatedAt: new Date(),
        })
        .where(eq(users.payrollNumber, payrollNumber));

      // Generate new token
      const updatedUser = { ...user, mustChangePassword: false };
      const accessToken = this.generateToken(updatedUser);

      return {
        success: true,
        accessToken,
        message: "Password changed successfully",
      };
    } catch (error) {
      console.error("Change password error:", error);
      return { success: false, message: "Failed to change password" };
    }
  }

  // Verify JWT token (for middleware)
  verifyToken(token: string): {
    success: boolean;
    user?: {
      payrollNumber: string;
      role: string;
      firstName: string;
      lastName: string;
    };
    message?: string;
  } {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      return {
        success: true,
        user: {
          payrollNumber: decoded.payrollNumber,
          role: decoded.role,
          firstName: decoded.firstName,
          lastName: decoded.lastName,
        },
      };
    } catch (error) {
      return { success: false, message: "Invalid or expired token" };
    }
  }

  // Get user profile
  async getUserProfile(payrollNumber: string): Promise<{
    success: boolean;
    user?: Omit<User, "password">;
    message?: string;
  }> {
    try {
      const userResult = await db
        .select({
          payrollNumber: users.payrollNumber,
          firstName: users.firstName,
          lastName: users.lastName,
          role: users.role,
          mustChangePassword: users.mustChangePassword,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .where(eq(users.payrollNumber, payrollNumber))
        .limit(1);

      if (userResult.length === 0) {
        return { success: false, message: "User not found" };
      }

      return { success: true, user: userResult[0] };
    } catch (error) {
      console.error("Get user profile error:", error);
      return { success: false, message: "Failed to get user profile" };
    }
  }
}
