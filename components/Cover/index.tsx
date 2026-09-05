'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';

const CoverContainer = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: ${props => props.$isOpen ? 'transparent' : '#000'};
  z-index: ${props => props.$isOpen ? -1 : 9999};
  display: ${props => props.$isOpen ? 'none' : 'flex'};
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: opacity 0.5s ease, visibility 0.5s ease;
  visibility: ${props => props.$isOpen ? 'hidden' : 'visible'};
  opacity: ${props => props.$isOpen ? 0 : 1};
`;

const CoverImage = styled.div<{ $imageUrl: string }>`
  width: 100%;
  height: 100%;
  background-image: url(${props => props.$imageUrl});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: absolute;
  top: 0;
  left: 0;
`;

const CoverContent = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const OpenButton = styled.button`
  padding: 16px 48px;
  background: linear-gradient(135deg, #fbc531 0%, #e55039 100%);
  color: #ffffff;
  border: none;
  border-radius: 50px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(251, 197, 49, 0.4);
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(251, 197, 49, 0.6);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

interface CoverProps {
  coverImage: string;
  coverButtonText: string;
  coverEnabled: boolean;
  onOpen: () => void;
}

export default function Cover({ coverImage, coverButtonText, coverEnabled, onOpen }: CoverProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if cover was already opened (stored in sessionStorage)
    const coverOpened = sessionStorage.getItem('coverOpened');
    if (coverOpened === 'true') {
      setIsOpen(true);
      onOpen();
    }
  }, [onOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    sessionStorage.setItem('coverOpened', 'true');
    onOpen();
  };

  if (!coverEnabled || !coverImage) {
    return null;
  }

  return (
    <CoverContainer $isOpen={isOpen}>
      {coverImage && <CoverImage $imageUrl={coverImage} />}
      <CoverContent>
        <OpenButton onClick={handleOpen}>
          {coverButtonText || 'Buka Undangan'}
        </OpenButton>
      </CoverContent>
    </CoverContainer>
  );
}

