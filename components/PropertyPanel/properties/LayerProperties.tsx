'use client';

import React from 'react';
import { Block } from '@/types/block';
import { PropertySection, PropertyLabel, PropertyInput, PropertySelect, PropertyNote } from '../shared/styled';
import { Slider } from '../shared/Slider';
import { useEditorStore } from '@/store/useEditorStore';

interface LayerPropertiesProps {
  sectionId: string;
  updateStyle: (key: string, value: any) => void;
}

export const LayerProperties: React.FC<LayerPropertiesProps> = ({
  sectionId,
  updateStyle,
}) => {
  const blocks = useEditorStore((state) => state.blocks);
  const section = blocks.find(b => b.id === sectionId);
  const updateLayerStyles = useEditorStore((state) => state.updateLayerStyles);

  if (!section || section.type !== 'section') {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#999', fontSize: '12px' }}>
        Section tidak ditemukan
      </div>
    );
  }

  // Get layer styles from section.styles.layerStyles or use defaults
  const layerStyles = (section.styles as any).layerStyles || {
    padding: '24px',
    maxWidth: '100%',
    margin: '0 auto',
    textAlign: 'left',
    backgroundColor: 'transparent',
  };

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

  // Parse padding (can be string like "20px 0px" or number)
  const parsePaddingValue = (value: any): { top: number; right: number; bottom: number; left: number } => {
    if (!value) return { top: 24, right: 24, bottom: 24, left: 24 };
    if (typeof value === 'string') {
      const parts = value.split(' ').map(p => extractStyleNumber(p, 24));
      return {
        top: parts[0] || 24,
        right: parts[1] !== undefined ? parts[1] : parts[0] || 24,
        bottom: parts[2] !== undefined ? parts[2] : parts[0] || 24,
        left: parts[3] !== undefined ? parts[3] : parts[1] !== undefined ? parts[1] : parts[0] || 24,
      };
    }
    return { top: 24, right: 24, bottom: 24, left: 24 };
  };

  const padding = parsePaddingValue(layerStyles.padding);
  const maxWidth = extractStyleNumber(layerStyles.maxWidth, 100);
  const borderRadius = extractStyleNumber(layerStyles.borderRadius, 0);
  const borderWidth = extractStyleNumber(layerStyles.borderWidth, 0);

  const handleUpdateLayerStyle = (key: string, value: any) => {
    const newLayerStyles = {
      ...layerStyles,
      [key]: value,
    };
    updateLayerStyles(sectionId, newLayerStyles);
  };

  const handleUpdatePadding = (side: 'top' | 'right' | 'bottom' | 'left', value: number) => {
    const newPadding = { ...padding, [side]: value };
    handleUpdateLayerStyle('padding', `${newPadding.top}px ${newPadding.right}px ${newPadding.bottom}px ${newPadding.left}px`);
  };

  return (
    <>
      <PropertySection>
        <PropertyLabel>Layer Type</PropertyLabel>
        <PropertySelect value="layer" disabled>
          <option value="layer">Content Layer</option>
        </PropertySelect>
        <PropertyNote>
          Layer adalah area konten di dalam section. Komponen di-drop ke dalam layer ini.
        </PropertyNote>
      </PropertySection>

      <PropertySection>
        <PropertyLabel>Padding Top</PropertyLabel>
        <Slider
          label="Padding Top"
          value={padding.top}
          onChange={(v) => handleUpdatePadding('top', v)}
          min={0}
          max={100}
        />
        <PropertyNote>
          Jarak dalam dari atas (px)
        </PropertyNote>
      </PropertySection>

      <PropertySection>
        <PropertyLabel>Padding Right</PropertyLabel>
        <Slider
          label="Padding Right"
          value={padding.right}
          onChange={(v) => handleUpdatePadding('right', v)}
          min={0}
          max={100}
        />
        <PropertyNote>
          Jarak dalam dari kanan (px)
        </PropertyNote>
      </PropertySection>

      <PropertySection>
        <PropertyLabel>Padding Bottom</PropertyLabel>
        <Slider
          label="Padding Bottom"
          value={padding.bottom}
          onChange={(v) => handleUpdatePadding('bottom', v)}
          min={0}
          max={100}
        />
        <PropertyNote>
          Jarak dalam dari bawah (px)
        </PropertyNote>
      </PropertySection>

      <PropertySection>
        <PropertyLabel>Padding Left</PropertyLabel>
        <Slider
          label="Padding Left"
          value={padding.left}
          onChange={(v) => handleUpdatePadding('left', v)}
          min={0}
          max={100}
        />
        <PropertyNote>
          Jarak dalam dari kiri (px)
        </PropertyNote>
      </PropertySection>

      <PropertySection>
        <PropertyLabel>Max Width</PropertyLabel>
        <Slider
          label="Max Width"
          value={maxWidth}
          onChange={(v) => handleUpdateLayerStyle('maxWidth', `${v}%`)}
          min={50}
          max={100}
        />
        <PropertyNote>
          Lebar maksimum layer (%). 100% = full width, 50% = setengah lebar
        </PropertyNote>
      </PropertySection>

      <PropertySection>
        <PropertyLabel>Border Width</PropertyLabel>
        <Slider
          label="Border Width"
          value={borderWidth}
          onChange={(v) => handleUpdateLayerStyle('borderWidth', `${v}px`)}
          min={0}
          max={10}
        />
        <PropertyNote>
          Ketebalan border layer (px). 0 = tidak ada border
        </PropertyNote>
      </PropertySection>

      <PropertySection>
        <PropertyLabel>Border Color</PropertyLabel>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '4px',
              background: layerStyles.borderColor || '#23add3',
              border: '2px solid #e0e0e0',
            }}
          />
          <button
            onClick={() => {
              const colorInput = document.createElement('input');
              colorInput.type = 'color';
              colorInput.value = layerStyles.borderColor || '#23add3';
              colorInput.onchange = (e: any) => handleUpdateLayerStyle('borderColor', e.target.value);
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
            Pilih Warna
          </button>
        </div>
        <PropertyNote>
          Warna border layer (default: #23add3 - biru)
        </PropertyNote>
      </PropertySection>

      <PropertySection>
        <PropertyLabel>Border Style</PropertyLabel>
        <PropertySelect
          value={layerStyles.borderStyle || 'dashed'}
          onChange={(e) => handleUpdateLayerStyle('borderStyle', e.target.value)}
        >
          <option value="solid">Solid</option>
          <option value="dashed">Dashed</option>
          <option value="dotted">Dotted</option>
          <option value="double">Double</option>
          <option value="none">None</option>
        </PropertySelect>
        <PropertyNote>
          Gaya border layer (dashed = putus-putus seperti di HTML)
        </PropertyNote>
      </PropertySection>

      <PropertySection>
        <PropertyLabel>Border Radius</PropertyLabel>
        <Slider
          label="Border Radius"
          value={borderRadius}
          onChange={(v) => handleUpdateLayerStyle('borderRadius', `${v}px`)}
          min={0}
          max={50}
        />
        <PropertyNote>
          Sudut lengkung layer (px). 0 = persegi, 50px = sangat lengkung
        </PropertyNote>
      </PropertySection>

      <PropertySection>
        <PropertyLabel>Text Alignment</PropertyLabel>
        <PropertySelect
          value={layerStyles.textAlign || 'left'}
          onChange={(e) => handleUpdateLayerStyle('textAlign', e.target.value)}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
          <option value="justify">Justify</option>
        </PropertySelect>
        <PropertyNote>
          Perataan teks di dalam layer
        </PropertyNote>
      </PropertySection>

      <PropertySection>
        <PropertyLabel>Background Color</PropertyLabel>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '4px',
              background: layerStyles.backgroundColor || 'transparent',
              border: '2px solid #e0e0e0',
            }}
          />
          <button
            onClick={() => {
              const colorInput = document.createElement('input');
              colorInput.type = 'color';
              colorInput.value = layerStyles.backgroundColor || '#ffffff';
              colorInput.onchange = (e: any) => handleUpdateLayerStyle('backgroundColor', e.target.value);
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
            Pilih Warna
          </button>
          <button
            onClick={() => handleUpdateLayerStyle('backgroundColor', 'transparent')}
            style={{
              padding: '8px 16px',
              background: '#3a3a3a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Transparan
          </button>
        </div>
        <PropertyNote>
          Warna latar belakang layer
        </PropertyNote>
      </PropertySection>
    </>
  );
};

