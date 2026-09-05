import { NextRequest, NextResponse } from 'next/server';
import { fileDb, projectDb, initDatabase } from '@/lib/db';
import fs from 'fs';
import path from 'path';

// Initialize database on server side
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

// Ensure uploads directory exists
function ensureUploadsDir() {
  const uploadsDir = path.join(process.cwd(), 'public', 'media', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  return uploadsDir;
}

// Scan files in uploads directory and sync to database
async function scanAndSyncFiles() {
  try {
    const uploadsDir = ensureUploadsDir();
    const allFiles: any[] = [];
    
    // Get folder mappings from database
    const { folderDb } = await import('@/lib/db');
    const folders = await folderDb.getAll();
    const folderMap = new Map<string, string>(); // folder name -> folder id
    
    for (const folder of folders) {
      if (!folder.project_id) { // Only global folders
        folderMap.set(folder.name.toLowerCase(), folder.id);
      }
    }
    
    // Recursively scan all files in uploads directory
    function scanDirectory(dir: string, relativePath: string = '') {
      const items = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        const relativeFilePath = relativePath ? `${relativePath}/${item.name}` : item.name;
        
        if (item.isDirectory()) {
          // Recursively scan subdirectories
          scanDirectory(fullPath, relativeFilePath);
        } else if (item.isFile()) {
          // Skip .gitkeep and other hidden files
          if (item.name.startsWith('.')) continue;
          
          const stats = fs.statSync(fullPath);
          const fileUrl = relativePath 
            ? `/media/uploads/${relativeFilePath}` 
            : `/media/uploads/${item.name}`;
          
          // Determine file type from extension
          const ext = path.extname(item.name).toLowerCase();
          let fileType = 'file';
          let mimeType = 'application/octet-stream';
          
          if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext)) {
            fileType = 'image';
            mimeType = ext === '.svg' ? 'image/svg+xml' : `image/${ext.slice(1)}`;
          } else if (['.mp4', '.webm', '.mov', '.avi'].includes(ext)) {
            fileType = 'video';
            mimeType = `video/${ext.slice(1)}`;
          } else if (['.mp3', '.wav', '.ogg'].includes(ext)) {
            fileType = 'audio';
            mimeType = `audio/${ext.slice(1)}`;
          }
          
          // Determine folder_id based on directory structure
          let folderId = null;
          if (relativePath) {
            const folderName = relativePath.split('/')[0].toLowerCase();
            folderId = folderMap.get(folderName) || null;
          }
          
          allFiles.push({
            url: fileUrl,
            filename: item.name,
            size: stats.size,
            mimeType,
            fileType,
            relativePath: relativeFilePath,
            folderId,
          });
        }
      }
    }
    
    scanDirectory(uploadsDir);
    
    // Also scan public/media/default for templates and other default assets
    const defaultDir = path.join(process.cwd(), 'public', 'media', 'default');
    if (fs.existsSync(defaultDir)) {
      function scanDefaultDirectory(dir: string, relativePath: string = '') {
        if (!fs.existsSync(dir)) return;
        const items = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const item of items) {
          const fullPath = path.join(dir, item.name);
          const relativeFilePath = relativePath ? `${relativePath}/${item.name}` : item.name;
          
          if (item.isDirectory()) {
            scanDefaultDirectory(fullPath, relativeFilePath);
          } else if (item.isFile() && !item.name.startsWith('.')) {
            const stats = fs.statSync(fullPath);
            const fileUrl = `/media/default/${relativeFilePath}`;
            
            const ext = path.extname(item.name).toLowerCase();
            let fileType = 'file';
            let mimeType = 'application/octet-stream';
            
            if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext)) {
              fileType = 'image';
              mimeType = ext === '.svg' ? 'image/svg+xml' : `image/${ext.slice(1)}`;
            } else if (['.mp4', '.webm', '.mov', '.avi'].includes(ext)) {
              fileType = 'video';
              mimeType = `video/${ext.slice(1)}`;
            } else if (['.mp3', '.wav', '.ogg'].includes(ext)) {
              fileType = 'audio';
              mimeType = `audio/${ext.slice(1)}`;
            }
            
            // Map to templates folder if in templates directory
            let folderId = null;
            if (relativePath.includes('templates')) {
              folderId = folderMap.get('templates') || null;
            } else if (relativePath.includes('asset') || relativePath.includes('assets')) {
              folderId = folderMap.get('asset') || null;
            }
            
            allFiles.push({
              url: fileUrl,
              filename: item.name,
              size: stats.size,
              mimeType,
              fileType,
              relativePath: relativeFilePath,
              folderId,
            });
          }
        }
      }
      scanDefaultDirectory(defaultDir);
    }
    
    // Check which files are already in database
    const existingFiles = await fileDb.getAll();
    const existingUrls = new Set(existingFiles.map((f: any) => f.url));
    
    // Add files that don't exist in database
    for (const file of allFiles) {
      if (!existingUrls.has(file.url)) {
        const id = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await fileDb.create(
          id,
          file.url,
          null, // project_id = null (public asset)
          file.filename,
          file.size,
          file.mimeType,
          file.fileType,
          file.folderId || null // Use detected folder_id
        );
      } else {
        // Update folder_id if file exists but folder_id is different
        const existingFile = existingFiles.find((f: any) => f.url === file.url);
        if (existingFile && existingFile.folder_id !== file.folderId) {
          await fileDb.update(existingFile.id, { folder_id: file.folderId });
        }
      }
    }
    
    return allFiles.length;
  } catch (error: any) {
    console.error('Error scanning files:', error);
    return 0;
  }
}

// Convert base64/data URL to buffer and save to file
function saveFileFromDataUrl(dataUrl: string, filename: string, uploadsDir: string, folderName?: string): string {
  // Extract base64 data and mime type
  const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid data URL format');
  }

  const mimeType = matches[1];
  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, 'base64');

  // Determine file extension from mime type or filename
  let extension = '';
  if (mimeType.includes('webp')) {
    extension = '.webp';
  } else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) {
    extension = '.jpg';
  } else if (mimeType.includes('png')) {
    extension = '.png';
  } else if (mimeType.includes('gif')) {
    extension = '.gif';
  } else if (mimeType.includes('svg')) {
    extension = '.svg';
  } else if (mimeType.includes('mp4')) {
    extension = '.mp4';
  } else if (mimeType.includes('webm')) {
    extension = '.webm';
  } else if (mimeType.includes('mov')) {
    extension = '.mov';
  } else if (mimeType.includes('mp3')) {
    extension = '.mp3';
  } else if (mimeType.includes('wav')) {
    extension = '.wav';
  } else {
    // Try to get extension from filename
    const extMatch = filename.match(/\.([^.]+)$/);
    extension = extMatch ? `.${extMatch[1]}` : '';
  }

  // Generate unique filename
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  const baseFilename = filename.replace(/\.[^/.]+$/, '') || 'file';
  const safeFilename = baseFilename.replace(/[^a-zA-Z0-9-_]/g, '_');
  const finalFilename = `${safeFilename}_${timestamp}_${random}${extension}`;
  
  // Create folder structure if folderName provided
  let targetDir = uploadsDir;
  if (folderName && folderName.trim()) {
    const safeFolderName = folderName.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    targetDir = path.join(uploadsDir, safeFolderName);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
  }
  
  const filePath = path.join(targetDir, finalFilename);

  // Write file
  fs.writeFileSync(filePath, buffer);

  // Return relative path for URL
  if (folderName && folderName.trim()) {
    const safeFolderName = folderName.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    return `/media/uploads/${safeFolderName}/${finalFilename}`;
  }
  return `/media/uploads/${finalFilename}`;
}

export async function GET(request: NextRequest) {
  try {
    await ensureDatabase();
    
    // Scan and sync files from uploads directory to database
    // This ensures all files in public/media/uploads are accessible
    await scanAndSyncFiles();
    
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('projectId');
    const folderId = searchParams.get('folderId');
    const fileType = searchParams.get('fileType');

    let files;
    if (projectId) {
      // Get project-specific files
      files = await fileDb.getByProject(projectId, folderId || undefined);
      // Also include public assets (files without project_id)
      const publicFiles = await fileDb.getAll(folderId || undefined);
      // Combine and remove duplicates
      const projectFileUrls = new Set(files.map((f: any) => f.url));
      const uniquePublicFiles = publicFiles.filter((f: any) => !projectFileUrls.has(f.url));
      files = [...files, ...uniquePublicFiles];
    } else if (folderId) {
      files = await fileDb.getByFolder(folderId);
    } else {
      // Get all files (including public assets without project_id)
      files = await fileDb.getAll();
    }

    // Filter by file type if specified
    if (fileType) {
      files = files.filter((f: any) => f.file_type === fileType || f.fileType === fileType);
    }

    return NextResponse.json(files || []);
  } catch (error: any) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureDatabase();
    const uploadsDir = ensureUploadsDir();
    
    const body = await request.json();
    const { projectId, folderId, folderName, filename, url, mimeType, size, fileType } = body;

    if (!url || !filename) {
      return NextResponse.json(
        { error: 'URL and filename are required' },
        { status: 400 }
      );
    }

    // Check if URL is a data URL (base64) or already a file path
    let fileUrl = url;
    let actualSize = size;

    // If it's a data URL, save it to disk
    if (url.startsWith('data:')) {
      try {
        fileUrl = saveFileFromDataUrl(url, filename, uploadsDir, folderName);
        // If size not provided, calculate from buffer
        if (!actualSize) {
          const filePath = path.join(process.cwd(), 'public', fileUrl);
          if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            actualSize = stats.size;
          }
        }
      } catch (error: any) {
        console.error('Error saving file:', error);
        return NextResponse.json(
          { error: 'Failed to save file to disk', details: error.message },
          { status: 500 }
        );
      }
    }

    // Validasi project_id jika diberikan (harus ada di database)
    // Jika tidak valid atau tidak ada, simpan tanpa project_id (untuk media library global)
    let validProjectId = null;
    if (projectId && projectId.trim()) {
      try {
        const project = await projectDb.get(projectId.trim());
        if (project) {
          validProjectId = projectId.trim();
        } else {
          console.warn(`Project ID ${projectId} not found, saving file without project_id (global media library)`);
        }
      } catch (error) {
        console.warn(`Error validating project_id: ${error}, saving file without project_id (global media library)`);
      }
    }

    const id = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Validasi folder_id jika diberikan
    let validFolderId = null;
    if (folderId && folderId.trim()) {
      try {
        const { folderDb } = await import('@/lib/db');
        const folder = await folderDb.get(folderId.trim());
        if (folder) {
          validFolderId = folderId.trim();
        } else {
          console.warn(`Folder ID ${folderId} not found, saving file without folder_id`);
        }
      } catch (error) {
        console.warn(`Error validating folder_id: ${error}, saving file without folder_id`);
      }
    }
    
    // Simpan file ke database (project_id dan folder_id bisa null untuk media library global)
    const file = await fileDb.create(
      id,
      fileUrl,
      validProjectId || null, // Pastikan null jika tidak valid
      filename,
      actualSize || null,
      mimeType || null,
      fileType || null,
      validFolderId || null
    );

    return NextResponse.json(file, { status: 201 });
  } catch (error: any) {
    console.error('Error creating file:', error);
    return NextResponse.json(
      { error: 'Failed to create file', details: error.message },
      { status: 500 }
    );
  }
}

