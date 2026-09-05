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

interface SpacerPropertiesProps {
  block: Block;
}

export default function SpacerProperties({ block }: SpacerPropertiesProps) {
  const updateBlock = useEditorStore((state) => state.updateBlock);

  const height = block.content?.height || 40;

  return (
    <PropertyGroup>
      <PropertyLabel>Height (px)</PropertyLabel>
      <PropertyInput
        type="number"
        min="10"
        max="500"
        value={height}
        onChange={(e) =>
          updateBlock(block.id, {
            content: { height: parseInt(e.target.value) || 40 },
          })
        }
      />
    </PropertyGroup>
  );
}

