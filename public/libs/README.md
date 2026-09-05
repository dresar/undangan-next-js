# Local Resources Directory

Directory ini berisi file JavaScript dan CSS yang di-download dari CDN untuk digunakan dalam export HTML.

## Download Resources

Jalankan script berikut untuk mengunduh semua resources:

```bash
npm run download-resources
```

Atau secara manual:

```bash
node scripts/download-resources.js
```

## Resources yang akan di-download:

1. **GSAP** (Animation Library)
   - gsap.min.js
   - ScrollTrigger.min.js

2. **AOS** (Animate On Scroll)
   - aos.css
   - aos.js

3. **Particles.js** (Background Effects)
   - particles.min.js

4. **Lottie** (JSON Animations)
   - lottie.min.js

5. **Font Awesome** (Icons)
   - font-awesome.min.css

6. **Google Fonts** (Fonts)
   - google-fonts.css

## Catatan

- Pastikan folder `public/libs` sudah dibuat sebelum menjalankan script
- File-file ini akan digunakan dalam export HTML untuk membuat undangan yang standalone
- Jika ada update versi library, jalankan ulang script download

