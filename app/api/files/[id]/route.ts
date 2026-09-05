import { NextRequest, NextResponse } from 'next/server';
import { fileDb, initDatabase } from '@/lib/db';
import fs from 'fs';
import path from 'path';

// Initialize database
if (typeof window === 'undefined') {
  initDatabase().catch((error) => {
    console.error('Database initialization error:', error);
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Get file info before deleting from database
    const allFiles = await fileDb.getAll();
    const file = allFiles.find((f: any) => f.id === id);
    
    // Delete from database
    await fileDb.delete(id);
    
    // Delete physical file if it exists in uploads directory
    if (file && file.url && file.url.startsWith('/media/uploads/')) {
      const filePath = path.join(process.cwd(), 'public', file.url);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (error) {
          console.error('Error deleting physical file:', error);
          // Continue even if file deletion fails
        }
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}

