'use client';

import React, { useMemo, useCallback } from 'react';
import { Block } from '@/types/block';
import { PropertySection, PropertyLabel, PropertyInput, PropertyNote } from '../shared/styled';
import { Slider } from '../shared/Slider';

interface GiftPropertiesProps {
  block: Block;
  updateStyle: (key: string, value: any) => void;
  updateContent: (value: any) => void;
}

export const GiftProperties: React.FC<GiftPropertiesProps> = ({
  block,
  updateStyle,
  updateContent,
}) => {
  const content = useMemo(() => {
    return typeof block.content === 'object' && block.content !== null
      ? block.content
      : { title: 'Kirim Hadiah', description: 'Kirim hadiah untuk pasangan', buttonText: 'Lihat Detail' };
  }, [block.content]);

  const handleContentUpdate = useCallback((key: string, value: string) => {
    const currentContent = typeof block.content === 'object' && block.content !== null
      ? block.content
      : { title: 'Kirim Hadiah', description: 'Kirim hadiah untuk pasangan', buttonText: 'Lihat Detail' };
    
    const newContent = {
      ...currentContent,
      [key]: value,
    };
    updateContent(newContent);
  }, [block.content, updateContent]);

  return (
    <>
      <PropertySection>
        <PropertyLabel style={{ color: '#ff4444' }}>*Judul</PropertyLabel>
        <PropertyInput
          type="text"
          value={content.title || 'Kirim Hadiah'}
          onChange={(e) => handleContentUpdate('title', e.target.value)}
          placeholder="Kirim Hadiah"
        />
      </PropertySection>

      <PropertySection>
        <PropertyLabel>Deskripsi</PropertyLabel>
        <PropertyInput
          type="text"
          value={content.description || 'Kirim hadiah untuk pasangan'}
          onChange={(e) => handleContentUpdate('description', e.target.value)}
          placeholder="Kirim hadiah untuk pasangan"
        />
      </PropertySection>

      <PropertySection>
        <PropertyLabel>Text Tombol</PropertyLabel>
        <PropertyInput
          type="text"
          value={content.buttonText || 'Lihat Detail'}
          onChange={(e) => handleContentUpdate('buttonText', e.target.value)}
          placeholder="Lihat Detail"
        />
      </PropertySection>

      <PropertySection>
        <PropertyLabel>Background Color</PropertyLabel>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: (block.styles as any).background || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: '2px solid #4a4a4a',
            }}
          />
          <button
            onClick={() => {
              const colorInput = document.createElement('input');
              colorInput.type = 'color';
              colorInput.value = '#667eea';
              colorInput.onchange = (e: any) => updateStyle('background', e.target.value);
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
    </>
  );
};

