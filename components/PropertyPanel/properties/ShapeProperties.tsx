'use client';

import React from 'react';
import { Block } from '@/types/block';
import { PropertySection, PropertyLabel, PropertySelect, PropertyNote } from '../shared/styled';
import { Slider } from '../shared/Slider';

interface ShapePropertiesProps {
  block: Block;
  updateStyle: (key: string, value: any) => void;
  updateContent: (value: any) => void;
}

export const ShapeProperties: React.FC<ShapePropertiesProps> = ({
  block,
  updateStyle,
  updateContent,
}) => {
  const shape = block.content || 'rectangle';
  
  const extractStyleNumber = (value: any, defaultValue: number = 0): number => {
    if (!value) return defaultValue;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const numStr = value.replace(/px|%|em|rem/g, '').trim();
      const num = parseFloat(numStr);
      return isNaN(num) ? defaultValue : num;
    }
    return defaultValue;
  };

  const borderRadius = extractStyleNumber(block.styles.borderRadius, 0);

  return (
    <>
      <PropertySection>
        <PropertyLabel style={{ color: '#ff4444' }}>*Bentuk Shape</PropertyLabel>
        <PropertySelect
          value={shape}
          onChange={(e) => updateContent(e.target.value)}
        >
          <option value="rectangle">Rectangle (Persegi)</option>
          <option value="circle">Circle (Lingkaran)</option>
          <option value="rounded">Rounded (Persegi Lengkung)</option>
        </PropertySelect>
        <PropertyNote>
          Pilih bentuk dasar shape
        </PropertyNote>
      </PropertySection>

      <PropertySection>
        <PropertyLabel>Background Color</PropertyLabel>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: (block.styles as any).backgroundColor || '#007bff',
              border: '2px solid #4a4a4a',
            }}
          />
          <button
            onClick={() => {
              const colorInput = document.createElement('input');
              colorInput.type = 'color';
              colorInput.value = (block.styles as any).backgroundColor || '#007bff';
              colorInput.onchange = (e: any) => updateStyle('backgroundColor', e.target.value);
              colorInput.click();
            }}
            style={{
              padding: '8px 16px',
              background: '#ff6b35',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            ✏️ Ubah Warna
          </button>
        </div>
      </PropertySection>

      <PropertySection>
        <Slider
          label="Width"
          value={extractStyleNumber(block.styles.width, 100)}
          onChange={(v) => updateStyle('width', `${v}px`)}
          min={50}
          max={500}
        />
      </PropertySection>

      <PropertySection>
        <Slider
          label="Height"
          value={extractStyleNumber(block.styles.height, 100)}
          onChange={(v) => updateStyle('height', `${v}px`)}
          min={50}
          max={500}
        />
      </PropertySection>

      <PropertySection>
        <Slider
          label="Border Radius"
          value={borderRadius}
          onChange={(v) => updateStyle('borderRadius', `${v}px`)}
          min={0}
          max={100}
        />
        <PropertyNote>
          Membuat sudut shape menjadi lengkung (0px = persegi, 50px+ = bulat)
        </PropertyNote>
      </PropertySection>
    </>
  );
};

