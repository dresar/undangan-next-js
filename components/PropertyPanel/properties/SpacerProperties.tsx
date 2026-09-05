'use client';

import React from 'react';
import { Block } from '@/types/block';
import { PropertySection, PropertyLabel, PropertyNote } from '../shared/styled';
import { Slider } from '../shared/Slider';

interface SpacerPropertiesProps {
  block: Block;
  updateStyle: (key: string, value: any) => void;
  updateContent: (value: any) => void;
}

export const SpacerProperties: React.FC<SpacerPropertiesProps> = ({
  block,
  updateStyle,
  updateContent,
}) => {
  const content = typeof block.content === 'object' && block.content !== null
    ? block.content
    : { height: 40 };
  
  const height = content.height || 40;

  const handleHeightChange = (value: number) => {
    updateContent({ height: value });
  };

  return (
    <>
      <PropertySection>
        <PropertyLabel style={{ color: '#ff4444' }}>*Tinggi Spacer</PropertyLabel>
        <Slider
          label="Height (px)"
          value={height}
          onChange={handleHeightChange}
          min={10}
          max={500}
        />
        <PropertyNote>
          Jarak vertikal kosong untuk memisahkan elemen
        </PropertyNote>
      </PropertySection>
    </>
  );
};

