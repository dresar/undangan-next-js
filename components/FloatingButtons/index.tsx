'use client';

import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FaQrcode, FaVolumeUp, FaVolumeMute, FaPlay } from 'react-icons/fa';

const FloatingContainer = styled.div`
  position: fixed;
  right: 20px;
  bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 1000;
  pointer-events: auto;
`;

const FloatingButton = styled.button<{ $active?: boolean }>`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  background: ${props => props.$active 
    ? 'linear-gradient(135deg, #fbc531 0%, #e55039 100%)' 
    : 'rgba(251, 197, 49, 0.9)'};
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  font-size: 20px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
    background: ${props => props.$active 
      ? 'linear-gradient(135deg, #e55039 0%, #fbc531 100%)' 
      : 'rgba(251, 197, 49, 1)'};
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

interface FloatingButtonsProps {
  hasAudio: boolean;
  audioUrl?: string;
}

export default function FloatingButtons({ hasAudio, audioUrl }: FloatingButtonsProps) {
  const [isMuted, setIsMuted] = useState(true); // Default mute
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Find and control audio element (background-music)
  useEffect(() => {
    if (!hasAudio || !audioUrl) return;

    // Find background music element
    const findAudioElement = () => {
      const audioElement = document.getElementById('background-music') as HTMLAudioElement;
      if (audioElement) {
        audioRef.current = audioElement;
        // Set initial mute state
        audioRef.current.muted = isMuted;
        // Try to play (may be blocked by browser)
        audioRef.current.play().catch(() => {
          // Auto-play blocked, that's okay
        });
      }
    };

    findAudioElement();
    
    // Try again after a short delay in case audio loads later
    const timeout = setTimeout(findAudioElement, 500);
    
    return () => clearTimeout(timeout);
  }, [hasAudio, audioUrl, isMuted]);

  const handleMuteToggle = () => {
    if (audioRef.current) {
      const newMutedState = !isMuted;
      audioRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
    } else {
      // Try to find audio element again
      const audioElements = document.querySelectorAll('audio');
      if (audioElements.length > 0) {
        audioRef.current = audioElements[0] as HTMLAudioElement;
        const newMutedState = !isMuted;
        audioRef.current.muted = newMutedState;
        setIsMuted(newMutedState);
      }
    }
  };

  const handlePlayScroll = () => {
    // Scroll to bottom of page
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  };

  if (!hasAudio) {
    return null;
  }

  return (
    <>
      <FloatingContainer>
        {/* QR Code Button - Disabled for now */}
        <FloatingButton disabled title="QR Code (Coming Soon)">
          <FaQrcode />
        </FloatingButton>

        {/* Mute/Unmute Button */}
        <FloatingButton 
          onClick={handleMuteToggle}
          title={isMuted ? 'Aktifkan Suara' : 'Nonaktifkan Suara'}
        >
          {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
        </FloatingButton>

        {/* Play/Scroll Button */}
        <FloatingButton 
          onClick={handlePlayScroll}
          title="Scroll ke Bawah"
        >
          <FaPlay />
        </FloatingButton>
      </FloatingContainer>
    </>
  );
}

