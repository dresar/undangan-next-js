import { Block } from '@/types/block';

/**
 * Interface untuk struktur tema yang akan di-export/import
 */
export interface ThemeData {
  version: string;
  name: string;
  description?: string;
  metadata: {
    exportedAt: string;
    exportedBy?: string;
    appVersion?: string;
  };
  canvas: {
    background?: string;
    deviceView?: 'mobile' | 'tablet' | 'desktop';
  };
  blocks: Block[];
}

/**
 * Validasi struktur tema
 */
export function validateThemeData(data: any): data is ThemeData {
  if (!data || typeof data !== 'object') {
    return false;
  }

  // Validasi version
  if (!data.version || typeof data.version !== 'string') {
    return false;
  }

  // Validasi name
  if (!data.name || typeof data.name !== 'string') {
    return false;
  }

  // Validasi metadata
  if (!data.metadata || typeof data.metadata !== 'object') {
    return false;
  }

  if (!data.metadata.exportedAt || typeof data.metadata.exportedAt !== 'string') {
    return false;
  }

  // Validasi canvas
  if (!data.canvas || typeof data.canvas !== 'object') {
    return false;
  }

  // Validasi blocks (harus array)
  if (!Array.isArray(data.blocks)) {
    return false;
  }

  // Validasi setiap block
  for (const block of data.blocks) {
    if (!block.id || !block.type) {
      return false;
    }
    // Content bisa berupa string, object, atau array
    if (block.content === undefined || block.content === null) {
      return false;
    }
  }

  return true;
}

/**
 * Export tema ke JSON
 */
export function exportThemeToJSON(
  blocks: Block[],
  canvasBackground?: string,
  deviceView?: 'mobile' | 'tablet' | 'desktop',
  name: string = 'Untitled Theme',
  description?: string
): string {
  const themeData: ThemeData = {
    version: '1.0.0',
    name,
    description,
    metadata: {
      exportedAt: new Date().toISOString(),
      appVersion: '1.0.0',
    },
    canvas: {
      background: canvasBackground,
      deviceView: deviceView || 'mobile',
    },
    blocks: blocks.map((block) => {
      // Pastikan semua data bisa di-serialize termasuk position dan size
      const serializedBlock: Block = {
        ...block,
        content: typeof block.content === 'string' 
          ? block.content 
          : JSON.parse(JSON.stringify(block.content)),
        styles: JSON.parse(JSON.stringify(block.styles || {})),
        position: block.position ? JSON.parse(JSON.stringify(block.position)) : undefined,
        size: block.size ? JSON.parse(JSON.stringify(block.size)) : undefined,
        animation: block.animation ? JSON.parse(JSON.stringify(block.animation)) : undefined,
        customCSS: block.customCSS || undefined,
        locked: block.locked || false,
      };
      return serializedBlock;
    }),
  };

  return JSON.stringify(themeData, null, 2);
}

/**
 * Import tema dari JSON
 */
export function importThemeFromJSON(jsonString: string): {
  blocks: Block[];
  canvasBackground?: string;
  deviceView?: 'mobile' | 'tablet' | 'desktop';
  name: string;
  description?: string;
} {
  try {
    const parsed = JSON.parse(jsonString);

    if (!validateThemeData(parsed)) {
      throw new Error('Format tema tidak valid. Pastikan file JSON sesuai dengan struktur yang benar.');
    }

    // Generate ID baru untuk setiap block untuk menghindari konflik
    // Pastikan semua data termasuk position dan size dimuat dengan benar
    const blocks: Block[] = parsed.blocks.map((block: Block) => ({
      ...block,
      id: `${block.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      position: block.position ? { ...block.position } : undefined,
      size: block.size ? { ...block.size } : undefined,
      styles: block.styles ? { ...block.styles } : {},
      animation: block.animation ? { ...block.animation } : undefined,
      customCSS: block.customCSS || undefined,
      locked: block.locked || false,
    }));

    return {
      blocks,
      canvasBackground: parsed.canvas.background,
      deviceView: parsed.canvas.deviceView || 'mobile',
      name: parsed.name,
      description: parsed.description,
    };
  } catch (error: any) {
    if (error instanceof SyntaxError) {
      throw new Error('File JSON tidak valid. Pastikan format JSON benar.');
    }
    throw error;
  }
}

/**
 * Download tema sebagai file JSON
 */
export function downloadThemeAsJSON(
  blocks: Block[],
  canvasBackground?: string,
  deviceView?: 'mobile' | 'tablet' | 'desktop',
  name: string = 'theme'
): void {
  const jsonString = exportThemeToJSON(blocks, canvasBackground, deviceView, name);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Baca file JSON dari input file
 */
export function readThemeFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        if (!content) {
          reject(new Error('File kosong'));
          return;
        }
        resolve(content);
      } catch (error) {
        reject(new Error('Gagal membaca file'));
      }
    };
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsText(file);
  });
}

