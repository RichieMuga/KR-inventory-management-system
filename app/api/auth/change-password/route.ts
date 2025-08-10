import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/services/authService";
import { withAuth } from "@/middleware/authMiddleware";

const authService = new AuthService();

export const POST = withAuth(async (req: any) => {
  try {
    const body = await req.json();
    const { oldPassword, newPassword, confirmPassword } = body;

    // Validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: "All password fields are required" },
        { status: 400 },
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "New passwords do not match" },
        { status: 400 },
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters long" },
        { status: 400 },
      );
    }

    if (oldPassword === newPassword) {
      return NextResponse.json(
        { error: "New password must be different from current password" },
        { status: 400 },
      );
    }

    const result = await authService.changePassword(
      req.user.payrollNumber,
      oldPassword,
      newPassword,
    );

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      message: result.message,
      accessToken: result.accessToken,
    });
  } catch (error) {
    console.error("Change password API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
});
