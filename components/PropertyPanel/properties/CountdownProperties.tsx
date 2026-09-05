'use client';

import React, { useMemo } from 'react';
import { Block } from '@/types/block';
import { PropertySection, PropertyLabel, PropertyInput, PropertyNote } from '../shared/styled';
import { Slider } from '../shared/Slider';

interface CountdownPropertiesProps {
  block: Block;
  updateStyle: (key: string, value: any) => void;
  updateContent: (value: any) => void;
}

export const CountdownProperties: React.FC<CountdownPropertiesProps> = ({
  block,
  updateStyle,
  updateContent,
}) => {
  // Parse content dengan useMemo untuk menghindari re-render berulang
  const { targetDate, defaultDateString } = useMemo(() => {
    let date = '';
    if (typeof block.content === 'string') {
      date = block.content;
    } else if (block.content && typeof block.content === 'object') {
      date = block.content.date || block.content.targetDate || '';
    }

    // Default: 1 bulan dari sekarang
    const defaultDate = new Date();
    defaultDate.setMonth(defaultDate.getMonth() + 1);
    const defaultStr = defaultDate.toISOString().split('T')[0] + 'T' + defaultDate.toTimeString().split(' ')[0].substring(0, 5);

    return { targetDate: date, defaultDateString: defaultStr };
  }, [block.content]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateContent(e.target.value);
  };

  return (
    <>
      <PropertySection>
        <PropertyLabel style={{ color: '#ff4444' }}>*Target Tanggal & Waktu</PropertyLabel>
        <PropertyInput
          type="datetime-local"
          value={targetDate || defaultDateString}
          onChange={handleDateChange}
        />
        <PropertyNote>
          Pilih tanggal dan waktu target untuk countdown
        </PropertyNote>
      </PropertySection>

      <PropertySection>
        <PropertyLabel>Text Color</PropertyLabel>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: block.styles.color || '#007bff',
              border: '2px solid #4a4a4a',
            }}
          />
          <button
            onClick={() => {
              const colorInput = document.createElement('input');
              colorInput.type = 'color';
              colorInput.value = block.styles.color || '#007bff';
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
            }}
          >
            ✏️ Ubah Warna
          </button>
        </div>
      </PropertySection>

      <PropertySection>
        <Slider
          label="Font Size"
          value={parseInt((block.styles.fontSize as string)?.replace('px', '') || '32') || 32}
          onChange={(v) => updateStyle('fontSize', `${v}px`)}
          min={16}
          max={72}
        />
      </PropertySection>
    </>
  );
};

