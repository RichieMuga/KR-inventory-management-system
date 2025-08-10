// scripts/seedAdmin.ts
import "dotenv/config";
import bcrypt from "bcrypt";
import { db } from "@/db/connection";
import { users } from "@/db/schema";

async function seedAdmin() {
  try {
    const payrollNumber = process.env.ADMIN_PAYROLL_NUMBER || "A001";
    const password = process.env.ADMIN_PASSWORD || "Password11";
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.insert(users).values({
      payrollNumber,
      firstName: "Super",
      lastName: "Admin",
      password: hashedPassword,
      role: "admin",
    });

    console.log(`✅ Admin user ${payrollNumber} created successfully!`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to seed admin:", err);
    process.exit(1);
  }
}

seedAdmin();

