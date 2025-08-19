import { NextRequest, NextResponse } from 'next/server';
import { AssetAssignmentService } from '@/services/assetAssignmentService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'unique' | 'bulk' | 'all' || 'all';

    const result = await AssetAssignmentService.getAvailableAssets(type);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in available assets GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
