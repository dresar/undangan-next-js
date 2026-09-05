/**
 * Helper functions untuk mengakses file media
 */

/**
 * Mendapatkan URL untuk gambar default
 * @param filename Nama file (dengan atau tanpa path)
 * @returns URL lengkap ke file media default
 */
export function getDefaultMediaUrl(filename: string): string {
  // Jika sudah ada path, gunakan langsung
  if (filename.startsWith('/')) {
    return filename;
  }
  
  // Jika sudah ada /media/, gunakan langsung
  if (filename.startsWith('/media/')) {
    return filename;
  }
  
  // Default: tambahkan path /media/default/
  return `/media/default/${filename}`;
}

/**
 * Mendapatkan URL untuk background default
 * @param filename Nama file background
 * @returns URL lengkap ke background image
 */
export function getDefaultBackgroundUrl(filename: string): string {
  if (filename.startsWith('/')) {
    return filename;
  }
  return `/media/default/backgrounds/${filename}`;
}

/**
 * Mendapatkan URL untuk icon default
 * @param filename Nama file icon
 * @returns URL lengkap ke icon
 */
export function getDefaultIconUrl(filename: string): string {
  if (filename.startsWith('/')) {
    return filename;
  }
  return `/media/default/icons/${filename}`;
}

/**
 * Mendapatkan URL untuk template default
 * @param filename Nama file template
 * @returns URL lengkap ke template image
 */
export function getDefaultTemplateUrl(filename: string): string {
  if (filename.startsWith('/')) {
    return filename;
  }
  return `/media/default/templates/${filename}`;
}

/**
 * Mendapatkan URL untuk file yang diupload
 * @param url URL dari database (bisa berupa path relatif atau data URL)
 * @returns URL lengkap ke file upload
 */
export function getUploadedFileUrl(url: string): string {
  // Jika sudah path relatif, gunakan langsung
  if (url.startsWith('/media/uploads/')) {
    return url;
  }
  
  // Jika sudah path lengkap, gunakan langsung
  if (url.startsWith('/')) {
    return url;
  }
  
  // Jika data URL, return as-is (untuk preview)
  if (url.startsWith('data:')) {
    return url;
  }
  
  // Default: assume it's a filename in uploads
  return `/media/uploads/${url}`;
}

/**
 * List gambar default yang tersedia (untuk preview/selection)
 * Catatan: Ini adalah contoh, sesuaikan dengan file yang ada
 */
export const DEFAULT_MEDIA = {
  backgrounds: [
    'background-1.jpg',
    'background-2.jpg',
    'background-3.jpg',
  ],
  icons: [
    'icon-1.png',
    'icon-2.png',
    'icon-3.png',
  ],
  templates: [
    'template-1.jpg',
    'template-2.jpg',
    'template-3.jpg',
  ],
};

