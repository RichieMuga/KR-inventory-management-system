import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/connection";
import { users } from "@/db/schema";
import {
  withAuth,
  withAdminAuth,
  AuthenticatedRequest,
} from "@/middleware/authMiddleware";

// =======================
// GET (Any authenticated user)
// =======================
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  const url = new URL(req.url);
  const payrollNumber = url.pathname.split("/").pop();

  if (!payrollNumber) {
    return NextResponse.json(
      { error: "Payroll number is required" },
      { status: 400 },
    );
  }

  const user = await db.query.users.findFirst({
    where: eq(users.payrollNumber, payrollNumber),
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Remove password before sending
  const { password, ...safeUser } = user;

  return NextResponse.json({ success: true, user: safeUser });
});

// =======================
// PATCH (Only admin can update a user)
// =======================
export const PATCH = withAdminAuth(async (req: AuthenticatedRequest) => {
  const url = new URL(req.url);
  const payrollNumber = url.pathname.split("/").pop();

  if (!payrollNumber) {
    return NextResponse.json(
      { error: "Payroll number is required" },
      { status: 400 },
    );
  }

  const body = await req.json();

  // Disallow password change here unless you explicitly want it
  if ("password" in body) {
    return NextResponse.json(
      { error: "Password updates are not allowed here" },
      { status: 400 },
    );
  }

  const updatedUser = await db
    .update(users)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(users.payrollNumber, payrollNumber))
    .returning();

  if (!updatedUser.length) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { password, ...safeUser } = updatedUser[0];
  return NextResponse.json({ success: true, user: safeUser });
});

// =======================
// DELETE (Only admin can delete a user)
// =======================
export const DELETE = withAdminAuth(async (req: AuthenticatedRequest) => {
  const url = new URL(req.url);
  const payrollNumber = url.pathname.split("/").pop();

  if (!payrollNumber) {
    return NextResponse.json(
      { error: "Payroll number is required" },
      { status: 400 },
    );
  }

  const deletedUser = await db
    .delete(users)
    .where(eq(users.payrollNumber, payrollNumber))
    .returning();

  if (!deletedUser.length) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Remove password from the response
  const { password, ...safeUser } = deletedUser[0];

  return NextResponse.json({ success: true, user: safeUser });
});
