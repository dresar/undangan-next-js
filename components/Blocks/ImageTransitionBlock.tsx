'use client';

import styled from 'styled-components';
import { Block } from '@/types/block';
import { useState, useEffect } from 'react';

const TransitionContainer = styled.div`
  position: relative;
  width: 100%;
  height: 300px;
  overflow: hidden;
  border-radius: 4px;
`;

const TransitionImage = styled.img<{ $active: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: ${(props) => (props.$active ? 1 : 0)};
  transition: opacity 1s ease-in-out;
`;

interface ImageTransitionBlockProps {
  block: Block;
}

export default function ImageTransitionBlock({ block }: ImageTransitionBlockProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const content = typeof block.content === 'object' && block.content !== null 
    ? block.content 
    : { images: [], interval: 3000 };
  
  const images = Array.isArray(content.images) ? content.images : [];
  const interval = content.interval || 3000;

  useEffect(() => {
    if (images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, interval]);

  return (
    <TransitionContainer style={block.styles}>
      {images.map((img: string, index: number) => (
        <TransitionImage
          key={index}
          src={img}
          alt={`Transition ${index + 1}`}
          $active={currentIndex === index}
        />
      ))}
      {images.length === 0 && (
        <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
          Tambahkan gambar untuk image transition
        </div>
      )}
    </TransitionContainer>
  );
}

