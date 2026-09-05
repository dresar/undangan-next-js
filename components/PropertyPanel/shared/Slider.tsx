'use client';

import React from 'react';
import {
  SliderContainer,
  SliderWrapper,
  SliderTrack,
  SliderFill,
  SliderHandle,
  SliderInput,
  PropertyLabel,
} from './styled';

interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  showLabel?: boolean;
}

export const Slider: React.FC<SliderProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  showLabel = true,
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || 0;
    onChange(newValue);
  };

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = (clickX / rect.width) * 100;
    const newValue = Math.round(min + (percentage / 100) * (max - min));
    onChange(Math.max(min, Math.min(max, newValue)));
  };

  return (
    <SliderContainer>
      {showLabel && (
        <PropertyLabel style={{ margin: 0, minWidth: '120px', fontSize: '12px', color: '#ff4444' }}>
          *{label}
        </PropertyLabel>
      )}
      <SliderWrapper>
        <SliderTrack onClick={handleTrackClick}>
          <SliderFill $percentage={percentage} />
          <SliderHandle $percentage={percentage} />
          <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={handleSliderChange}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              opacity: 0,
              cursor: 'pointer',
              zIndex: 1,
            }}
          />
        </SliderTrack>
      </SliderWrapper>
      <SliderInput
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        min={min}
        max={max}
      />
    </SliderContainer>
  );
};

