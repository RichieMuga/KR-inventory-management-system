import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/services/authService";
import { withAdminAuth } from "@/middleware/authMiddleware";

const authService = new AuthService();

export const POST = withAdminAuth(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { payrollNumber, firstName, lastName, password, role } = body;

    // Validation
    if (!payrollNumber || !firstName || !lastName || !password) {
      return NextResponse.json(
        { error: "All required fields must be provided" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 },
      );
    }

    const result = await authService.signup({
      payrollNumber: payrollNumber.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      password,
      role: role || "viewer",
    });

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({ message: result.message }, { status: 201 });
  } catch (error) {
    console.error("Signup API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
});
