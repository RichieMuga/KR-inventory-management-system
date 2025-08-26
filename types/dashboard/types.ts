import { NextRequest } from "next/server";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
  // Add other user properties as needed
}

export interface AuthenticatedRequest extends NextRequest {
  user: User;
}

export interface UniqueAssetStats {
  totalUnique: number;
  assignedUnique: number;
  availableUnique: number;
}

export interface BulkAssetStats {
  totalBulk: number;
  lowStockCount: number;
}

export interface TopAssetKeeper {
  payrollNumber: string;
  firstName: string;
  lastName: string;
  assetCount: number;
}

export interface RecentMovement {
  movementId: number;
  assetId: number;
  fromLocationId: number | null;
  toLocationId: number;
  movedBy: string;
  movementType: string;
  quantity: number;
  timestamp: Date;
  notes: string | null;
  asset: {
    name: string;
  };
  fromLocation: {
    departmentName: string;
  } | null;
  toLocation: {
    departmentName: string;
  };
  movedByUser: {
    firstName: string;
    lastName: string;
  };
}

export interface DashboardActivity {
  recentMovements: RecentMovement[];
  topKeepers: TopAssetKeeper[];
}
