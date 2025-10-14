import { NextResponse } from 'next/server';
import { getAllProfiles } from '@/lib/state-doi-direct';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = getAllProfiles();
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to load DOI data' },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in DOI data endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

