'use client';

import styled from 'styled-components';
import { Block } from '@/types/block';
import { useState } from 'react';

const GalleryContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  width: 100%;
`;

const GalleryItem = styled.div<{ $active: boolean }>`
  position: relative;
  width: 100%;
  padding-top: 75%;
  overflow: hidden;
  border-radius: 4px;
  cursor: pointer;
  border: ${(props) => (props.$active ? '2px solid #007bff' : '2px solid transparent')};
  
  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

interface GalleryBlockProps {
  block: Block;
}

export default function GalleryBlock({ block }: GalleryBlockProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const images = Array.isArray(block.content) ? block.content : [];

  return (
    <GalleryContainer style={block.styles}>
      {images.map((img: string, index: number) => (
        <GalleryItem
          key={index}
          $active={selectedIndex === index}
          onClick={() => setSelectedIndex(index)}
        >
          <img src={img} alt={`Gallery ${index + 1}`} />
        </GalleryItem>
      ))}
      {images.length === 0 && (
        <div style={{ padding: '20px', textAlign: 'center', color: '#999', gridColumn: '1 / -1' }}>
          Tambahkan gambar untuk gallery
        </div>
      )}
    </GalleryContainer>
  );
}

