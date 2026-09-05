import { Block } from '@/types/block';

interface HTMLExportOptions {
  blocks: Block[];
  sectionOrder?: string[];
  canvasBackground?: string;
  coverImage?: string;
  coverButtonText?: string;
  coverEnabled?: boolean;
  musicUrl?: string;
  customCSS?: string;
  title?: string;
}

function blockStylesToCSS(styles: any): string {
  if (!styles || typeof styles !== 'object') return '';
  
  const cssProps: string[] = [];
  
  Object.keys(styles).forEach(key => {
      const value = styles[key];
      if (value !== undefined && value !== null && value !== '') {
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      cssProps.push(`${cssKey}: ${value};`);
    }
  });
  
  return cssProps.join(' ');
}

function generateBlockHTML(block: Block, allBlocks: Block[]): string {
  const styles = block.styles || {};
  const position = block.position;
  const size = block.size;
  
  let styleString = blockStylesToCSS(styles);
  
  if (position) {
    styleString += ` position: absolute; left: ${position.x}px; top: ${position.y}px;`;
  } else {
    styleString += ` position: relative;`;
  }
  
  if (size?.width) {
    const width = typeof size.width === 'number' ? `${size.width}px` : size.width;
    styleString += ` width: ${width};`;
  }
  if (size?.height) {
    const height = typeof size.height === 'number' ? `${size.height}px` : size.height;
    styleString += ` height: ${height};`;
  }
  
  if (styles.transform) {
    styleString += ` transform: ${styles.transform};`;
  }
  
  const blockClass = `block-${block.id.replace(/[^a-zA-Z0-9]/g, '-')}`;
  
  if (block.type === 'section') {
    const children = block.children || [];
    const childBlocks = allBlocks.filter(b => children.includes(b.id) && b.type !== 'container');
    const imageBlocks = childBlocks.filter(b => b.type === 'image');
    const nonImageBlocks = childBlocks.filter(b => b.type !== 'image');
    
    let containerContent = '';
    if (nonImageBlocks.length > 0) {
      containerContent += nonImageBlocks.map(child => generateBlockHTML(child, allBlocks)).join('\n');
    }
    
    if (imageBlocks.length > 0) {
      containerContent += `<div style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:5;overflow:visible;pointer-events:none;"><div style="position:relative;width:100%;height:100%;pointer-events:auto;">${imageBlocks.map(child => generateBlockHTML(child, allBlocks)).join('\n')}</div></div>`;
    }
    
    if (!containerContent) {
      containerContent = '<div style="min-height:100px;padding:20px;text-align:center;color:#9ca3af;">Drop disini</div>';
    }
    
    const containerStyles = (block.styles as any)?.containerStyles || {};
    const containerStyle = blockStylesToCSS(containerStyles);
    const sectionStyle = styleString + ' overflow: hidden; position: relative;';
    return `<section class="${blockClass}" style="${sectionStyle}"><div class="container-${block.id.replace(/[^a-zA-Z0-9]/g, '-')}" style="${containerStyle}">${containerContent}</div></section>`;
  }
  
  if (block.type === 'container') {
    const children = block.children || [];
    const childBlocks = allBlocks.filter(b => children.includes(b.id));
    const childrenHTML = childBlocks.map(child => generateBlockHTML(child, allBlocks)).join('\n');
    const containerStyle = styleString;
    return `<div class="${blockClass}" style="${containerStyle}">${childrenHTML}</div>`;
  }
  
  let content = '';
  
  switch (block.type) {
    case 'text':
      content = typeof block.content === 'string' ? block.content : '';
      return `<div class="${blockClass}" style="${styleString}">${content}</div>`;
    
    case 'image':
      let imageSrc = block.content || '/media/default/image-placeholder.svg';
      if (imageSrc.startsWith('/')) {
        imageSrc = imageSrc;
      } else if (!imageSrc.startsWith('http') && !imageSrc.startsWith('data:')) {
        imageSrc = '/' + imageSrc;
      }
      
      const altText = styles.alt || 'Invitation image';
      const objectFit = styles.objectFit || 'cover';
      const objectPosition = styles.objectPosition || 'center';
      const borderRadius = styles.borderRadius || '0px';
      
      return `<div class="${blockClass}" style="${styleString}"><img src="${imageSrc}" alt="${altText}" style="width:100%;height:auto;object-fit:${objectFit};object-position:${objectPosition};border-radius:${borderRadius};display:block;" onerror="this.src='/media/default/image-placeholder.svg'"></div>`;
    
    case 'button':
      const buttonContent = typeof block.content === 'string' ? block.content : 'Button';
      const buttonBg = styles.backgroundGradient || styles.backgroundColor || '#007bff';
      const buttonColor = styles.color || '#ffffff';
      const buttonPadding = styles.padding || '12px 24px';
      const buttonBorderRadius = styles.borderRadius || '8px';
      return `<div class="${blockClass}" style="${styleString}"><button style="background:${buttonBg};color:${buttonColor};padding:${buttonPadding};border-radius:${buttonBorderRadius};border:none;cursor:pointer;width:100%">${buttonContent}</button></div>`;
    
    case 'spacer':
      const spacerHeight = size?.height || styles.height || '40px';
      return `<div class="${blockClass}" style="${styleString} height: ${spacerHeight};"></div>`;
    
    case 'shape':
      const shapeContent = block.content || '';
      return `<div class="${blockClass}" style="${styleString}">${shapeContent}</div>`;
    
    default:
      return `<div class="${blockClass}" style="${styleString}">${block.content || ''}</div>`;
  }
}

export function generateHTML(options: HTMLExportOptions): string {
  const {
    blocks,
    sectionOrder = [],
    canvasBackground,
    coverImage,
    coverButtonText = 'Buka Undangan',
    coverEnabled = false,
    musicUrl,
    customCSS = '',
    title = 'Digital Invitation'
  } = options;
  
  let sections: Block[];
  if (sectionOrder.length > 0) {
    sections = sectionOrder
      .map(id => blocks.find(b => b.id === id))
      .filter((b): b is Block => b !== undefined && b.type === 'section' && !b.parentId);
  } else {
    sections = blocks.filter(b => b.type === 'section' && !b.parentId);
  }
  
  const blocksHTML = sections.map(section => generateBlockHTML(section, blocks)).join('\n');
  
  let coverHTML = '';
  if (coverEnabled && coverImage) {
    let coverImgSrc = coverImage;
    if (coverImgSrc.startsWith('/')) {
      coverImgSrc = coverImgSrc;
    } else if (!coverImgSrc.startsWith('http') && !coverImgSrc.startsWith('data:')) {
      coverImgSrc = '/' + coverImgSrc;
    }
    
    coverHTML = `<div id="cover-overlay" style="position:fixed;top:0;left:0;width:100%;height:100vh;background:rgba(0,0,0,0.95);z-index:9999;display:flex;align-items:center;justify-content:center;"><div style="text-align:center;"><img src="${coverImgSrc}" alt="Cover" style="max-width:90%;max-height:70vh;border-radius:12px;margin-bottom:20px;"><button id="cover-button" style="padding:16px 48px;font-size:18px;font-weight:600;background:linear-gradient(90deg,#007bff,#ff6b35);color:#fff;border:none;border-radius:8px;cursor:pointer;">${coverButtonText}</button></div></div><script>(function(){const c=sessionStorage.getItem('coverOpened');if(c==='true'){document.getElementById('cover-overlay').style.display='none';}else{document.getElementById('cover-button').addEventListener('click',function(){sessionStorage.setItem('coverOpened','true');document.getElementById('cover-overlay').style.display='none';});}})();</script>`;
  }
  
  let audioHTML = '';
  if (musicUrl) {
    let audioSrc = musicUrl;
    if (audioSrc.startsWith('/')) {
      audioSrc = audioSrc;
    } else if (!audioSrc.startsWith('http') && !audioSrc.startsWith('data:')) {
      audioSrc = '/' + audioSrc;
    }
    audioHTML = `<audio id="bg-music" src="${audioSrc}" loop style="display:none;"></audio><script>(function(){const a=document.getElementById('bg-music');if(a){a.muted=true;a.play().catch(function(){});}})();</script>`;
  }
  
  let bgUrl = '';
  if (canvasBackground) {
    if (canvasBackground.startsWith('/')) {
      bgUrl = canvasBackground;
    } else if (!canvasBackground.startsWith('http') && !canvasBackground.startsWith('data:')) {
      bgUrl = '/' + canvasBackground;
    } else {
      bgUrl = canvasBackground;
    }
  }
  
  const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no">
<title>${title}</title>
<link rel="stylesheet" href="/libs/aos.css">
<link rel="stylesheet" href="/libs/google-fonts.css">
<style>
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}html,body{margin:0;padding:0;width:100%;overflow-x:hidden;-webkit-text-size-adjust:100%;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,'Fira Sans','Droid Sans','Helvetica Neue',sans-serif}#preview-container{width:100%;max-width:375px;min-height:100vh;background-color:#fff;position:relative;margin:0 auto;overflow:hidden;overflow-x:hidden;overflow-y:auto;-webkit-overflow-scrolling:touch;transform:translateZ(0);-webkit-transform:translateZ(0);will-change:scroll-position;backface-visibility:hidden;-webkit-backface-visibility:hidden}@media (max-width:375px){#preview-container{max-width:100%}}@media (min-width:376px){#preview-container{box-shadow:0 4px 20px rgba(0,0,0,0.1);border-radius:8px}}img{max-width:100%;height:auto;display:block;border:none;image-rendering:-webkit-optimize-contrast;image-rendering:crisp-edges}video,iframe{max-width:100%;height:auto}html{scroll-behavior:smooth}p,h1,h2,h3,h4,h5,h6,span,div{text-rendering:optimizeLegibility;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}*{transition:opacity .3s ease,transform .3s ease}@keyframes fadeIn{from{opacity:0}to{opacity:1}}#preview-container{animation:fadeIn .5s ease-in-out}${customCSS}
</style>
</head>
<body>
${coverHTML}${audioHTML}
<div id="preview-container" style="background-image:${bgUrl ? `url(${bgUrl})` : 'none'};background-size:${bgUrl ? 'cover' : 'auto'};background-position:${bgUrl ? 'center' : '0 0'};background-repeat:${bgUrl ? 'no-repeat' : 'repeat'}">
${blocksHTML}
</div>
<script src="/libs/gsap.min.js"></script>
<script src="/libs/aos.js"></script>
<script>if(typeof AOS!=='undefined'){AOS.init({duration:800,easing:'ease-in-out',once:true,offset:100})}if(typeof gsap!=='undefined'&&typeof ScrollTrigger!=='undefined'){gsap.registerPlugin(ScrollTrigger)}</script>
</body>
</html>`;
  
  return html;
}

export function downloadHTML(html: string, filename: string = 'invitation.html') {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

