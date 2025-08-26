import { DashboardService } from "@/services/dashboardServices";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const service = new DashboardService();
    const [recentMovements, topKeepers] = await Promise.all([
      service.getRecentMovements(),
      service.getTopAssetKeepers(),
    ]);

    // Transform the data to match expected format
    const transformedMovements = recentMovements.map((movement) => ({
      movementId: movement.movementId,
      assetId: movement.assetId,
      fromLocationId: movement.fromLocationId,
      toLocationId: movement.toLocationId,
      movedBy: movement.movedBy,
      movementType: movement.movementType,
      quantity: movement.quantity,
      timestamp: movement.timestamp,
      notes: movement.notes,
      asset: { name: movement.assetName },
      fromLocation: movement.fromLocationId
        ? {
            departmentName: movement.fromDepartment,
          }
        : null,
      toLocation: { departmentName: movement.toDepartment },
      movedByUser: {
        firstName: movement.moverFirstName,
        lastName: movement.moverLastName,
      },
    }));

    return NextResponse.json({
      recentMovements: transformedMovements,
      topKeepers,
    });
  } catch (error) {
    console.error("Dashboard activity error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch dashboard activity",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
