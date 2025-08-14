import { DashboardService } from "@/services/dashboardServices";

import { NextResponse } from "next/server";

export async function GET() {
  try {
    const service = new DashboardService();
    const stats = await service.getUniqueAssetStats();
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch unique asset stats" },
      { status: 500 }
    );
  }
}
