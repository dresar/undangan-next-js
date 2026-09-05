# Folder Media

Folder ini digunakan untuk menyimpan semua file media (gambar, video, audio, dll) yang digunakan dalam aplikasi.

## Struktur Folder

```
public/media/
├── default/          # Gambar default/template yang bisa digunakan
│   ├── backgrounds/  # Background images default
│   ├── icons/        # Icons default
│   └── templates/    # Template images
├── uploads/          # File yang diupload oleh user (otomatis)
└── README.md         # File ini
```

## Cara Menggunakan

### 1. Menambahkan Gambar Default

1. Masukkan file gambar ke folder `public/media/default/`
2. File dapat diakses melalui URL: `/media/default/nama-file.jpg`
3. Contoh: `/media/default/background-1.jpg`

### 2. Upload File User

File yang diupload oleh user akan disimpan di folder `public/media/uploads/` (jika menggunakan file system storage) atau di database (jika menggunakan base64/data URL).

## Format yang Didukung

- **Gambar**: JPG, PNG, GIF, WebP, SVG
- **Video**: MP4, WebM, MOV
- **Audio**: MP3, WAV, OGG

## Catatan

- Pastikan file tidak terlalu besar untuk performa yang optimal
- Disarankan menggunakan WebP untuk gambar untuk ukuran file yang lebih kecil
- File di folder `default/` dapat diakses langsung melalui URL public

