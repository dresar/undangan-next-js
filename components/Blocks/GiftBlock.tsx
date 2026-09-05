'use client';

import styled from 'styled-components';
import { Block } from '@/types/block';
import { FaGift } from 'react-icons/fa';

const GiftContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: #ffffff;
  text-align: center;
`;

const GiftTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  margin: 0;
`;

const GiftDescription = styled.p`
  font-size: 14px;
  margin: 0;
  opacity: 0.9;
`;

const GiftButton = styled.button`
  padding: 12px 24px;
  background: #ffffff;
  color: #667eea;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`;

interface GiftBlockProps {
  block: Block;
}

export default function GiftBlock({ block }: GiftBlockProps) {
  const content = typeof block.content === 'object' && block.content !== null
    ? block.content
    : { title: 'Kirim Hadiah', description: 'Kirim hadiah untuk pasangan' };

  return (
    <GiftContainer style={block.styles}>
      <FaGift size={48} />
      <GiftTitle>{content.title || 'Kirim Hadiah'}</GiftTitle>
      <GiftDescription>{content.description || 'Kirim hadiah untuk pasangan'}</GiftDescription>
      <GiftButton>Lihat Detail</GiftButton>
    </GiftContainer>
  );
}

