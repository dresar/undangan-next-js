'use client';

import styled from 'styled-components';
import { Block } from '@/types/block';
import { useEditorStore } from '@/store/useEditorStore';

const PropertyGroup = styled.div`
  margin-bottom: 24px;
`;

const PropertyLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333333;
  margin-bottom: 8px;
`;

const PropertyInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

interface ImagePropertiesProps {
  block: Block;
}

export default function ImageProperties({ block }: ImagePropertiesProps) {
  const updateBlock = useEditorStore((state) => state.updateBlock);

  const updateStyle = (key: string, value: any) => {
    updateBlock(block.id, {
      styles: {
        ...block.styles,
        [key]: value,
      },
    });
  };

  return (
    <>
      <PropertyGroup>
        <PropertyLabel>Image URL</PropertyLabel>
        <PropertyInput
          type="url"
          value={block.content || ''}
          onChange={(e) => updateBlock(block.id, { content: e.target.value })}
          placeholder="https://example.com/image.jpg"
        />
      </PropertyGroup>

      <PropertyGroup>
        <PropertyLabel>Width</PropertyLabel>
        <PropertyInput
          type="text"
          value={block.styles.width || '100%'}
          onChange={(e) => updateStyle('width', e.target.value)}
          placeholder="100% or 300px"
        />
      </PropertyGroup>

      <PropertyGroup>
        <PropertyLabel>Padding</PropertyLabel>
        <PropertyInput
          type="text"
          value={block.styles.padding || '10px'}
          onChange={(e) => updateStyle('padding', e.target.value)}
        />
      </PropertyGroup>
    </>
  );
}

