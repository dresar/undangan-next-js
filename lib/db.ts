import mysql from 'mysql2/promise';

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'undangan',
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Helper function to execute queries
export async function query(sql: string, params?: any[]): Promise<any> {
  const connection = await pool.getConnection();
  try {
    const [results] = await connection.execute(sql, params);
    return results;
  } finally {
    connection.release();
  }
}

// Helper function to check if column exists
async function columnExists(table: string, column: string): Promise<boolean> {
  try {
    const [results]: any = await query(
      `SELECT COUNT(*) as count 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [dbConfig.database, table, column]
    );
    return results[0]?.count > 0;
  } catch (e) {
    return false;
  }
}

// Initialize database schema
export async function initDatabase() {
  try {
    // Create database if it doesn't exist
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
    });
    
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
    await connection.end();

    // Projects table
    await query(`
      CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR(255) PRIMARY KEY,
        title TEXT NOT NULL,
        blocks LONGTEXT NOT NULL,
        description TEXT,
        url TEXT,
        thumbnail TEXT,
        published TINYINT(1) DEFAULT 0,
        published_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Add new columns if they don't exist (for existing databases - migration support)
    // This is safe to run even if columns already exist (CREATE TABLE includes them)
    const addColumnIfNotExists = async (table: string, column: string, definition: string) => {
      try {
        await query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
      } catch (e: any) {
        // Ignore duplicate column errors - column already exists, that's fine
        if (e.code === 'ER_DUP_FIELDNAME') {
          return;
        }
        // For other errors, log but don't throw (table might not exist yet)
        if (e.code !== 'ER_NO_SUCH_TABLE') {
          console.warn(`Error adding column ${table}.${column}:`, e.message);
        }
      }
    };

    // Only try to add columns that might not exist in old databases
    // Since CREATE TABLE already includes them, these will only run if table existed before
    // Safe to run - will be ignored if columns already exist
    await addColumnIfNotExists('projects', 'description', 'TEXT');
    await addColumnIfNotExists('projects', 'url', 'TEXT');
    await addColumnIfNotExists('projects', 'thumbnail', 'TEXT');
    await addColumnIfNotExists('projects', 'slug', 'VARCHAR(255)');
    await addColumnIfNotExists('projects', 'canvasBackground', 'TEXT');
    await addColumnIfNotExists('projects', 'coverImage', 'TEXT');
    await addColumnIfNotExists('projects', 'coverButtonText', 'VARCHAR(255)');
    await addColumnIfNotExists('projects', 'coverEnabled', 'TINYINT(1) DEFAULT 0');
    await addColumnIfNotExists('projects', 'musicUrl', 'TEXT');

    // Asset folders table untuk mengorganisir file (gambar, video, dll)
    await query(`
      CREATE TABLE IF NOT EXISTS asset_folders (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        project_id VARCHAR(255),
        is_system TINYINT(1) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Add is_system column if not exists
    await addColumnIfNotExists('asset_folders', 'is_system', 'TINYINT(1) DEFAULT 0');
    
    // Create default "asset" folder if it doesn't exist (system folder, tidak bisa dihapus)
    const assetFolderCheck: any = await query('SELECT * FROM asset_folders WHERE name = ? AND project_id IS NULL', ['asset']);
    if (!assetFolderCheck || assetFolderCheck.length === 0) {
      await query(`
        INSERT INTO asset_folders (id, name, description, project_id, is_system)
        VALUES (?, ?, ?, ?, ?)
      `, ['folder-asset-system', 'asset', 'Folder untuk asset public yang dapat diakses semua project', null, 1]);
      console.log('Created default "asset" folder');
    }
    
    // Create default "templates" folder if it doesn't exist (system folder)
    const templatesFolderCheck: any = await query('SELECT * FROM asset_folders WHERE name = ? AND project_id IS NULL', ['templates']);
    if (!templatesFolderCheck || templatesFolderCheck.length === 0) {
      await query(`
        INSERT INTO asset_folders (id, name, description, project_id, is_system)
        VALUES (?, ?, ?, ?, ?)
      `, ['folder-templates-system', 'templates', 'Folder untuk asset templates yang dapat diakses semua project', null, 1]);
      console.log('Created default "templates" folder');
    }

    // Files table (renamed from images to support all file types)
    // Tidak menggunakan FOREIGN KEY constraint agar file bisa disimpan tanpa project_id (untuk media library global)
    await query(`
      CREATE TABLE IF NOT EXISTS files (
        id VARCHAR(255) PRIMARY KEY,
        project_id VARCHAR(255),
        folder_id VARCHAR(255),
        url TEXT NOT NULL,
        filename TEXT,
        size INT,
        mime_type TEXT,
        file_type TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Add folder_id column if not exists
    await addColumnIfNotExists('files', 'folder_id', 'VARCHAR(255)');

    // Keep images table for backward compatibility
    await query(`
      CREATE TABLE IF NOT EXISTS images (
        id VARCHAR(255) PRIMARY KEY,
        project_id VARCHAR(255),
        url TEXT NOT NULL,
        filename TEXT,
        size INT,
        mime_type TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      )
    `);

    // Settings table
    await query(`
      CREATE TABLE IF NOT EXISTS settings (
        \`key\` VARCHAR(255) PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Themes table untuk menyimpan tema sebagai JSON
    await query(`
      CREATE TABLE IF NOT EXISTS themes (
        id VARCHAR(255) PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        theme_data LONGTEXT NOT NULL,
        preview_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Message templates table untuk plugin Kirim Instan
    await query(`
      CREATE TABLE IF NOT EXISTS message_templates (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        template TEXT NOT NULL,
        is_default TINYINT(1) DEFAULT 0,
        project_id VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Guest list table untuk plugin Daftar Undangan
    await query(`
      CREATE TABLE IF NOT EXISTS guest_list (
        id VARCHAR(255) PRIMARY KEY,
        project_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        email VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pending',
        qr_code TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // CSS customizations table untuk plugin CSS Editor
    await query(`
      CREATE TABLE IF NOT EXISTS css_customizations (
        id VARCHAR(255) PRIMARY KEY,
        project_id VARCHAR(255) NOT NULL,
        block_id VARCHAR(255),
        css_code LONGTEXT,
        is_global TINYINT(1) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Insert default message template (hanya satu default)
    const defaultTemplatesCheck: any = await query('SELECT * FROM message_templates WHERE is_default = 1');
    if (!defaultTemplatesCheck || defaultTemplatesCheck.length === 0) {
      await query(`
        INSERT INTO message_templates (id, name, template, is_default, project_id)
        VALUES (?, ?, ?, ?, ?)
      `, [
        'template-default-1', 
        'Template Undangan Default', 
        'Halo {{nama}}! Kami mengundang Anda untuk menghadiri acara kami. Silakan klik link berikut untuk melihat undangan: {{link}}', 
        1, 
        null
      ]);
    }

    console.log('Database initialized successfully');
  } catch (error: any) {
    // Don't throw if it's just a duplicate column error
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('Database initialized (some columns already exist, this is normal)');
      return;
    }
    console.error('Database initialization error:', error);
    throw error;
  }
}

// Import generateSlug from utils (moved to avoid client-side import issues)
import { generateSlug } from './utils';

// Project operations
export const projectDb = {
  create: async (id: string, title: string, blocks: any[], description?: string, url?: string, thumbnail?: string, slug?: string, canvasBackground?: string, coverImage?: string, coverButtonText?: string, coverEnabled?: boolean, musicUrl?: string) => {
    // Pastikan blocks adalah array yang valid
    const blocksArray = Array.isArray(blocks) ? blocks : [];
    const blocksJson = JSON.stringify(blocksArray);
    
    // Generate slug from title if not provided
    let projectSlug = slug || generateSlug(title);
    
    // Pastikan slug unik - jika slug sudah ada, tambahkan suffix
    let finalSlug = projectSlug;
    let counter = 1;
    while (true) {
      const existing = await query('SELECT id FROM projects WHERE slug = ?', [finalSlug]);
      if (!existing || existing.length === 0) {
        break; // Slug unik, bisa digunakan
      }
      // Slug sudah ada, tambahkan counter
      finalSlug = `${projectSlug}-${counter}`;
      counter++;
      // Safety check - maksimal 1000 percobaan
      if (counter > 1000) {
        // Jika masih ada duplikat setelah 1000 percobaan, tambahkan timestamp
        finalSlug = `${projectSlug}-${Date.now()}`;
        break;
      }
    }
    
    console.log('Creating project in database:', {
      id,
      title,
      slug: finalSlug,
      originalSlug: projectSlug,
      blocksCount: blocksArray.length,
      blocksJsonLength: blocksJson.length
    });
    
    await query(`
      INSERT INTO projects (id, title, blocks, description, url, thumbnail, slug, canvasBackground, coverImage, coverButtonText, coverEnabled, musicUrl, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [id, title, blocksJson, description || null, url || null, thumbnail || null, finalSlug, canvasBackground || null, coverImage || null, coverButtonText || 'Buka Undangan', coverEnabled ? 1 : 0, musicUrl || null]);
    
    console.log('Project created successfully in database');
    
    return { id, title, blocks: blocksArray, description, url, thumbnail, slug: finalSlug, canvasBackground, coverImage, coverButtonText: coverButtonText || 'Buka Undangan', coverEnabled: coverEnabled || false, musicUrl: musicUrl || null };
  },

  update: async (id: string, title: string, blocks: any[], description?: string, url?: string, thumbnail?: string, slug?: string, canvasBackground?: string, coverImage?: string, coverButtonText?: string, coverEnabled?: boolean, musicUrl?: string) => {
    // Pastikan blocks adalah array yang valid
    const blocksArray = Array.isArray(blocks) ? blocks : [];
    const blocksJson = JSON.stringify(blocksArray);
    
    // Generate slug from title if not provided, or use existing slug if title hasn't changed
    let projectSlug = slug;
    if (!projectSlug) {
      // Get existing project to check if title changed
      const existing = await projectDb.get(id);
      if (existing && existing.title === title && existing.slug) {
        projectSlug = existing.slug;
      } else {
        projectSlug = generateSlug(title);
      }
    }
    
    // Debug: Log image blocks to check content and styles
    const imageBlocks = blocksArray.filter((b: any) => b && b.type === 'image');
    if (imageBlocks.length > 0) {
      console.log('Image blocks being updated in database:', imageBlocks.map((b: any) => ({
        id: b.id,
        content: b.content,
        hasContent: !!b.content,
        hasTransform: !!(b.styles && b.styles.transform),
        transform: b.styles?.transform,
        hasStyles: !!b.styles,
        stylesKeys: b.styles ? Object.keys(b.styles) : []
      })));
    }
    
    console.log('Updating project in database:', {
      id,
      title,
      slug: projectSlug,
      blocksCount: blocksArray.length,
      imageBlocksCount: imageBlocks.length,
      hasCanvasBackground: !!canvasBackground,
      blocksJsonLength: blocksJson.length
    });
    
    await query(`
      UPDATE projects 
      SET title = ?, blocks = ?, description = ?, url = ?, thumbnail = ?, slug = ?, canvasBackground = ?, coverImage = ?, coverButtonText = ?, coverEnabled = ?, musicUrl = ?, updated_at = NOW()
      WHERE id = ?
    `, [title, blocksJson, description || null, url || null, thumbnail || null, projectSlug, canvasBackground || null, coverImage || null, coverButtonText || 'Buka Undangan', coverEnabled ? 1 : 0, musicUrl || null, id]);
    
    console.log('Project updated successfully in database');
    
    return { id, title, blocks: blocksArray, description, url, thumbnail, slug: projectSlug, canvasBackground, coverImage, coverButtonText: coverButtonText || 'Buka Undangan', coverEnabled: coverEnabled || false, musicUrl: musicUrl || null };
  },

  get: async (id: string) => {
    const results: any = await query('SELECT * FROM projects WHERE id = ?', [id]);
    const row = results[0];
    if (row) {
      let blocks = [];
      try {
        // Pastikan blocks adalah string JSON yang valid
        if (typeof row.blocks === 'string') {
          blocks = JSON.parse(row.blocks);
        } else if (Array.isArray(row.blocks)) {
          blocks = row.blocks;
        } else {
          console.warn('Blocks is not a string or array:', typeof row.blocks);
          blocks = [];
        }
        
        // Pastikan hasil parse adalah array
        if (!Array.isArray(blocks)) {
          console.warn('Parsed blocks is not an array:', blocks);
          blocks = [];
        }
      } catch (e) {
        console.error('Error parsing blocks JSON:', e);
        blocks = [];
      }
      
      // Debug: Log image blocks to check content and styles
      const imageBlocks = blocks.filter((b: any) => b && b.type === 'image');
      if (imageBlocks.length > 0) {
        console.log('Image blocks retrieved from database:', imageBlocks.map((b: any) => ({
          id: b.id,
          content: b.content,
          hasContent: !!b.content,
          hasTransform: !!(b.styles && b.styles.transform),
          transform: b.styles?.transform,
          hasStyles: !!b.styles,
          stylesKeys: b.styles ? Object.keys(b.styles) : []
        })));
      }
      
      console.log('Retrieved project from database:', {
        id: row.id,
        title: row.title,
        slug: row.slug,
        blocksCount: blocks.length,
        imageBlocksCount: imageBlocks.length
      });
      
      return {
        ...row,
        blocks,
        published: Boolean(row.published),
        canvasBackground: row.canvasBackground || null,
        coverImage: row.coverImage || null,
        coverButtonText: row.coverButtonText || 'Buka Undangan',
        coverEnabled: Boolean(row.coverEnabled),
        musicUrl: row.musicUrl || null,
      };
    }
    console.warn('Project not found in database:', id);
    return null;
  },

  getBySlug: async (slug: string) => {
    const results: any = await query('SELECT * FROM projects WHERE slug = ?', [slug]);
    const row = results[0];
    if (row) {
      let blocks = [];
      try {
        // Pastikan blocks adalah string JSON yang valid
        if (typeof row.blocks === 'string') {
          blocks = JSON.parse(row.blocks);
        } else if (Array.isArray(row.blocks)) {
          blocks = row.blocks;
        } else {
          console.warn('Blocks is not a string or array:', typeof row.blocks);
          blocks = [];
        }
        
        // Pastikan hasil parse adalah array
        if (!Array.isArray(blocks)) {
          console.warn('Parsed blocks is not an array:', blocks);
          blocks = [];
        }
      } catch (e) {
        console.error('Error parsing blocks JSON:', e);
        blocks = [];
      }
      
      console.log('Retrieved project by slug from database:', {
        id: row.id,
        title: row.title,
        slug: row.slug,
        blocksCount: blocks.length
      });
      
      return {
        ...row,
        blocks,
        published: Boolean(row.published),
        canvasBackground: row.canvasBackground || null,
        coverImage: row.coverImage || null,
        coverButtonText: row.coverButtonText || 'Buka Undangan',
        coverEnabled: Boolean(row.coverEnabled),
      };
    }
    console.warn('Project not found by slug in database:', slug);
    return null;
  },

  getAll: async () => {
    const results: any = await query('SELECT * FROM projects ORDER BY updated_at DESC');
    return results.map((row: any) => ({
      ...row,
      blocks: JSON.parse(row.blocks),
      published: Boolean(row.published),
    }));
  },

  publish: async (id: string, publishedUrl: string) => {
    await query(`
      UPDATE projects 
      SET published = 1, published_url = ?, updated_at = NOW()
      WHERE id = ?
    `, [publishedUrl, id]);
    return { id, publishedUrl };
  },

  unpublish: async (id: string) => {
    await query(`
      UPDATE projects 
      SET published = 0, published_url = NULL, updated_at = NOW()
      WHERE id = ?
    `, [id]);
    return { id };
  },

  delete: async (id: string) => {
    await query('DELETE FROM projects WHERE id = ?', [id]);
    return { id };
  },
};

// Asset Folder operations
export const folderDb = {
  create: async (id: string, name: string, projectId?: string, description?: string) => {
    await query(`
      INSERT INTO asset_folders (id, name, description, project_id)
      VALUES (?, ?, ?, ?)
    `, [id, name, description || null, projectId || null]);
    return { id, name, description, projectId };
  },

  getAll: async (projectId?: string) => {
    // Return folder global (project_id IS NULL) DAN folder project-specific
    // Jadi user bisa lihat semua folder: global + milik project
    if (projectId) {
      const results: any = await query(
        'SELECT * FROM asset_folders WHERE project_id = ? OR project_id IS NULL ORDER BY name ASC',
        [projectId]
      );
      console.log(`Loaded folders for project ${projectId}:`, results.length);
      return results;
    }
    // Jika tidak ada projectId, return semua folder global
    const results: any = await query('SELECT * FROM asset_folders WHERE project_id IS NULL ORDER BY name ASC');
    console.log('Loaded global folders:', results.length);
    return results;
  },

  get: async (id: string) => {
    const results: any = await query('SELECT * FROM asset_folders WHERE id = ?', [id]);
    return results[0] || null;
  },

  update: async (id: string, name: string, description?: string) => {
    await query(`
      UPDATE asset_folders 
      SET name = ?, description = ?, updated_at = NOW()
      WHERE id = ?
    `, [name, description || null, id]);
    return { id, name, description };
  },

  delete: async (id: string) => {
    // Check if folder is system folder (cannot be deleted)
    const folder: any = await query('SELECT * FROM asset_folders WHERE id = ?', [id]);
    if (folder && folder.length > 0 && folder[0].is_system) {
      throw new Error('Folder sistem tidak dapat dihapus');
    }
    // Set folder_id to null for files in this folder
    await query('UPDATE files SET folder_id = NULL WHERE folder_id = ?', [id]);
    await query('DELETE FROM asset_folders WHERE id = ?', [id]);
    return { id };
  },
};

// File operations (supports all file types)
export const fileDb = {
  create: async (id: string, url: string, projectId?: string, filename?: string, size?: number, mimeType?: string, fileType?: string, folderId?: string) => {
    await query(`
      INSERT INTO files (id, project_id, folder_id, url, filename, size, mime_type, file_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, projectId || null, folderId || null, url, filename || null, size || null, mimeType || null, fileType || null]);
    return { id, url, projectId, folderId, filename, size, mimeType, fileType };
  },

  getAll: async (folderId?: string) => {
    if (folderId) {
      const results: any = await query('SELECT * FROM files WHERE folder_id = ? ORDER BY created_at DESC', [folderId]);
      return results;
    }
    // Return all files without folder_id (including public assets without project_id)
    // This includes files with project_id = NULL (public assets) and files with project_id (project-specific)
    const results: any = await query('SELECT * FROM files WHERE folder_id IS NULL ORDER BY created_at DESC');
    return results;
  },

  getByProject: async (projectId: string, folderId?: string) => {
    if (folderId) {
      const results: any = await query(
        'SELECT * FROM files WHERE project_id = ? AND folder_id = ? ORDER BY created_at DESC',
        [projectId, folderId]
      );
      return results;
    }
    const results: any = await query(
      'SELECT * FROM files WHERE project_id = ? AND (folder_id IS NULL OR folder_id = ?) ORDER BY created_at DESC',
      [projectId, folderId || null]
    );
    return results;
  },

  getByFolder: async (folderId: string) => {
    const results: any = await query('SELECT * FROM files WHERE folder_id = ? ORDER BY created_at DESC', [folderId]);
    return results;
  },

  update: async (id: string, updates: { folder_id?: string | null; url?: string }) => {
    const updatesList: string[] = [];
    const values: any[] = [];
    
    if (updates.folder_id !== undefined) {
      updatesList.push('folder_id = ?');
      values.push(updates.folder_id);
    }
    
    if (updates.url !== undefined) {
      updatesList.push('url = ?');
      values.push(updates.url);
    }
    
    if (updatesList.length === 0) {
      return { id };
    }
    
    values.push(id);
    const sql = `UPDATE files SET ${updatesList.join(', ')} WHERE id = ?`;
    await query(sql, values);
    return { id, ...updates };
  },

  delete: async (id: string) => {
    await query('DELETE FROM files WHERE id = ?', [id]);
    return { id };
  },
};

// Image operations (for backward compatibility)
export const imageDb = {
  create: async (id: string, url: string, projectId?: string, filename?: string, size?: number, mimeType?: string) => {
    await query(`
      INSERT INTO images (id, project_id, url, filename, size, mime_type)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [id, projectId || null, url, filename || null, size || null, mimeType || null]);
    return { id, url, projectId, filename, size, mimeType };
  },

  getByProject: async (projectId: string) => {
    const results: any = await query('SELECT * FROM images WHERE project_id = ?', [projectId]);
    return results;
  },

  delete: async (id: string) => {
    await query('DELETE FROM images WHERE id = ?', [id]);
    return { id };
  },
};

// Settings operations
export const settingsDb = {
  get: async (key: string) => {
    const results: any = await query('SELECT value FROM settings WHERE `key` = ?', [key]);
    return results[0] ? results[0].value : null;
  },

  set: async (key: string, value: string) => {
    await query(`
      INSERT INTO settings (\`key\`, value, updated_at)
      VALUES (?, ?, NOW())
      ON DUPLICATE KEY UPDATE value = ?, updated_at = NOW()
    `, [key, value, value]);
    return { key, value };
  },
};

// Message Templates operations untuk plugin Kirim Instan
export const templateDb = {
  create: async (id: string, name: string, template: string, is_default: number = 0, project_id: string | null = null) => {
    await query(`
      INSERT INTO message_templates (id, name, template, is_default, project_id, updated_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `, [id, name, template, is_default, project_id]);
    return { id, name, template, is_default, project_id };
  },

  update: async (id: string, name: string, template: string, is_default: number = 0) => {
    await query(`
      UPDATE message_templates 
      SET name = ?, template = ?, is_default = ?, updated_at = NOW()
      WHERE id = ?
    `, [name, template, is_default, id]);
    return { id, name, template, is_default };
  },

  get: async (id: string) => {
    const results: any = await query('SELECT * FROM message_templates WHERE id = ?', [id]);
    const row = results[0];
    if (row) {
      return {
        id: row.id,
        name: row.name,
        template: row.template,
        is_default: Boolean(row.is_default),
        project_id: row.project_id,
        created_at: row.created_at,
        updated_at: row.updated_at,
      };
    }
    return null;
  },

  getAll: async (projectId?: string) => {
    let results: any;
    if (projectId) {
      results = await query(
        'SELECT * FROM message_templates WHERE project_id = ? OR project_id IS NULL ORDER BY is_default DESC, created_at DESC',
        [projectId]
      );
    } else {
      results = await query('SELECT * FROM message_templates ORDER BY is_default DESC, created_at DESC');
    }
    return results.map((row: any) => ({
      id: row.id,
      name: row.name,
      template: row.template,
      is_default: Boolean(row.is_default),
      project_id: row.project_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));
  },

  getDefault: async () => {
    const results: any = await query('SELECT * FROM message_templates WHERE is_default = 1 LIMIT 1');
    if (results && results.length > 0) {
      const row = results[0];
      return {
        id: row.id,
        name: row.name,
        template: row.template,
        is_default: Boolean(row.is_default),
        project_id: row.project_id,
        created_at: row.created_at,
        updated_at: row.updated_at,
      };
    }
    return null;
  },

  delete: async (id: string) => {
    const template: any = await query('SELECT is_default FROM message_templates WHERE id = ?', [id]);
    if (template && template.length > 0 && template[0].is_default) {
      throw new Error('Cannot delete default template');
    }
    await query('DELETE FROM message_templates WHERE id = ?', [id]);
    return { id };
  },
};

// Guest List operations untuk plugin Daftar Undangan
export const guestDb = {
  create: async (id: string, project_id: string, name: string, phone?: string, email?: string, status: string = 'pending', qr_code?: string, notes?: string) => {
    await query(`
      INSERT INTO guest_list (id, project_id, name, phone, email, status, qr_code, notes, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [id, project_id, name, phone || null, email || null, status, qr_code || null, notes || null]);
    return { id, project_id, name, phone, email, status, qr_code, notes };
  },

  update: async (id: string, name?: string, phone?: string, email?: string, status?: string, qr_code?: string, notes?: string) => {
    const updates: string[] = [];
    const values: any[] = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }
    if (qr_code !== undefined) {
      updates.push('qr_code = ?');
      values.push(qr_code);
    }
    if (notes !== undefined) {
      updates.push('notes = ?');
      values.push(notes);
    }

    if (updates.length === 0) {
      return await guestDb.get(id);
    }

    updates.push('updated_at = NOW()');
    values.push(id);

    await query(`UPDATE guest_list SET ${updates.join(', ')} WHERE id = ?`, values);
    return await guestDb.get(id);
  },

  get: async (id: string) => {
    const results: any = await query('SELECT * FROM guest_list WHERE id = ?', [id]);
    const row = results[0];
    if (row) {
      return {
        id: row.id,
        project_id: row.project_id,
        name: row.name,
        phone: row.phone,
        email: row.email,
        status: row.status,
        qr_code: row.qr_code,
        notes: row.notes,
        created_at: row.created_at,
        updated_at: row.updated_at,
      };
    }
    return null;
  },

  getAll: async (projectId: string) => {
    const results: any = await query('SELECT * FROM guest_list WHERE project_id = ? ORDER BY created_at DESC', [projectId]);
    return results.map((row: any) => ({
      id: row.id,
      project_id: row.project_id,
      name: row.name,
      phone: row.phone,
      email: row.email,
      status: row.status,
      qr_code: row.qr_code,
      notes: row.notes,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));
  },

  delete: async (id: string) => {
    await query('DELETE FROM guest_list WHERE id = ?', [id]);
    return { id };
  },
};

// CSS Customizations operations untuk plugin CSS Editor
export const cssDb = {
  create: async (id: string, project_id: string, css_code: string, block_id?: string, is_global: number = 0) => {
    await query(`
      INSERT INTO css_customizations (id, project_id, block_id, css_code, is_global, updated_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `, [id, project_id, block_id || null, css_code, is_global]);
    return { id, project_id, block_id, css_code, is_global: Boolean(is_global) };
  },

  update: async (id: string, css_code: string, block_id?: string, is_global?: number) => {
    const updates: string[] = ['css_code = ?'];
    const values: any[] = [css_code];

    if (block_id !== undefined) {
      updates.push('block_id = ?');
      values.push(block_id);
    }
    if (is_global !== undefined) {
      updates.push('is_global = ?');
      values.push(is_global);
    }

    updates.push('updated_at = NOW()');
    values.push(id);

    await query(`UPDATE css_customizations SET ${updates.join(', ')} WHERE id = ?`, values);
    return await cssDb.get(id);
  },

  get: async (id: string) => {
    const results: any = await query('SELECT * FROM css_customizations WHERE id = ?', [id]);
    const row = results[0];
    if (row) {
      return {
        id: row.id,
        project_id: row.project_id,
        block_id: row.block_id,
        css_code: row.css_code,
        is_global: Boolean(row.is_global),
        created_at: row.created_at,
        updated_at: row.updated_at,
      };
    }
    return null;
  },

  getByProject: async (projectId: string) => {
    const results: any = await query('SELECT * FROM css_customizations WHERE project_id = ? ORDER BY is_global DESC, created_at DESC', [projectId]);
    return results.map((row: any) => ({
      id: row.id,
      project_id: row.project_id,
      block_id: row.block_id,
      css_code: row.css_code,
      is_global: Boolean(row.is_global),
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));
  },

  getGlobal: async (projectId: string) => {
    const results: any = await query('SELECT * FROM css_customizations WHERE project_id = ? AND is_global = 1 LIMIT 1', [projectId]);
    if (results && results.length > 0) {
      const row = results[0];
      return {
        id: row.id,
        project_id: row.project_id,
        block_id: row.block_id,
        css_code: row.css_code,
        is_global: Boolean(row.is_global),
        created_at: row.created_at,
        updated_at: row.updated_at,
      };
    }
    return null;
  },

  getByBlock: async (projectId: string, blockId: string) => {
    const results: any = await query('SELECT * FROM css_customizations WHERE project_id = ? AND block_id = ? LIMIT 1', [projectId, blockId]);
    if (results && results.length > 0) {
      const row = results[0];
      return {
        id: row.id,
        project_id: row.project_id,
        block_id: row.block_id,
        css_code: row.css_code,
        is_global: Boolean(row.is_global),
        created_at: row.created_at,
        updated_at: row.updated_at,
      };
    }
    return null;
  },

  delete: async (id: string) => {
    await query('DELETE FROM css_customizations WHERE id = ?', [id]);
    return { id };
  },
};

// Theme operations (menyimpan tema sebagai JSON)
export const themeDb = {
  create: async (id: string, name: string, themeData: string, description?: string, previewUrl?: string) => {
    await query(`
      INSERT INTO themes (id, name, description, theme_data, preview_url, updated_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `, [id, name, description || null, themeData, previewUrl || null]);
    return { id, name, description, themeData, previewUrl };
  },

  update: async (id: string, name: string, themeData: string, description?: string, previewUrl?: string) => {
    await query(`
      UPDATE themes 
      SET name = ?, description = ?, theme_data = ?, preview_url = ?, updated_at = NOW()
      WHERE id = ?
    `, [name, description || null, themeData, previewUrl || null, id]);
    return { id, name, description, themeData, previewUrl };
  },

  get: async (id: string) => {
    const results: any = await query('SELECT * FROM themes WHERE id = ?', [id]);
    const row = results[0];
    if (row) {
      return {
        ...row,
        themeData: row.theme_data,
        previewUrl: row.preview_url,
      };
    }
    return null;
  },

  getAll: async () => {
    const results: any = await query('SELECT * FROM themes ORDER BY updated_at DESC');
    return results.map((row: any) => ({
      ...row,
      themeData: row.theme_data,
      previewUrl: row.preview_url,
    }));
  },

  delete: async (id: string) => {
    await query('DELETE FROM themes WHERE id = ?', [id]);
    return { id };
  },
};

// Initialize on import (server-side only) - hanya sekali
let initialized = false;
let initPromise: Promise<void> | null = null;

if (typeof window === 'undefined' && !initialized && !initPromise) {
  initPromise = initDatabase()
    .then(() => {
      initialized = true;
      initPromise = null;
    })
    .catch((error) => {
      console.error('Database initialization error:', error);
      initPromise = null;
    });
}

export const ensureInitialized = async () => {
  if (initialized) return;
  if (initPromise) {
    await initPromise;
    return;
  }
  if (typeof window === 'undefined') {
    initPromise = initDatabase()
      .then(() => {
        initialized = true;
        initPromise = null;
      })
      .catch((error) => {
        console.error('Database initialization error:', error);
        initPromise = null;
      });
    await initPromise;
  }
};

export default pool;
