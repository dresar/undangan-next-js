'use client';

import styled from 'styled-components';
import { Block } from '@/types/block';
import { FaUniversity } from 'react-icons/fa';

const BankContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
`;

const BankHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
`;

const BankName = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const BankInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const BankLabel = styled.span`
  font-size: 12px;
  color: #666;
  font-weight: 500;
`;

const BankValue = styled.span`
  font-size: 16px;
  color: #333;
  font-weight: 600;
  font-family: 'Courier New', monospace;
`;

interface BankBlockProps {
  block: Block;
}

export default function BankBlock({ block }: BankBlockProps) {
  const content = typeof block.content === 'object' && block.content !== null
    ? block.content
    : { name: 'Bank BCA', account: '1234567890', holder: 'Nama Pemilik' };

  return (
    <BankContainer style={block.styles}>
      <BankHeader>
        <FaUniversity size={24} color="#007bff" />
        <BankName>{content.name || 'Bank'}</BankName>
      </BankHeader>
      <BankInfo>
        <div>
          <BankLabel>No. Rekening</BankLabel>
          <BankValue>{content.account || '1234567890'}</BankValue>
        </div>
        <div>
          <BankLabel>Atas Nama</BankLabel>
          <BankValue>{content.holder || 'Nama Pemilik'}</BankValue>
        </div>
      </BankInfo>
    </BankContainer>
  );
}

