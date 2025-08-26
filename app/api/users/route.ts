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

// GET /api/users?page=1&limit=10&search=john&role=admin&departmentName=IT&regionName=North
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  const { searchParams } = new URL(req.url);

  // Parse pagination parameters
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  // Parse search and filter parameters
  const search = searchParams.get("search") || undefined;
  const role = searchParams.get("role") as
    | "admin"
    | "keeper"
    | "viewer"
    | undefined;
  const departmentName = searchParams.get("departmentName") || undefined;
  const regionName = searchParams.get("regionName") || undefined;

  // Validate role parameter if provided
  if (role && !["admin", "keeper", "viewer"].includes(role)) {
    return NextResponse.json(
      {
        error: "Invalid role parameter. Must be 'admin', 'keeper', or 'viewer'",
      },
      { status: 400 },
    );
  }

  // Validate pagination parameters
  if (page < 1) {
    return NextResponse.json(
      { error: "Page must be greater than 0" },
      { status: 400 },
    );
  }

  if (limit < 1 || limit > 100) {
    return NextResponse.json(
      { error: "Limit must be between 1 and 100" },
      { status: 400 },
    );
  }

  try {
    const options = {
      page,
      limit,
      search,
      role,
      departmentName,
      regionName,
    };

    // Remove undefined values to keep the options clean
    Object.keys(options).forEach((key) => {
      if (options[key as keyof typeof options] === undefined) {
        delete options[key as keyof typeof options];
      }
    });

    const result = await UserService.getAllUsers(options);

    // Add search context to response for debugging/logging
    const response = {
      ...result,
      searchContext: {
        hasSearch: !!search,
        hasFilters: !!(role || departmentName || regionName),
        appliedFilters: {
          ...(search && { search }),
          ...(role && { role }),
          ...(departmentName && { departmentName }),
          ...(regionName && { regionName }),
        },
      },
    };

    return NextResponse.json(response);
  } catch (err: any) {
    console.error("Error fetching users:", err);
    return NextResponse.json(
      {
        error: "Failed to fetch users",
        details:
          process.env.NODE_ENV === "development" ? err.message : undefined,
      },
      { status: 500 },
    );
  }
});
