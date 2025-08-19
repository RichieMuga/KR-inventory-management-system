import { NextResponse } from "next/server";
import {
  withAdminAuth,
  withAuth,
  AuthenticatedRequest,
} from "@/middleware/authMiddleware";
import { UserService } from "@/services/userService";
import { extractRoleAndPayrollFromJWT } from "@/lib/utility/extractToken";

export const POST = withAdminAuth(async (req) => {
  try {
    // Just decode the token for logging purposes
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1] || "";
    const { payrollNumber: creatorPayroll, role: creatorRole } =
      extractRoleAndPayrollFromJWT(token) || {};

    // Parse body for new user data - ADD defaultLocationId here
    const {
      firstName,
      lastName,
      payrollNumber,
      role,
      defaultLocationId, // Add this to the destructuring
    } = await req.json();

    // Create user with location
    const user = await UserService.createUser({
      payrollNumber,
      firstName,
      lastName,
      role,
      password: "Password10",
      defaultLocationId, // Pass it to the service
    });

    return NextResponse.json(
      {
        success: true,
        createdBy: {
          payrollNumber: creatorPayroll,
          role: creatorRole,
        },
        user,
      },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create user" },
      { status: 400 },
    );
  }
});

// GET /api/users?page=1&limit=10
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  try {
    const result = await UserService.getAllUsers(page, limit);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Error fetching users:", err);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
});
