'use client';

import { Block } from '@/types/block';

interface RenderBlockProps {
  blockId: string;
  blocks: Block[];
}

/**
 * Pure read-only recursive block renderer for preview/public pages.
 * No editing logic, no selection, no drag/resize - just clean HTML rendering.
 */
export default function RenderBlock({ blockId, blocks }: RenderBlockProps) {
  const block = blocks.find(b => b.id === blockId);
  
  if (!block) {
    return null;
  }

  // Get child blocks if this is a container
  const childBlocks = block.type === 'container' && block.children
    ? blocks.filter(b => block.children.includes(b.id))
    : [];

  // Base style object - merge block.styles with position/size if needed
  const baseStyle: React.CSSProperties = {
    ...block.styles,
  };

  // Handle background gradient
  const styles = block.styles as any;
  if (styles.backgroundGradient && styles.backgroundGradient !== '') {
    baseStyle.background = styles.backgroundGradient;
  }

  // Handle position and size for absolute positioned blocks
  if (block.position) {
    baseStyle.position = 'absolute';
    baseStyle.left = `${block.position.x}px`;
    baseStyle.top = `${block.position.y}px`;
  }

  if (block.size) {
    if (typeof block.size.width === 'number') {
      baseStyle.width = `${block.size.width}px`;
    } else if (typeof block.size.width === 'string') {
      baseStyle.width = block.size.width;
    }
    
    if (typeof block.size.height === 'number') {
      baseStyle.height = `${block.size.height}px`;
    } else if (typeof block.size.height === 'string') {
      baseStyle.height = block.size.height;
    }
  }

  // Render based on block type
  switch (block.type) {
    case 'container': {
      return (
        <div style={baseStyle}>
          {childBlocks.length > 0 ? (
            childBlocks.map((childBlock) => (
              <RenderBlock
                key={childBlock.id}
                blockId={childBlock.id}
                blocks={blocks}
              />
            ))
          ) : (
            <div style={{ 
              padding: '20px', 
              textAlign: 'center', 
              color: '#999',
              minHeight: '100px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {/* Empty container - no placeholder in preview */}
            </div>
          )}
        </div>
      );
    }

    case 'text': {
      // Determine if content is HTML or plain text
      const content = block.content || '';
      const isHTML = typeof content === 'string' && (
        content.includes('<') || content.includes('&lt;')
      );

      // Determine tag based on styles or content
      let Tag: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' = 'div';
      const fontSize = styles.fontSize;
      if (fontSize) {
        const size = typeof fontSize === 'string' 
          ? parseInt(fontSize.replace('px', '')) 
          : fontSize;
        if (size >= 32) Tag = 'h1';
        else if (size >= 28) Tag = 'h2';
        else if (size >= 24) Tag = 'h3';
        else if (size >= 20) Tag = 'h4';
        else if (size >= 18) Tag = 'h5';
        else if (size >= 16) Tag = 'h6';
        else Tag = 'p';
      }

      return (
        <Tag
          style={baseStyle}
          dangerouslySetInnerHTML={isHTML ? { __html: content } : undefined}
        >
          {!isHTML && content}
        </Tag>
      );
    }

    case 'image': {
      const imageSrc = block.content || '';
      const altText = styles.alt || 'Image';

      return (
        <img
          src={imageSrc}
          alt={altText}
          style={{
            ...baseStyle,
            maxWidth: '100%',
            height: 'auto',
            display: 'block',
          }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src !== '/media/default/image-placeholder.svg') {
              target.src = '/media/default/image-placeholder.svg';
            }
          }}
        />
      );
    }

    case 'video': {
      const videoUrl = block.content || '';
      
      // Check if it's YouTube, Vimeo, or direct video URL
      const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
      const isVimeo = videoUrl.includes('vimeo.com');
      const isDirectVideo = videoUrl.match(/\.(mp4|webm|ogg)$/i);

      if (isYouTube || isVimeo) {
        // Embed as iframe
        let embedUrl = '';
        if (isYouTube) {
          const videoId = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1] || '';
          embedUrl = `https://www.youtube.com/embed/${videoId}`;
        } else if (isVimeo) {
          const videoId = videoUrl.match(/vimeo\.com\/(\d+)/)?.[1] || '';
          embedUrl = `https://player.vimeo.com/video/${videoId}`;
        }

        return (
          <div style={{ ...baseStyle, position: 'relative', paddingTop: '56.25%' }}>
            <iframe
              src={embedUrl}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none',
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      } else if (isDirectVideo) {
        // Direct video file
        return (
          <video
            src={videoUrl}
            controls
            style={{
              ...baseStyle,
              maxWidth: '100%',
              height: 'auto',
              display: 'block',
            }}
          />
        );
      } else {
        // Fallback: try to render as video
        return (
          <video
            src={videoUrl}
            controls
            style={{
              ...baseStyle,
              maxWidth: '100%',
              height: 'auto',
              display: 'block',
            }}
          />
        );
      }
    }

    case 'button': {
      const buttonText = typeof block.content === 'string' ? block.content : 'Button';
      const buttonUrl = styles.href || styles.url || '#';
      const isLink = buttonUrl && buttonUrl !== '#';

      if (isLink) {
        return (
          <a
            href={buttonUrl}
            style={{
              ...baseStyle,
              textDecoration: 'none',
              display: 'inline-block',
              cursor: 'pointer',
            }}
          >
            {buttonText}
          </a>
        );
      } else {
        return (
          <button
            type="button"
            style={{
              ...baseStyle,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {buttonText}
          </button>
        );
      }
    }

    default:
      // Fallback for unknown types - render as div with content
      return (
        <div style={baseStyle}>
          {typeof block.content === 'string' ? block.content : JSON.stringify(block.content)}
        </div>
      );
  }
}

