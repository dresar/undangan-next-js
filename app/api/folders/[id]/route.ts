import { NextRequest, NextResponse } from 'next/server';
import { folderDb, initDatabase } from '@/lib/db';

let dbInitialized = false;

async function ensureDatabase() {
  if (!dbInitialized) {
    try {
      await initDatabase();
      dbInitialized = true;
    } catch (error) {
      console.error('Database initialization error:', error);
      throw error;
    }
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ensureDatabase();
    const folder = await folderDb.get(params.id);
    
    if (!folder) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(folder);
  } catch (error: any) {
    console.error('Error fetching folder:', error);
    return NextResponse.json(
      { error: 'Failed to fetch folder', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ensureDatabase();
    
    const body = await request.json();
    const { name, description } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Folder name is required' },
        { status: 400 }
      );
    }

    const folder = await folderDb.update(
      params.id,
      name.trim(),
      description?.trim() || undefined
    );

    return NextResponse.json(folder);
  } catch (error: any) {
    console.error('Error updating folder:', error);
    return NextResponse.json(
      { error: 'Failed to update folder', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ensureDatabase();
    await folderDb.delete(params.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting folder:', error);
    return NextResponse.json(
      { error: 'Failed to delete folder', details: error.message },
      { status: 500 }
    );
  }
}

