import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/services/authService";

const authService = new AuthService();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { payrollNumber, password } = body;

    // Validation
    if (!payrollNumber || !password) {
      return NextResponse.json(
        { error: "Payroll number and password are required" },
        { status: 400 },
      );
    }

    const result = await authService.login(payrollNumber.trim(), password);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 401 });
    }

    return NextResponse.json({
      accessToken: result.accessToken,
      mustChangePassword: result.mustChangePassword,
    });
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
