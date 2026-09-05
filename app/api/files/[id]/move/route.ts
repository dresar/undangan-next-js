import { NextRequest, NextResponse } from 'next/server';
import { fileDb, folderDb, initDatabase } from '@/lib/db';
import fs from 'fs';
import path from 'path';

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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ensureDatabase();
    
    const body = await request.json();
    const { folderId } = body;

    // Get current file
    const allFiles = await fileDb.getAll();
    const file = allFiles.find((f: any) => f.id === params.id);
    
    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Validate folder if provided
    let validFolderId = null;
    let folderName = null;
    if (folderId && folderId.trim()) {
      const folder = await folderDb.get(folderId.trim());
      if (folder) {
        validFolderId = folderId.trim();
        folderName = folder.name.toLowerCase().replace(/[^a-z0-9-_]/g, '-');
      } else {
        return NextResponse.json(
          { error: 'Folder not found' },
          { status: 404 }
        );
      }
    }

    // Move physical file if it exists
    if (file.url && file.url.startsWith('/media/uploads/')) {
      const currentPath = path.join(process.cwd(), 'public', file.url);
      if (fs.existsSync(currentPath)) {
        const uploadsDir = path.join(process.cwd(), 'public', 'media', 'uploads');
        let targetDir = uploadsDir;
        
        if (folderName) {
          targetDir = path.join(uploadsDir, folderName);
          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
          }
        }
        
        const filename = path.basename(file.url);
        const newPath = path.join(targetDir, filename);
        
        // Only move if different location
        if (currentPath !== newPath) {
          fs.renameSync(currentPath, newPath);
          
          // Update URL in database
          const newUrl = folderName 
            ? `/media/uploads/${folderName}/${filename}`
            : `/media/uploads/${filename}`;
          
          // Update file in database
          await fileDb.update(params.id, { folder_id: validFolderId, url: newUrl });
          
          return NextResponse.json({ 
            success: true, 
            url: newUrl,
            folderId: validFolderId 
          });
        }
      }
    }

    // Update folder_id in database
    await fileDb.update(params.id, { folder_id: validFolderId });
    
    return NextResponse.json({ 
      success: true,
      folderId: validFolderId 
    });
  } catch (error: any) {
    console.error('Error moving file:', error);
    return NextResponse.json(
      { error: 'Failed to move file', details: error.message },
      { status: 500 }
    );
  }
}

