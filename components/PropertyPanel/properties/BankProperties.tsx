'use client';

import React, { useMemo, useCallback } from 'react';
import { Block } from '@/types/block';
import { PropertySection, PropertyLabel, PropertyInput, PropertyNote } from '../shared/styled';

interface BankPropertiesProps {
  block: Block;
  updateStyle: (key: string, value: any) => void;
  updateContent: (value: any) => void;
}

export const BankProperties: React.FC<BankPropertiesProps> = ({
  block,
  updateStyle,
  updateContent,
}) => {
  const content = useMemo(() => {
    return typeof block.content === 'object' && block.content !== null
      ? block.content
      : { name: 'Bank BCA', account: '1234567890', holder: 'Nama Pemilik' };
  }, [block.content]);

  const handleContentUpdate = useCallback((key: string, value: string) => {
    const currentContent = typeof block.content === 'object' && block.content !== null
      ? block.content
      : { name: 'Bank BCA', account: '1234567890', holder: 'Nama Pemilik' };
    
    const newContent = {
      ...currentContent,
      [key]: value,
    };
    updateContent(newContent);
  }, [block.content, updateContent]);

  return (
    <>
      <PropertySection>
        <PropertyLabel style={{ color: '#ff4444' }}>*Nama Bank</PropertyLabel>
        <PropertyInput
          type="text"
          value={content.name || 'Bank BCA'}
          onChange={(e) => handleContentUpdate('name', e.target.value)}
          placeholder="Bank BCA"
        />
      </PropertySection>

      <PropertySection>
        <PropertyLabel style={{ color: '#ff4444' }}>*No. Rekening</PropertyLabel>
        <PropertyInput
          type="text"
          value={content.account || '1234567890'}
          onChange={(e) => handleContentUpdate('account', e.target.value)}
          placeholder="1234567890"
        />
      </PropertySection>

      <PropertySection>
        <PropertyLabel style={{ color: '#ff4444' }}>*Atas Nama</PropertyLabel>
        <PropertyInput
          type="text"
          value={content.holder || 'Nama Pemilik'}
          onChange={(e) => handleContentUpdate('holder', e.target.value)}
          placeholder="Nama Pemilik"
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
              background: (block.styles as any).backgroundColor || '#f8f9fa',
              border: '2px solid #4a4a4a',
            }}
          />
          <button
            onClick={() => {
              const colorInput = document.createElement('input');
              colorInput.type = 'color';
              colorInput.value = (block.styles as any).backgroundColor || '#f8f9fa';
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
    </>
  );
};

