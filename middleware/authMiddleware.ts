import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/services/authService";

const authService = new AuthService();

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    payrollNumber: string;
    role: string;
    firstName: string;
    lastName: string;
  };
}

// Middleware to verify JWT token
export function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const authHeader = req.headers.get("authorization");

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json(
          { error: "Authorization token required" },
          { status: 401 },
        );
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      const verificationResult = authService.verifyToken(token);

      if (!verificationResult.success) {
        return NextResponse.json(
          { error: verificationResult.message || "Invalid token" },
          { status: 401 },
        );
      }

      // Attach user to request
      (req as AuthenticatedRequest).user = verificationResult.user;

      return handler(req as AuthenticatedRequest);
    } catch (error) {
      console.error("Auth middleware error:", error);
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 },
      );
    }
  };
}

// Middleware to check admin role
export function withAdminAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
) {
  return withAuth(async (req: AuthenticatedRequest): Promise<NextResponse> => {
    if (req.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    return handler(req);
  });
}

// Middleware to check keeper or admin role
export function withKeeperAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
) {
  return withAuth(async (req: AuthenticatedRequest): Promise<NextResponse> => {
    if (req.user?.role !== "keeper" && req.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Keeper or Admin access required" },
        { status: 403 },
      );
    }

    return handler(req);
  });
}
