import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/services/authService";
import { withAdminAuth } from "@/middleware/authMiddleware";

const authService = new AuthService();

export const POST = withAdminAuth(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { targetPayrollNumber } = body;

    if (!targetPayrollNumber) {
      return NextResponse.json(
        { error: "Target payroll number is required" },
        { status: 400 },
      );
    }

    const result = await authService.resetUserPassword(
      targetPayrollNumber.trim(),
    );

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      message: result.message,
      temporaryPassword: result.temporaryPassword,
    });
  } catch (error) {
    console.error("Reset password API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
});
