import { getMobilitySolutionsFromContentful } from '@/services/contentful-service';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const solutions = await getMobilitySolutionsFromContentful();
    return NextResponse.json({ solutions }, { status: 200 });
  } catch (error) {
    console.error('Error fetching mobility solutions from Contentful:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mobility solutions from Contentful' },
      { status: 500 }
    );
  }
} 