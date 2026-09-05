'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Block } from '@/types/block';
import styled from 'styled-components';
import TextBlock from '@/components/Blocks/TextBlock';
import ImageBlock from '@/components/Blocks/ImageBlock';
import VideoBlock from '@/components/Blocks/VideoBlock';
import MapBlock from '@/components/Blocks/MapBlock';
import CountdownBlock from '@/components/Blocks/CountdownBlock';
import ButtonBlock from '@/components/Blocks/ButtonBlock';
import ShapeBlock from '@/components/Blocks/ShapeBlock';
import SpacerBlock from '@/components/Blocks/SpacerBlock';
import MasonryBlock from '@/components/Blocks/MasonryBlock';
import GalleryBlock from '@/components/Blocks/GalleryBlock';
import ImageTransitionBlock from '@/components/Blocks/ImageTransitionBlock';
import FormBlock from '@/components/Blocks/FormBlock';
import IconBlock from '@/components/Blocks/IconBlock';
import BankBlock from '@/components/Blocks/BankBlock';
import GiftBlock from '@/components/Blocks/GiftBlock';
import Cover from '@/components/Cover';
import FloatingButtons from '@/components/FloatingButtons';

// Container yang sama dengan canvas - fixed width 375px untuk mobile
const PreviewContainer = styled.div`
  width: 375px;
  min-height: 100vh;
  background-color: #ffffff;
  position: relative;
  margin: 0 auto;
  overflow: hidden;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  
  /* Enhanced rendering for better performance */
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
  will-change: scroll-position;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  
  /* Mobile: full width, desktop: centered dengan shadow */
  @media (max-width: 375px) {
    max-width: 100%;
  }
  
  @media (min-width: 376px) {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
  }
  
  /* Ensure all children respect container width */
  * {
    box-sizing: border-box;
  }
  
  /* Smooth fade-in animation */
  animation: fadeIn 0.5s ease-in-out;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

// Preview wrapper untuk block - sama persis dengan Rnd tapi tanpa drag/resize
const PreviewBlockWrapper = ({ block, children }: { block: Block; children: React.ReactNode }) => {
  const defaultPosition = block.position || { x: 0, y: 0 };
  const defaultSize = block.size || { width: 'auto', height: 'auto' };

  const getNumericSize = () => {
    let width: number | string;
    let height: number | string;

    if (typeof defaultSize.width === 'number') {
      width = defaultSize.width;
    } else if (typeof defaultSize.width === 'string') {
      if (defaultSize.width === 'auto') {
        width = 'auto';
      } else if (defaultSize.width.includes('%')) {
        const percent = parseFloat(defaultSize.width);
        width = `${(percent / 100) * 375}px`;
      } else {
        width = defaultSize.width;
      }
    } else {
      width = 'auto';
    }

    if (typeof defaultSize.height === 'number') {
      height = defaultSize.height;
    } else if (typeof defaultSize.height === 'string') {
      if (defaultSize.height === 'auto') {
        height = 'auto';
      } else if (defaultSize.height.includes('%')) {
        const percent = parseFloat(defaultSize.height);
        height = `${(percent / 100) * 375}px`;
      } else {
        height = defaultSize.height;
      }
    } else {
      height = 'auto';
    }

    return { width, height };
  };

  const size = getNumericSize();
  const x = typeof defaultPosition.x === 'number' ? defaultPosition.x : parseFloat(String(defaultPosition.x)) || 0;
  const y = typeof defaultPosition.y === 'number' ? defaultPosition.y : parseFloat(String(defaultPosition.y)) || 0;

  const wrapperStyle: React.CSSProperties = {
    position: block.position ? 'absolute' : 'relative',
    left: block.position ? `${x}px` : undefined,
    top: block.position ? `${y}px` : undefined,
    width: typeof size.width === 'number' ? `${size.width}px` : size.width,
    height: typeof size.height === 'number' ? `${size.height}px` : size.height,
    zIndex: 1,
    minWidth: 0,
    minHeight: 0,
  };

  return (
    <div style={wrapperStyle}>
      {children}
    </div>
  );
};

const renderBlock = (block: Block) => {
  // Gunakan komponen yang sama persis dengan canvas
  switch (block.type) {
    case 'text':
      return <TextBlock block={block} />;
    case 'image':
      return <ImageBlock block={block} />;
    case 'video':
      return <VideoBlock block={block} />;
    case 'map':
      return <MapBlock block={block} />;
    case 'countdown':
      return <CountdownBlock block={block} />;
    case 'button':
      return <ButtonBlock block={block} />;
    case 'shape':
      return <ShapeBlock block={block} />;
    case 'spacer':
      return <SpacerBlock block={block} />;
    case 'masonry':
      return <MasonryBlock block={block} />;
    case 'gallery':
      return <GalleryBlock block={block} />;
    case 'imageTransition':
      return <ImageTransitionBlock block={block} />;
    case 'form':
      return <FormBlock block={block} />;
    case 'icon':
      return <IconBlock block={block} />;
    case 'bank':
      return <BankBlock block={block} />;
    case 'gift':
      return <GiftBlock block={block} />;
    default:
      return null;
  }
};

const getAnimationVariants = (animation: any) => {
  if (!animation || animation.type === 'none') {
    return {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
    };
  }

  const duration = (animation.duration || 1000) / 1000;
  const delay = (animation.delay || 0) / 1000;
  const easing = animation.easing || 'ease';

  switch (animation.type) {
    case 'fadeIn':
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration, delay, ease: easing },
      };
    case 'slideIn':
      return {
        initial: { opacity: 0, x: -50 },
        animate: { opacity: 1, x: 0 },
        transition: { duration, delay, ease: easing },
      };
    case 'zoomIn':
      return {
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration, delay, ease: easing },
      };
    case 'bounce':
      return {
        initial: { opacity: 0, y: -50 },
        animate: { opacity: 1, y: 0 },
        transition: { duration, delay, ease: 'easeOut', type: 'spring', stiffness: 200 },
      };
    default:
      return {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
      };
  }
};

export default function PreviewPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coverOpened, setCoverOpened] = useState(false);
  const [customCSS, setCustomCSS] = useState<string>('');
  const [coverButtonOpened, setCoverButtonOpened] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/projects/slug/${slug}?t=${Date.now()}`, {
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (!response.ok) {
          throw new Error('Project not found');
        }

        const data = await response.json();
        
        // Debug: Log image blocks to check content
        if (data.blocks && Array.isArray(data.blocks)) {
          const imageBlocks = data.blocks.filter((b: Block) => b.type === 'image');
          if (imageBlocks.length > 0) {
            console.log('Image blocks loaded from API:', imageBlocks.map((b: Block) => ({
              id: b.id,
              content: b.content,
              hasContent: !!b.content
            })));
          }
        }
        
        setProject(data);

        // Check if cover button was already opened
        const coverButtonOpened = sessionStorage.getItem(`coverButtonOpened_${data.id}`);
        if (coverButtonOpened === 'true') {
          setCoverButtonOpened(true);
        }

        // Load custom CSS if project ID exists
        if (data.id) {
          try {
            const cssResponse = await fetch(`/api/plugins/css?project_id=${data.id}`);
            if (cssResponse.ok) {
              const cssData = await cssResponse.json();
              // Combine all CSS (global + block specific)
              const combinedCSS = cssData
                .map((css: any) => css.css_code)
                .filter((code: string) => code && code.trim())
                .join('\n\n');
              setCustomCSS(combinedCSS);
            }
          } catch (cssErr) {
            console.error('Error loading custom CSS:', cssErr);
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProject();
    }
  }, [slug]);

  // Auto-refresh every 5 seconds for realtime preview
  useEffect(() => {
    if (!slug) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/projects/slug/${slug}?t=${Date.now()}`, {
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        if (response.ok) {
          const data = await response.json();
          setProject((prevProject: any) => {
            if (prevProject && JSON.stringify(prevProject) === JSON.stringify(data)) {
              return prevProject;
            }
            return data;
          });
        }
      } catch (err) {
        // Silent fail for auto-refresh
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [slug]);

  // Initialize AOS and other libraries
  useEffect(() => {
    // Initialize AOS
    if (typeof window !== 'undefined' && (window as any).AOS) {
      (window as any).AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        offset: 100,
      });
    }

    // Ensure GSAP is loaded
    const checkGSAP = () => {
      if (typeof window !== 'undefined' && (window as any).gsap) {
        // GSAP is ready
        return;
      }
      setTimeout(checkGSAP, 100);
    };
    checkGSAP();
  }, []);

  // Set viewport meta tag - must be before conditional returns (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      document.head.appendChild(meta);
    } else {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }
  }, []);

  // Check if cover should be shown on mount - MUST be before conditional returns
  useEffect(() => {
    if (project) {
      const coverOpenedValue = sessionStorage.getItem('coverOpened');
      if (coverOpenedValue === 'true') {
        setCoverOpened(true);
      }
    }
  }, [project]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', color: '#666', marginBottom: '10px' }}>Memuat undangan...</div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', color: '#e74c3c', marginBottom: '10px' }}>
            {error || 'Undangan tidak ditemukan'}
          </div>
        </div>
      </div>
    );
  }

  const blocks = Array.isArray(project.blocks) ? project.blocks : [];
  const canvasBackground = project.canvasBackground || null;
  const coverImage = project.coverImage || '';
  const coverButtonText = project.coverButtonText || 'Buka Undangan';
  const coverEnabled = project.coverEnabled || false;
  
  // Check if there's music from project settings (not from audio block)
  const musicUrl = project.musicUrl || '';
  const hasAudio = !!musicUrl;

  // Find cover button
  const coverButton = blocks.find((b: Block) => b.type === 'button' && (b as any).isCoverButton);

  const handleCoverOpen = () => {
    setCoverOpened(true);
    // Clear sessionStorage untuk reset cover jika diperlukan
    // sessionStorage.removeItem('coverOpened');
  };

  const handleCoverButtonOpen = () => {
    setCoverButtonOpened(true);
    if (project.id) {
      sessionStorage.setItem(`coverButtonOpened_${project.id}`, 'true');
    }
  };

  return (
    <>
      {coverEnabled && coverImage && (
        <Cover
          coverImage={coverImage}
          coverButtonText={coverButtonText}
          coverEnabled={coverEnabled}
          onOpen={handleCoverOpen}
        />
      )}
      
      {/* Cover Button Overlay */}
      {coverButton && !coverButtonOpened && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.95)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '20px',
            pointerEvents: 'auto',
          }}
          onClick={(e) => {
            // Prevent closing when clicking inside the modal
            e.stopPropagation();
          }}
        >
          <div
            style={{
              padding: '20px',
              background: '#ffffff',
              borderRadius: '12px',
              maxWidth: '90%',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#2a2a2a' }}>
              Klik tombol di bawah untuk membuka undangan
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCoverButtonOpen();
              }}
              style={{
                ...coverButton.styles,
                padding: '16px 48px',
                fontSize: '18px',
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                borderRadius: '8px',
                background: (coverButton.styles as any).backgroundGradient || (coverButton.styles as any).backgroundColor || '#007bff',
                color: coverButton.styles.color || '#ffffff',
                fontFamily: coverButton.styles.fontFamily || 'inherit',
              }}
            >
              {coverButton.content || 'Buka Undangan'}
            </button>
          </div>
        </div>
      )}
      
      {/* Hide content when cover button is active */}
      {coverButton && !coverButtonOpened && (
        <style dangerouslySetInnerHTML={{
          __html: `
            body {
              overflow: hidden !important;
            }
          `
        }} />
      )}
      
      {hasAudio && (
        <FloatingButtons 
          hasAudio={hasAudio}
          audioUrl={musicUrl}
        />
      )}
      
      {/* Hidden audio element untuk background music */}
      {hasAudio && (
        <audio
          src={musicUrl}
          loop
          autoPlay
          muted
          style={{ display: 'none' }}
          id="background-music"
        />
      )}
      
      {customCSS && (
        <style dangerouslySetInnerHTML={{ __html: customCSS }} />
      )}
      <style dangerouslySetInnerHTML={{
        __html: `
          * {
            box-sizing: border-box;
            -webkit-tap-highlight-color: transparent;
          }
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            overflow-x: hidden;
            -webkit-text-size-adjust: 100%;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
          }
          img {
            max-width: 100%;
            height: auto;
            display: block;
            border: none;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          }
          video, iframe {
            max-width: 100%;
            height: auto;
          }
          /* Smooth scrolling */
          html {
            scroll-behavior: smooth;
          }
          /* Ensure text alignment works */
          [style*="text-align"] {
            text-align: inherit !important;
          }
          /* Enhanced text rendering */
          p, h1, h2, h3, h4, h5, h6, span, div {
            text-rendering: optimizeLegibility;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          /* Better image quality */
          img {
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
          }
          /* Smooth transitions for all elements */
          * {
            transition: opacity 0.3s ease, transform 0.3s ease;
          }
          /* Responsive untuk mobile */
          @media (max-width: 375px) {
            body {
              width: 100vw;
              overflow-x: hidden;
            }
          }
          /* Loading animation */
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          /* Enhanced block rendering */
          [data-block] {
            will-change: transform, opacity;
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
          }
        `
      }} />
      <PreviewContainer
        style={{
          backgroundImage: canvasBackground 
            ? `url(${canvasBackground})` 
            : undefined,
          backgroundSize: canvasBackground ? 'cover' : undefined,
          backgroundPosition: canvasBackground ? 'center' : undefined,
          backgroundRepeat: canvasBackground ? 'no-repeat' : undefined,
          backgroundColor: canvasBackground ? undefined : '#ffffff',
          display: coverEnabled && !coverOpened ? 'none' : 'block',
          opacity: coverButton && !coverButtonOpened ? 0 : 1,
          pointerEvents: coverButton && !coverButtonOpened ? 'none' : 'auto',
        }}
      >
        {(() => {
          const sectionOrder = project.sectionOrder || [];
          const sections = sectionOrder.length > 0
            ? sectionOrder
                .map((id: string) => blocks.find((b: Block) => b.id === id))
                .filter((b: Block | undefined): b is Block => b !== undefined && b.type === 'section' && !b.parentId)
            : blocks.filter((b: Block) => b.type === 'section' && !b.parentId);

          return sections.map((section: Block) => {
            const sectionClass = `block-${section.id.replace(/[^a-zA-Z0-9]/g, '-')}`;
            const sectionStyles = section.styles || {};
            
            const sectionStyle: React.CSSProperties = {
              width: '100%',
              minHeight: sectionStyles.minHeight || '150px',
              backgroundColor: sectionStyles.backgroundColor || '#ffffff',
              backgroundImage: sectionStyles.backgroundImage ? `url(${sectionStyles.backgroundImage})` : undefined,
              backgroundSize: sectionStyles.backgroundSize || '100% 100%',
              backgroundRepeat: sectionStyles.backgroundRepeat || 'no-repeat',
              position: 'relative',
              overflow: 'hidden',
              display: 'block',
            };

            const containerId = section.children?.[0];
            const container = containerId ? blocks.find((b: Block) => b.id === containerId && b.type === 'container') : null;

            let containerContent: React.ReactNode[] = [];
            if (container) {
              const containerChildren = container.children || [];
              const containerChildBlocks = blocks.filter((b: Block) => containerChildren.includes(b.id));
              const imageBlocks = containerChildBlocks.filter((b: Block) => b.type === 'image');
              const nonImageBlocks = containerChildBlocks.filter((b: Block) => b.type !== 'image');

              containerContent = [
                ...nonImageBlocks.map((child: Block) => (
                  <PreviewBlockWrapper key={child.id} block={child}>
                    {renderBlock(child)}
                  </PreviewBlockWrapper>
                )),
                ...imageBlocks.map((child: Block) => {
                  const defaultPosition = child.position || { x: 0, y: 0 };
                  const defaultSize = child.size || { width: 200, height: 200 };
                  const x = typeof defaultPosition.x === 'number' ? defaultPosition.x : parseFloat(String(defaultPosition.x)) || 0;
                  const y = typeof defaultPosition.y === 'number' ? defaultPosition.y : parseFloat(String(defaultPosition.y)) || 0;
                  const width = typeof defaultSize.width === 'number' ? `${defaultSize.width}px` : (defaultSize.width || '200px');
                  const height = typeof defaultSize.height === 'number' ? `${defaultSize.height}px` : (defaultSize.height || '200px');

                  return (
                    <div
                      key={child.id}
                      style={{
                        position: 'absolute',
                        left: `${x}px`,
                        top: `${y}px`,
                        width,
                        height,
                        zIndex: 5,
                      }}
                    >
                      {renderBlock(child)}
                    </div>
                  );
                }),
              ];
            }

            const containerStyles = container?.styles || {};
            const containerStyle: React.CSSProperties = {
              width: containerStyles.width || '100%',
              maxWidth: containerStyles.maxWidth || '100%',
              margin: containerStyles.margin || '0 auto',
              padding: containerStyles.padding || '20px',
              boxSizing: 'border-box',
              position: 'relative',
              overflow: 'hidden',
              backgroundColor: containerStyles.backgroundColor || undefined,
              backgroundImage: containerStyles.backgroundImage ? `url(${containerStyles.backgroundImage})` : undefined,
              backgroundSize: containerStyles.backgroundSize || 'cover',
              backgroundPosition: containerStyles.backgroundPosition || 'center',
              backgroundRepeat: containerStyles.backgroundRepeat || 'no-repeat',
              minHeight: containerStyles.minHeight || undefined,
              borderRadius: containerStyles.borderRadius || undefined,
              opacity: containerStyles.opacity !== undefined ? containerStyles.opacity : 1,
            };

            return (
              <section key={section.id} className={sectionClass} style={sectionStyle}>
                {section.customCSS && (
                  <style dangerouslySetInnerHTML={{
                    __html: section.customCSS.includes('{') || section.customCSS.includes('}')
                      ? section.customCSS
                      : `.${sectionClass} { ${section.customCSS} }`
                  }} />
                )}
                {container ? (
                  <div style={containerStyle}>
                    {container.customCSS && (
                      <style dangerouslySetInnerHTML={{
                        __html: container.customCSS.includes('{') || container.customCSS.includes('}')
                          ? container.customCSS
                          : `.container-${container.id.replace(/[^a-zA-Z0-9]/g, '-')} { ${container.customCSS} }`
                      }} />
                    )}
                    {containerContent.length > 0 ? containerContent : null}
                  </div>
                ) : null}
              </section>
            );
          });
        })()}
      </PreviewContainer>
    </>
  );
}

