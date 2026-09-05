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

interface VideoPropertiesProps {
  block: Block;
}

export default function VideoProperties({ block }: VideoPropertiesProps) {
  const updateBlock = useEditorStore((state) => state.updateBlock);

  return (
    <PropertyGroup>
      <PropertyLabel>Video URL</PropertyLabel>
      <PropertyInput
        type="url"
        value={block.content || ''}
        onChange={(e) => updateBlock(block.id, { content: e.target.value })}
        placeholder="https://www.youtube.com/watch?v=..."
      />
      <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
        Supports YouTube, Vimeo, and direct video URLs
      </p>
    </PropertyGroup>
  );
}

