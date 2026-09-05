'use client';

import React from 'react';
import { Block } from '@/types/block';
import { PropertySection, PropertyLabel, PropertyTextarea, PropertyNote } from '../shared/styled';

interface CSSTabProps {
  block: Block;
  updateCustomCSS: (css: string) => void;
}

export const CSSTab: React.FC<CSSTabProps> = ({
  block,
  updateCustomCSS,
}) => {
  return (
    <>
      <PropertySection>
        <PropertyLabel>CSS Kustom</PropertyLabel>
        <PropertyTextarea
          placeholder="/* Masukkan CSS kustom di sini */&#10;.komponen-saya {&#10;  color: red;&#10;  background: blue;&#10;}"
          value={block.customCSS || ''}
          onChange={(e) => updateCustomCSS(e.target.value)}
        />
        <PropertyNote>
          CSS kustom akan diterapkan langsung pada komponen ini. Gunakan untuk styling tambahan yang tidak tersedia di opsi di atas.
          <br />
          Contoh: .komponen {'{'} color: red; transform: rotate(5deg); {'}'}
        </PropertyNote>
      </PropertySection>
    </>
  );
};

