'use client';

import styled from 'styled-components';
import { useState, useRef, useEffect } from 'react';
import { Block } from '@/types/block';
import { 
  FaMusic, 
  FaPlay, 
  FaPause, 
  FaStop,
  FaVolumeUp,
  FaVolumeDown,
  FaHeart,
  FaStar,
  FaCompactDisc,
  FaHeadphones
} from 'react-icons/fa';

const AudioContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: transparent;
`;

// Desain Kaset
const CassetteTape = styled.div<{ $isPlaying: boolean }>`
  position: relative;
  width: 280px;
  height: 180px;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 
    0 8px 16px rgba(0, 0, 0, 0.3),
    inset 0 2px 4px rgba(255, 255, 255, 0.1),
    inset 0 -2px 4px rgba(0, 0, 0, 0.2);
  border: 2px solid #1a252f;
  transform: ${props => props.$isPlaying ? 'scale(1.02)' : 'scale(1)'};
  transition: transform 0.3s ease;
`;

const CassetteTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const CassetteLabel = styled.div`
  flex: 1;
  text-align: center;
  color: #ecf0f1;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const CassetteHoles = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 12px 0;
`;

const CassetteHole = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: radial-gradient(circle, #1a252f 0%, #0f1419 100%);
  border: 3px solid #0a0e12;
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.5),
    0 2px 4px rgba(255, 255, 255, 0.1);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #0a0e12;
  }
`;

const CassetteReel = styled.div<{ $isPlaying: boolean }>`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: radial-gradient(circle, #34495e 0%, #2c3e50 100%);
  border: 2px solid #1a252f;
  position: relative;
  animation: ${props => props.$isPlaying ? 'spin 3s linear infinite' : 'none'};
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: #1a252f;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #ecf0f1;
  }
`;

const IconContainer = styled.div<{ $iconColor: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: ${props => props.$iconColor};
  border-radius: 50%;
  color: #ffffff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  margin: 0 auto;
`;

const ControlsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
`;

const ControlButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: ${props => props.$variant === 'primary' 
    ? 'linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%)' 
    : 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)'};
  color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.2s;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const VolumeControl = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
`;

const VolumeSlider = styled.input`
  width: 120px;
  height: 4px;
  border-radius: 2px;
  background: #34495e;
  outline: none;
  -webkit-appearance: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #ff6b35;
    cursor: pointer;
  }
  
  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #ff6b35;
    cursor: pointer;
    border: none;
  }
`;

const HiddenAudio = styled.audio`
  display: none;
`;

const EmptyState = styled.div`
  text-align: center;
  color: #999;
  padding: 20px;
  font-size: 14px;
`;

// Icon options
const iconOptions = {
  music: { icon: FaMusic, color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  heart: { icon: FaHeart, color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  star: { icon: FaStar, color: 'linear-gradient(135deg, #fbc531 0%, #e55039 100%)' },
  disc: { icon: FaCompactDisc, color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  headphones: { icon: FaHeadphones, color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
};

interface AudioBlockProps {
  block: Block;
}

export default function AudioBlock({ block }: AudioBlockProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  
  // Parse content - bisa string (URL) atau object dengan properties
  let audioUrl = '';
  let iconType: keyof typeof iconOptions = 'music';
  let autoPlay = false;
  let loop = false;
  
  if (typeof block.content === 'string') {
    audioUrl = block.content;
  } else if (block.content && typeof block.content === 'object') {
    audioUrl = block.content.url || block.content.src || '';
    iconType = block.content.iconType || 'music';
    autoPlay = block.content.autoPlay || false;
    loop = block.content.loop || false;
    if (block.content.volume !== undefined) {
      setVolume(block.content.volume);
    }
  }

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.loop = loop;
    }
  }, [volume, loop]);

  useEffect(() => {
    if (autoPlay && audioRef.current && audioUrl) {
      audioRef.current.play().catch(() => {
        // Auto-play mungkin diblokir browser
      });
    }
  }, [autoPlay, audioUrl]);

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  const handlePlayEvent = () => {
    setIsPlaying(true);
  };

  const handlePauseEvent = () => {
    setIsPlaying(false);
  };

  const SelectedIcon = iconOptions[iconType].icon;
  const iconColor = iconOptions[iconType].color;

  return (
    <AudioContainer style={block.styles}>
      {audioUrl ? (
        <>
          <CassetteTape $isPlaying={isPlaying}>
            <CassetteTop>
              <div style={{ width: '20px' }}></div>
              <CassetteLabel>Music Player</CassetteLabel>
              <div style={{ width: '20px' }}></div>
            </CassetteTop>
            
            <IconContainer $iconColor={iconColor}>
              <SelectedIcon size={28} />
            </IconContainer>
            
            <CassetteHoles>
              <CassetteHole>
                <CassetteReel $isPlaying={isPlaying} />
              </CassetteHole>
              <CassetteHole>
                <CassetteReel $isPlaying={isPlaying} />
              </CassetteHole>
            </CassetteHoles>
          </CassetteTape>

          <ControlsContainer>
            <ControlButton
              $variant="primary"
              onClick={isPlaying ? handlePause : handlePlay}
              title={isPlaying ? 'Jeda' : 'Putar'}
            >
              {isPlaying ? <FaPause /> : <FaPlay />}
            </ControlButton>
            <ControlButton
              onClick={handleStop}
              title="Stop"
            >
              <FaStop />
            </ControlButton>
          </ControlsContainer>

          <VolumeControl>
            {volume > 0.5 ? <FaVolumeUp size={16} color="#999" /> : <FaVolumeDown size={16} color="#999" />}
            <VolumeSlider
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
            />
          </VolumeControl>

          <HiddenAudio
            ref={audioRef}
            src={audioUrl}
            onEnded={handleEnded}
            onPlay={handlePlayEvent}
            onPause={handlePauseEvent}
          />
        </>
      ) : (
        <EmptyState>
          <IconContainer $iconColor={iconOptions[iconType].color}>
            <SelectedIcon size={32} />
          </IconContainer>
          <div style={{ marginTop: '12px' }}>Tambahkan URL audio</div>
        </EmptyState>
      )}
    </AudioContainer>
  );
}
