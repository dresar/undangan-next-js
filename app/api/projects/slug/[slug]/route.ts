import { NextRequest, NextResponse } from 'next/server';
import { projectDb } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Missing slug parameter' },
        { status: 400 }
      );
    }

    const project = await projectDb.getBySlug(slug);
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

