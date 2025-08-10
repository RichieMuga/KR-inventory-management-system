import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/services/authService";
import { withAuth } from "@/middleware/authMiddleware";

const authService = new AuthService();

export const GET = withAuth(async (req: any) => {
  try {
    const result = await authService.getUserProfile(req.user.payrollNumber);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 404 });
    }

    return NextResponse.json({ user: result.user });
  } catch (error) {
    console.error("Get profile API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
});
