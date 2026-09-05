'use client';

import React, { useState } from 'react';
import { Block } from '@/types/block';
import { PropertySection, PropertyLabel, PropertyInput, PropertyNote } from '../shared/styled';
import { Slider } from '../shared/Slider';

interface VideoPropertiesProps {
  block: Block;
  updateStyle: (key: string, value: any) => void;
  updateContent: (value: any) => void;
}

export const VideoProperties: React.FC<VideoPropertiesProps> = ({
  block,
  updateStyle,
  updateContent,
}) => {
  const videoUrl = typeof block.content === 'string' ? block.content : '';

  return (
    <>
      <PropertySection>
        <PropertyLabel style={{ color: '#ff4444' }}>*URL Video</PropertyLabel>
        <PropertyInput
          type="url"
          value={videoUrl}
          onChange={(e) => updateContent(e.target.value)}
          placeholder="https://youtube.com/watch?v=... atau URL video lainnya"
        />
        <PropertyNote>
          Masukkan URL video dari YouTube, Vimeo, atau hosting video lainnya
        </PropertyNote>
      </PropertySection>

      <PropertySection>
        <PropertyLabel>Width (Lebar)</PropertyLabel>
        <PropertyInput
          type="text"
          value={(block.styles as any).width || '100%'}
          onChange={(e) => updateStyle('width', e.target.value)}
          placeholder="100% atau 600px"
        />
        <PropertyNote>
          Lebar video player
        </PropertyNote>
      </PropertySection>

      <PropertySection>
        <PropertyLabel>Height (Tinggi)</PropertyLabel>
        <PropertyInput
          type="text"
          value={(block.styles as any).height || 'auto'}
          onChange={(e) => updateStyle('height', e.target.value)}
          placeholder="auto atau 400px"
        />
        <PropertyNote>
          Tinggi video player (auto = proporsional 16:9)
        </PropertyNote>
      </PropertySection>
    </>
  );
};

