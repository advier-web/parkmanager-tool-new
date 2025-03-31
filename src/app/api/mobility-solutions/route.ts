import { getMobilitySolutions } from '@/services/mock-service';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const solutions = await getMobilitySolutions();
    return NextResponse.json({ solutions }, { status: 200 });
  } catch (error) {
    console.error('Error fetching mobility solutions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mobility solutions' },
      { status: 500 }
    );
  }
} 