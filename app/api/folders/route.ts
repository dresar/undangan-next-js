import { NextRequest, NextResponse } from 'next/server';
import { folderDb, initDatabase, query } from '@/lib/db';

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

export async function GET(request: NextRequest) {
  try {
    await ensureDatabase();
    
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('projectId');

    // Ensure system folders exist
    const assetFolderCheck: any = await folderDb.getAll();
    const hasAssetFolder = assetFolderCheck.some((f: any) => f.name === 'asset' && !f.project_id);
    const hasTemplatesFolder = assetFolderCheck.some((f: any) => f.name === 'templates' && !f.project_id);
    
    if (!hasAssetFolder) {
      await folderDb.create('folder-asset-system', 'asset', undefined, 'Folder untuk asset public yang dapat diakses semua project');
      // Mark as system folder
      await query('UPDATE asset_folders SET is_system = 1 WHERE id = ?', ['folder-asset-system']);
    }
    
    if (!hasTemplatesFolder) {
      await folderDb.create('folder-templates-system', 'templates', undefined, 'Folder untuk asset templates yang dapat diakses semua project');
      // Mark as system folder
      await query('UPDATE asset_folders SET is_system = 1 WHERE id = ?', ['folder-templates-system']);
    }

    const folders = await folderDb.getAll(projectId || undefined);
    console.log(`API: Returning ${folders.length} folders for projectId: ${projectId || 'global'}`);
    return NextResponse.json(folders || []);
  } catch (error: any) {
    console.error('Error fetching folders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch folders', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureDatabase();
    
    const body = await request.json();
    const { name, projectId, description } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Folder name is required' },
        { status: 400 }
      );
    }

    const id = `folder-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    const folder = await folderDb.create(
      id,
      name.trim(),
      projectId || undefined,
      description?.trim() || undefined
    );

    return NextResponse.json(folder, { status: 201 });
  } catch (error: any) {
    console.error('Error creating folder:', error);
    return NextResponse.json(
      { error: 'Failed to create folder', details: error.message },
      { status: 500 }
    );
  }
}

