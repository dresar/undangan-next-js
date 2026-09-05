'use client';

import React from 'react';
import { Block } from '@/types/block';
import { PropertySection, PropertyLabel, PropertyNote } from '../shared/styled';
import { Slider } from '../shared/Slider';
import { parsePadding, parseMargin } from '../shared/utils';

interface SettingTabProps {
  block: Block;
  updateStyle: (key: string, value: any) => void;
  updatePadding: (side: 'top' | 'right' | 'bottom' | 'left', value: number) => void;
}

export const SettingTab: React.FC<SettingTabProps> = ({
  block,
  updateStyle,
  updatePadding,
}) => {
  const padding = parsePadding(block);
  const margin = parseMargin(block);
  
  // Helper to extract number from style value
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
  
  const borderWidth = extractStyleNumber(block.styles.borderWidth, 0);
  const borderRadius = extractStyleNumber(block.styles.borderRadius, 0);

  const updateMargin = (side: 'top' | 'right' | 'bottom' | 'left', value: number) => {
    const newMargin = { ...margin, [side]: value };
    updateStyle('margin', `${newMargin.top}px ${newMargin.right}px ${newMargin.bottom}px ${newMargin.left}px`);
  };

  if (block.type === 'text') {
    return (
      <>
        <PropertySection>
          <Slider
            label="BorderRadius"
            value={borderRadius}
            onChange={(v) => updateStyle('borderRadius', `${v}px`)}
            min={0}
            max={100}
          />
          <PropertyNote style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
          Membuat sudut komponen menjadi lengkung (0px = persegi, 50px = sangat lengkung)
        </PropertyNote>
        </PropertySection>

        <PropertySection>
          <Slider
            label="Margin Top"
            value={margin.top}
            onChange={(v) => updateMargin('top', v)}
            min={0}
            max={100}
          />
          <PropertyNote style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
            Jarak dari atas komponen
          </PropertyNote>
        </PropertySection>

        <PropertySection>
          <Slider
            label="Margin Right"
            value={margin.right}
            onChange={(v) => updateMargin('right', v)}
            min={0}
            max={100}
          />
          <PropertyNote style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
            Jarak dari kanan komponen
          </PropertyNote>
        </PropertySection>

        <PropertySection>
          <Slider
            label="Margin Bottom"
            value={margin.bottom}
            onChange={(v) => updateMargin('bottom', v)}
            min={0}
            max={100}
          />
          <PropertyNote style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
            Jarak dari bawah komponen
          </PropertyNote>
        </PropertySection>

        <PropertySection>
          <Slider
            label="Margin Left"
            value={margin.left}
            onChange={(v) => updateMargin('left', v)}
            min={0}
            max={100}
          />
          <PropertyNote style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
            Jarak dari kiri komponen
          </PropertyNote>
        </PropertySection>

        <PropertySection>
          <Slider
            label="Padding Top"
            value={padding.top}
            onChange={(v) => updatePadding('top', v)}
            min={0}
            max={100}
          />
          <PropertyNote style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
            Jarak dalam dari atas
          </PropertyNote>
        </PropertySection>

        <PropertySection>
          <Slider
            label="Padding Right"
            value={padding.right}
            onChange={(v) => updatePadding('right', v)}
            min={0}
            max={100}
          />
          <PropertyNote style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
            Jarak dalam dari kanan
          </PropertyNote>
        </PropertySection>

        <PropertySection>
          <Slider
            label="Padding Bottom"
            value={padding.bottom}
            onChange={(v) => updatePadding('bottom', v)}
            min={0}
            max={100}
          />
          <PropertyNote style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
            Jarak dalam dari bawah
          </PropertyNote>
        </PropertySection>

        <PropertySection>
          <Slider
            label="Padding Left"
            value={padding.left}
            onChange={(v) => updatePadding('left', v)}
            min={0}
            max={100}
          />
          <PropertyNote style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
            Jarak dalam dari kiri
          </PropertyNote>
        </PropertySection>

        <PropertySection>
          <Slider
            label="Border Width"
            value={borderWidth}
            onChange={(v) => updateStyle('borderWidth', `${v}px`)}
            min={0}
            max={50}
          />
          <PropertyNote style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
            Ketebalan garis border (0px = tidak ada border)
          </PropertyNote>
        </PropertySection>
      </>
    );
  }

  // Untuk block type lainnya
  const canUsePadding = block.type === 'button' || block.type === 'form';
  
  return (
    <>
      {canUsePadding && (
        <PropertySection>
          <PropertyLabel>Padding (Jarak Dalam)</PropertyLabel>
          <Slider label="Padding Top" value={padding.top} onChange={(v) => updatePadding('top', v)} min={0} max={100} />
          <Slider label="Padding Bottom" value={padding.bottom} onChange={(v) => updatePadding('bottom', v)} min={0} max={100} />
          <Slider label="Padding Left" value={padding.left} onChange={(v) => updatePadding('left', v)} min={0} max={100} />
          <Slider label="Padding Right" value={padding.right} onChange={(v) => updatePadding('right', v)} min={0} max={100} />
          <PropertyNote>Jarak antara konten dengan border komponen</PropertyNote>
        </PropertySection>
      )}

      <PropertySection>
        <PropertyLabel>Border Width (Ketebalan Border)</PropertyLabel>
        <Slider
          label="Border Width"
          value={borderWidth}
          onChange={(v) => updateStyle('borderWidth', `${v}px`)}
          min={0}
          max={50}
        />
        <PropertyNote style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
          Ketebalan garis border komponen (0px = tidak ada border)
        </PropertyNote>
      </PropertySection>

      <PropertySection>
        <PropertyLabel>Border Color (Warna Border)</PropertyLabel>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '4px',
              background: (block.styles as any).borderColor || '#000000',
              border: '2px solid #4a4a4a',
            }}
          />
          <button
            onClick={() => {
              const colorInput = document.createElement('input');
              colorInput.type = 'color';
              colorInput.value = (block.styles as any).borderColor || '#000000';
              colorInput.onchange = (e: any) => updateStyle('borderColor', e.target.value);
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
        <PropertyNote style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
          Warna garis border komponen
        </PropertyNote>
      </PropertySection>

      <PropertySection>
        <PropertyLabel>Border Style (Gaya Border)</PropertyLabel>
        <select
          value={(block.styles as any).borderStyle || 'solid'}
          onChange={(e) => updateStyle('borderStyle', e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #4a4a4a',
            borderRadius: '4px',
            background: '#2a2a2a',
            color: '#ffffff',
            fontSize: '14px',
            marginTop: '8px',
          }}
        >
          <option value="none">Tidak Ada</option>
          <option value="solid">Garis Padat</option>
          <option value="dashed">Garis Putus-putus</option>
          <option value="dotted">Garis Titik-titik</option>
          <option value="double">Garis Ganda</option>
          <option value="groove">Alur</option>
          <option value="ridge">Punggung</option>
          <option value="inset">Masuk</option>
          <option value="outset">Keluar</option>
        </select>
        <PropertyNote style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
          Gaya garis border (solid = padat, dashed = putus-putus, dotted = titik-titik)
        </PropertyNote>
      </PropertySection>

      <PropertySection>
        <PropertyLabel>Border Radius (Sudut Lengkung)</PropertyLabel>
        <Slider
          label="Border Radius"
          value={borderRadius}
          onChange={(v) => updateStyle('borderRadius', `${v}px`)}
          min={0}
          max={100}
        />
        <PropertyNote style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
          Membuat sudut komponen menjadi lengkung (0px = persegi, 50px = sangat lengkung)
        </PropertyNote>
      </PropertySection>

      <PropertySection>
        <PropertyLabel>Background Gradient (Gradiasi Latar)</PropertyLabel>
        <div style={{ marginTop: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '12px', color: '#ccc' }}>
            <input
              type="checkbox"
              checked={!!(block.styles as any).backgroundGradient}
              onChange={(e) => {
                if (e.target.checked) {
                  updateStyle('backgroundGradient', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
                } else {
                  updateStyle('backgroundGradient', '');
                }
              }}
              style={{ width: '16px', height: '16px' }}
            />
            <span>Aktifkan Gradient</span>
          </label>
          {(block.styles as any).backgroundGradient && (
            <>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '11px', color: '#999', display: 'block', marginBottom: '4px' }}>Warna Awal</label>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '4px',
                        background: (block.styles as any).gradientColor1 || '#667eea',
                        border: '2px solid #4a4a4a',
                      }}
                    />
                    <button
                      onClick={() => {
                        const colorInput = document.createElement('input');
                        colorInput.type = 'color';
                        colorInput.value = (block.styles as any).gradientColor1 || '#667eea';
                        colorInput.onchange = (e: any) => {
                          const color1 = e.target.value;
                          const color2 = (block.styles as any).gradientColor2 || '#764ba2';
                          updateStyle('gradientColor1', color1);
                          updateStyle('backgroundGradient', `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`);
                        };
                        colorInput.click();
                      }}
                      style={{
                        padding: '4px 8px',
                        background: '#3a3a3a',
                        color: '#ffffff',
                        border: '1px solid #4a4a4a',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        flex: 1,
                      }}
                    >
                      Pilih
                    </button>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '11px', color: '#999', display: 'block', marginBottom: '4px' }}>Warna Akhir</label>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '4px',
                        background: (block.styles as any).gradientColor2 || '#764ba2',
                        border: '2px solid #4a4a4a',
                      }}
                    />
                    <button
                      onClick={() => {
                        const colorInput = document.createElement('input');
                        colorInput.type = 'color';
                        colorInput.value = (block.styles as any).gradientColor2 || '#764ba2';
                        colorInput.onchange = (e: any) => {
                          const color1 = (block.styles as any).gradientColor1 || '#667eea';
                          const color2 = e.target.value;
                          updateStyle('gradientColor2', color2);
                          updateStyle('backgroundGradient', `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`);
                        };
                        colorInput.click();
                      }}
                      style={{
                        padding: '4px 8px',
                        background: '#3a3a3a',
                        color: '#ffffff',
                        border: '1px solid #4a4a4a',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        flex: 1,
                      }}
                    >
                      Pilih
                    </button>
                  </div>
                </div>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '60px',
                  borderRadius: '4px',
                  background: (block.styles as any).backgroundGradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: '2px solid #4a4a4a',
                  marginTop: '8px',
                }}
              />
            </>
          )}
        </div>
        <PropertyNote style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
          Membuat efek gradiasi (peralihan warna) pada latar belakang komponen
        </PropertyNote>
      </PropertySection>
    </>
  );
};

