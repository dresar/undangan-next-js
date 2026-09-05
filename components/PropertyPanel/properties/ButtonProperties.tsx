'use client';

import React from 'react';
import { Block } from '@/types/block';
import { PropertySection, PropertyLabel, PropertyInput, PropertySelect, PropertyNote } from '../shared/styled';
import { Slider } from '../shared/Slider';
import { FONTS } from '../shared/constants';
import { useEditorStore } from '@/store/useEditorStore';

interface ButtonPropertiesProps {
  block: Block;
  updateStyle: (key: string, value: any) => void;
  updateContent: (value: any) => void;
}

export const ButtonProperties: React.FC<ButtonPropertiesProps> = ({
  block,
  updateStyle,
  updateContent,
}) => {
  const updateBlock = useEditorStore((state) => state.updateBlock);
  const buttonText = typeof block.content === 'string' ? block.content : 'Button';
  const isCoverButton = (block as any).isCoverButton || false;
  const styles = block.styles as any;

  return (
    <>
      <PropertySection>
        <PropertyLabel style={{ color: '#ff4444' }}>*Text Tombol</PropertyLabel>
        <PropertyInput
          type="text"
          value={buttonText}
          onChange={(e) => updateContent(e.target.value)}
          placeholder="Button"
        />
        <PropertyNote>
          Masukkan teks untuk tombol
        </PropertyNote>
      </PropertySection>

      <PropertySection>
        <PropertyLabel style={{ color: '#ff4444' }}>*Font Family</PropertyLabel>
        <PropertySelect
          value={block.styles.fontFamily || 'Roboto, sans-serif'}
          onChange={(e) => updateStyle('fontFamily', e.target.value)}
        >
          {FONTS.map((font) => (
            <option key={font.value} value={font.value}>
              {font.name}
            </option>
          ))}
        </PropertySelect>
        <PropertyNote style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
          Pilih jenis font untuk tombol
        </PropertyNote>
      </PropertySection>

      <PropertySection>
        <Slider
          label="Font Size"
          value={parseInt((block.styles.fontSize as string)?.replace('px', '') || '16') || 16}
          onChange={(v) => updateStyle('fontSize', `${v}px`)}
          min={10}
          max={48}
        />
        <PropertyNote style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
          Ukuran font tombol (akan otomatis menyesuaikan saat button di-resize)
        </PropertyNote>
      </PropertySection>

      <PropertySection>
        <PropertyLabel>Bold Font</PropertyLabel>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#ccc' }}>
          <input
            type="checkbox"
            checked={styles.fontWeight === 'bold' || styles.fontWeight === '700'}
            onChange={(e) => {
              updateStyle('fontWeight', e.target.checked ? 'bold' : 'normal');
            }}
            style={{ width: '16px', height: '16px' }}
          />
          <span>Buat teks menjadi tebal</span>
        </label>
      </PropertySection>

      <PropertySection>
        <PropertyLabel>Jadikan Cover Button</PropertyLabel>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#ccc' }}>
          <input
            type="checkbox"
            checked={isCoverButton}
            onChange={(e) => {
              updateBlock(block.id, {
                ...block,
                isCoverButton: e.target.checked,
              } as any);
            }}
            style={{ width: '16px', height: '16px' }}
          />
          <span>Tombol ini akan membuka undangan (seperti cover)</span>
        </label>
        <PropertyNote style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
          Jika diaktifkan, tombol ini akan berfungsi sebagai cover. Undangan hanya akan terbuka setelah tombol diklik.
        </PropertyNote>
      </PropertySection>
    </>
  );
};
