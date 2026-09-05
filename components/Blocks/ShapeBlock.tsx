'use client';

import styled from 'styled-components';
import { Block } from '@/types/block';

const ShapeContainer = styled.div<{ shape: string }>`
  width: 100px;
  height: 100px;
  background: #007bff;
  ${(props) => {
    switch (props.shape) {
      case 'circle':
        return 'border-radius: 50%;';
      case 'rectangle':
        return 'border-radius: 0;';
      case 'rounded':
        return 'border-radius: 12px;';
      default:
        return 'border-radius: 0;';
    }
  }}
`;

interface ShapeBlockProps {
  block: Block;
}

export default function ShapeBlock({ block }: ShapeBlockProps) {
  const shape = block.content || 'rectangle';

  return (
    <ShapeContainer
      shape={shape}
      style={{
        ...block.styles,
        backgroundColor: block.styles.backgroundColor || '#007bff',
      }}
    />
  );
}

