'use client';

import styled from 'styled-components';
import { Block } from '@/types/block';
import { useEditorStore } from '@/store/useEditorStore';
import { useEffect, useRef } from 'react';

const MasonryContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 8px;
  width: 100%;
`;

const MasonryItem = styled.img`
  width: 100%;
  height: auto;
  border-radius: 4px;
  object-fit: cover;
`;

interface MasonryBlockProps {
  block: Block;
}

export default function MasonryBlock({ block }: MasonryBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const images = Array.isArray(block.content) ? block.content : [];

  return (
    <MasonryContainer ref={containerRef} style={block.styles}>
      {images.map((img: string, index: number) => (
        <MasonryItem key={index} src={img} alt={`Masonry ${index + 1}`} />
      ))}
      {images.length === 0 && (
        <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
          Tambahkan gambar untuk masonry
        </div>
      )}
    </MasonryContainer>
  );
}

