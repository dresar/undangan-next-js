'use client';

import React from 'react';
import { Block } from '@/types/block';
import { useEditorStore } from '@/store/useEditorStore';
import { PropertySection, PropertyLabel, PropertyTextarea, PropertySelect, PropertyNote } from '../shared/styled';
import { Slider } from '../shared/Slider';
import { FONTS } from '../shared/constants';

interface TextPropertiesProps {
  block: Block;
  updateStyle: (key: string, value: any) => void;
  updateContent: (value: any) => void;
}

export const TextProperties: React.FC<TextPropertiesProps> = ({
  block,
  updateStyle,
  updateContent,
}) => {
  const updateBlock = useEditorStore((state) => state.updateBlock);
  return (
    <>
      <PropertySection>
        <PropertyLabel>Text</PropertyLabel>
        <PropertyTextarea
          value={typeof block.content === 'string' ? block.content : 'Teks disini'}
          onChange={(e) => updateContent(e.target.value)}
          style={{ minHeight: '80px', resize: 'both' }}
        />
        <PropertyNote style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
          Masukkan teks yang ingin ditampilkan
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
          Pilih jenis font untuk teks. Klik{' '}
          <a
            href="https://fonts.google.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#4a9eff', textDecoration: 'underline' }}
          >
            disini
          </a>{' '}
          untuk melihat referensi font
        </PropertyNote>
      </PropertySection>

      <PropertySection>
        <Slider
          label="Font Size"
          value={parseInt((block.styles.fontSize as string)?.replace('px', '') || '16') || 16}
          onChange={(v) => updateStyle('fontSize', `${v}px`)}
          min={8}
          max={100}
        />
        <PropertyNote style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
          Ukuran font teks (8px - 100px)
        </PropertyNote>
      </PropertySection>

      <PropertySection>
        <PropertyLabel style={{ color: '#ff4444' }}>*Text Align</PropertyLabel>
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <button
            onClick={() => updateStyle('textAlign', 'left')}
            style={{
              flex: 1,
              padding: '10px',
              border: '1px solid #4a4a4a',
              borderRadius: '4px',
              background: block.styles.textAlign === 'left' ? '#ff6b35' : '#3a3a3a',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Rata Kiri"
          >
            <span style={{ textAlign: 'left', width: '100%' }}>☰</span>
          </button>
          <button
            onClick={() => updateStyle('textAlign', 'center')}
            style={{
              flex: 1,
              padding: '10px',
              border: '1px solid #4a4a4a',
              borderRadius: '4px',
              background: block.styles.textAlign === 'center' ? '#ff6b35' : '#3a3a3a',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Rata Tengah"
          >
            <span style={{ textAlign: 'center', width: '100%' }}>☰</span>
          </button>
          <button
            onClick={() => updateStyle('textAlign', 'right')}
            style={{
              flex: 1,
              padding: '10px',
              border: '1px solid #4a4a4a',
              borderRadius: '4px',
              background: block.styles.textAlign === 'right' ? '#ff6b35' : '#3a3a3a',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Rata Kanan"
          >
            <span style={{ textAlign: 'right', width: '100%' }}>☰</span>
          </button>
        </div>
        <PropertyNote style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
          Posisi perataan teks (kiri, tengah, atau kanan)
        </PropertyNote>
      </PropertySection>

      <PropertySection>
        <Slider
          label="Line Height"
          value={(() => {
            const lineHeight = (block.styles as any).lineHeight;
            if (!lineHeight) return 20;
            if (typeof lineHeight === 'number') return lineHeight;
            if (typeof lineHeight === 'string') {
              // Handle px values
              if (lineHeight.includes('px')) {
                return parseFloat(lineHeight.replace('px', '')) || 20;
              }
              // Handle unitless values (like 1.5, 1.2, etc) - convert to px based on font size
              const fontSize = parseInt((block.styles.fontSize as string)?.replace('px', '') || '16') || 16;
              const unitlessValue = parseFloat(lineHeight) || 1.5;
              return Math.round(fontSize * unitlessValue);
            }
            return 20;
          })()}
          onChange={(v) => {
            // Always save as px value for consistency
            updateStyle('lineHeight', `${v}px`);
          }}
          min={10}
          max={100}
        />
        <PropertyNote style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
          Jarak antar baris teks (10px - 100px)
        </PropertyNote>
      </PropertySection>

      <PropertySection>
        <PropertyLabel>Color</PropertyLabel>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: block.styles.color || '#000000',
              border: '2px solid #4a4a4a',
            }}
          />
          <button
            onClick={() => {
              const colorInput = document.createElement('input');
              colorInput.type = 'color';
              colorInput.value = block.styles.color || '#000000';
              colorInput.onchange = (e: any) => updateStyle('color', e.target.value);
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
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>✏️</span> Ubah
          </button>
        </div>
        <PropertyNote style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
          Warna teks
        </PropertyNote>
      </PropertySection>

      <PropertySection>
        <PropertyLabel>Font Weight (Ketebalan)</PropertyLabel>
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <button
            onClick={() => updateStyle('fontWeight', 'normal')}
            style={{
              flex: 1,
              padding: '10px',
              border: '1px solid #4a4a4a',
              borderRadius: '4px',
              background: (block.styles as any).fontWeight === 'normal' || !(block.styles as any).fontWeight ? '#ff6b35' : '#3a3a3a',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Normal
          </button>
          <button
            onClick={() => updateStyle('fontWeight', 'bold')}
            style={{
              flex: 1,
              padding: '10px',
              border: '1px solid #4a4a4a',
              borderRadius: '4px',
              background: (block.styles as any).fontWeight === 'bold' ? '#ff6b35' : '#3a3a3a',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          >
            Bold
          </button>
        </div>
        <PropertyNote style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
          Ketebalan font teks (Normal atau Bold)
        </PropertyNote>
      </PropertySection>

      <PropertySection>
        <PropertyLabel>Background</PropertyLabel>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: (block.styles as any).backgroundColor || 'transparent',
              border: '2px solid #4a4a4a',
              position: 'relative',
            }}
          >
            {!(block.styles as any).backgroundColor && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '20px',
                height: '2px',
                background: '#999',
                transform: 'translate(-50%, -50%) rotate(45deg)',
              }} />
            )}
          </div>
          <button
            onClick={() => {
              const colorInput = document.createElement('input');
              colorInput.type = 'color';
              colorInput.value = (block.styles as any).backgroundColor || '#ffffff';
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
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>✏️</span> Ubah
          </button>
          <button
            onClick={() => updateStyle('backgroundColor', 'transparent')}
            style={{
              padding: '8px 12px',
              background: '#3a3a3a',
              color: '#ffffff',
              border: '1px solid #4a4a4a',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Transparan
          </button>
        </div>
        <PropertyNote style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
          Warna latar belakang teks (default: transparan)
        </PropertyNote>
      </PropertySection>


    </>
  );
};

