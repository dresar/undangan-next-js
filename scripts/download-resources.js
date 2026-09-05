/**
 * Script untuk download CDN resources ke public/libs
 * Jalankan dengan: node scripts/download-resources.js
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const publicLibsDir = path.join(__dirname, '..', 'public', 'libs');

// Create libs directory if not exists
if (!fs.existsSync(publicLibsDir)) {
  fs.mkdirSync(publicLibsDir, { recursive: true });
}

const resources = [
  // GSAP
  {
    url: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js',
    filename: 'gsap.min.js'
  },
  {
    url: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js',
    filename: 'ScrollTrigger.min.js'
  },
  // AOS
  {
    url: 'https://unpkg.com/aos@2.3.1/dist/aos.css',
    filename: 'aos.css'
  },
  {
    url: 'https://unpkg.com/aos@2.3.1/dist/aos.js',
    filename: 'aos.js'
  },
  // Particles.js
  {
    url: 'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js',
    filename: 'particles.min.js'
  },
  // Lottie
  {
    url: 'https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.12.2/lottie.min.js',
    filename: 'lottie.min.js'
  },
  // Font Awesome
  {
    url: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    filename: 'font-awesome.min.css'
  },
  // Google Fonts (we'll create a local CSS file)
  {
    url: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Poppins:wght@300;400;500;600;700;800;900&family=Roboto:wght@300;400;500;700;800;900&family=Open+Sans:wght@300;400;600;700;800;900&family=Montserrat:wght@300;400;500;600;700;800;900&family=Lato:wght@300;400;700;800;900&family=Raleway:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;700;800;900&family=Dancing+Script:wght@400;700;800;900&family=Great+Vibes&family=Pacifico&family=Satisfy&family=Kalam:wght@300;400;700;800;900&family=Caveat:wght@400;700;800;900&family=Alex+Brush&family=Allura&family=Berkshire+Swash&family=Cormorant+Garamond:wght@300;400;500;600;700&family=Parisienne&family=Qwigley&display=swap',
    filename: 'google-fonts.css'
  }
];

function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const file = fs.createWriteStream(filepath);
    
    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirect
        return downloadFile(response.headers.location, filepath)
          .then(resolve)
          .catch(reject);
      }
      
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(filepath);
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      reject(err);
    });
  });
}

async function downloadAll() {
  console.log('Downloading resources to public/libs...\n');
  
  for (const resource of resources) {
    const filepath = path.join(publicLibsDir, resource.filename);
    
    try {
      console.log(`Downloading ${resource.filename}...`);
      await downloadFile(resource.url, filepath);
      console.log(`✓ ${resource.filename} downloaded\n`);
    } catch (error) {
      console.error(`✗ Failed to download ${resource.filename}:`, error.message);
    }
  }
  
  console.log('Download complete!');
}

downloadAll();

