// services/stockLevelService.ts
import { db } from '@/db/connection';
import { 
  assets as assetsTable,
  assetMovement, 
  restockLog,
  type Asset 
} from '@/db/schema';
import { eq, desc, sum } from 'drizzle-orm';

export interface StockLevelInfo {
  assetId: number;
  name: string;
  currentStockLevel: number | null;
  minimumThreshold: number | null;
  lastRestocked: Date | null;
  isLowStock: boolean;
  totalMovements: number;
  totalRestocked: number;
  recentMovements: Array<{
    movementId: number;
    movementType: string;
    quantity: number;
    timestamp: Date;
    notes: string | null;
  }>;
  recentRestocks: Array<{
    logId: number;
    quantityRestocked: number;
    timestamp: Date;
    restockedBy: string;
    notes: string | null;
  }>;
}

export class StockLevelService {
  /**
   * Get comprehensive stock level information for a bulk asset
   */
  static async getBulkAssetStockLevel(assetId: number): Promise<StockLevelInfo | null> {
    try {
      // First, verify this is a bulk asset and get basic info
      const assetResults = await db // Renamed variable
        .select()
        .from(assetsTable) // Use the renamed import
        .where(eq(assetsTable.assetId, assetId))
        .limit(1);

      if (!assetResults[0] || !assetResults[0].isBulk) {
        return null; // Asset doesn't exist or is not a bulk asset
      }

      const assetData = assetResults[0];

      // Get recent movements (last 10)
      const recentMovements = await db
        .select({
          movementId: assetMovement.movementId,
          movementType: assetMovement.movementType,
          quantity: assetMovement.quantity,
          timestamp: assetMovement.timestamp,
          notes: assetMovement.notes,
        })
        .from(assetMovement)
        .where(eq(assetMovement.assetId, assetId))
        .orderBy(desc(assetMovement.timestamp))
        .limit(10);

      // Get recent restocks (last 10)
      const recentRestocks = await db
        .select({
          logId: restockLog.logId,
          quantityRestocked: restockLog.quantityRestocked,
          timestamp: restockLog.timestamp,
          restockedBy: restockLog.restockedBy,
          notes: restockLog.notes,
        })
        .from(restockLog)
        .where(eq(restockLog.assetId, assetId))
        .orderBy(desc(restockLog.timestamp))
        .limit(10);

      // Calculate total movements quantity
      const totalMovementsResult = await db
        .select({ total: sum(assetMovement.quantity) })
        .from(assetMovement)
        .where(eq(assetMovement.assetId, assetId));

      // Calculate total restocked quantity
      const totalRestockedResult = await db
        .select({ total: sum(restockLog.quantityRestocked) })
        .from(restockLog)
        .where(eq(restockLog.assetId, assetId));

      const totalMovements = Number(totalMovementsResult[0]?.total || 0);
      const totalRestocked = Number(totalRestockedResult[0]?.total || 0);

      // Determine if stock is low
      const currentStock = assetData.currentStockLevel || 0;
      const threshold = assetData.minimumThreshold || 0;
      const isLowStock = currentStock <= threshold;

      return {
        assetId: assetData.assetId,
        name: assetData.name,
        currentStockLevel: assetData.currentStockLevel,
        minimumThreshold: assetData.minimumThreshold,
        lastRestocked: assetData.lastRestocked,
        isLowStock,
        totalMovements,
        totalRestocked,
        recentMovements,
        recentRestocks,
      };
    } catch (error) {
      console.error('Error fetching stock level information:', error);
      throw new Error('Failed to fetch stock level information');
    }
  }

  /**
   * Get basic stock level for multiple bulk assets (useful for dashboard/listing)
   */
  static async getMultipleBulkAssetsStockLevels(
    assetIds: number[]
  ): Promise<Array<{
    assetId: number;
    name: string;
    currentStockLevel: number | null;
    minimumThreshold: number | null;
    isLowStock: boolean;
  }>> {
    try {
      const bulkAssets = await db
        .select({
          assetId: assetsTable.assetId, // Use the renamed import
          name: assetsTable.name,
          currentStockLevel: assetsTable.currentStockLevel,
          minimumThreshold: assetsTable.minimumThreshold,
        })
        .from(assetsTable) // Use the renamed import
        .where(eq(assetsTable.isBulk, true));

      return bulkAssets
        .filter(asset => assetIds.includes(asset.assetId))
        .map(asset => ({
          assetId: asset.assetId,
          name: asset.name,
          currentStockLevel: asset.currentStockLevel,
          minimumThreshold: asset.minimumThreshold,
          isLowStock: (asset.currentStockLevel || 0) <= (asset.minimumThreshold || 0),
        }));
    } catch (error) {
      console.error('Error fetching multiple stock levels:', error);
      throw new Error('Failed to fetch stock levels');
    }
  }

  /**
   * Get all low stock bulk assets
   */
  static async getLowStockAssets(): Promise<Array<{
    assetId: number;
    name: string;
    currentStockLevel: number | null;
    minimumThreshold: number | null;
  }>> {
    try {
      const assetResults = await db // Renamed variable
        .select({
          assetId: assetsTable.assetId, // Use the renamed import
          name: assetsTable.name,
          currentStockLevel: assetsTable.currentStockLevel,
          minimumThreshold: assetsTable.minimumThreshold,
        })
        .from(assetsTable) // Use the renamed import
        .where(eq(assetsTable.isBulk, true));

      return assetResults.filter(asset => 
        (asset.currentStockLevel || 0) <= (asset.minimumThreshold || 0)
      );
    } catch (error) {
      console.error('Error fetching low stock assets:', error);
      throw new Error('Failed to fetch low stock assets');
    }
  }
}