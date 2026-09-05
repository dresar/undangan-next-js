'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Block } from '@/types/block';
import { PropertySection, PropertyLabel, PropertyInput, PropertySelect, PropertyNote } from '../shared/styled';
import { Slider } from '../shared/Slider';
import ImageGalleryModal from '../../Modal/ImageGalleryModal';

interface AudioPropertiesProps {
  block: Block;
  updateStyle: (key: string, value: any) => void;
  updateContent: (value: any) => void;
}

export const AudioProperties: React.FC<AudioPropertiesProps> = ({
  block,
  updateStyle,
  updateContent,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Parse content dengan useMemo untuk menghindari re-render berulang
  const contentData = useMemo(() => {
    let audioUrl = '';
    let iconType = 'music';
    let autoPlay = false;
    let loop = false;
    let volume = 0.7;

    if (typeof block.content === 'string') {
      audioUrl = block.content;
    } else if (block.content && typeof block.content === 'object') {
      audioUrl = block.content.url || block.content.src || '';
      iconType = block.content.iconType || 'music';
      autoPlay = block.content.autoPlay || false;
      loop = block.content.loop || false;
      volume = block.content.volume !== undefined ? block.content.volume : 0.7;
    }

    return { audioUrl, iconType, autoPlay, loop, volume };
  }, [block.content]);

  const handleContentUpdate = useCallback((updates: any) => {
    const currentContent = typeof block.content === 'object' && block.content !== null
      ? block.content
      : (typeof block.content === 'string' ? { url: block.content } : {});
    
    const newContent = {
      ...currentContent,
      ...updates,
    };
    updateContent(newContent);
  }, [block.content, updateContent]);

  return (
    <>
      <PropertySection>
        <PropertyLabel style={{ color: '#ff4444' }}>*URL Audio</PropertyLabel>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <PropertyInput
            type="url"
            value={contentData.audioUrl}
            onChange={(e) => handleContentUpdate({ url: e.target.value })}
            placeholder="/media/uploads/audio.mp3"
            style={{ flex: 1 }}
          />
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              padding: '8px 16px',
              background: '#ff6b35',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600',
              whiteSpace: 'nowrap',
            }}
            title="Pilih dari Library"
          >
            📁 Pilih
          </button>
        </div>
        <PropertyNote>
          Masukkan URL audio atau pilih dari library
        </PropertyNote>
      </PropertySection>

      <PropertySection>
        <PropertyLabel style={{ color: '#ff4444' }}>*Icon Type</PropertyLabel>
        <PropertySelect
          value={contentData.iconType}
          onChange={(e) => handleContentUpdate({ iconType: e.target.value })}
        >
          <option value="music">Music (Musik)</option>
          <option value="heart">Heart (Hati)</option>
          <option value="star">Star (Bintang)</option>
          <option value="disc">Disc (CD)</option>
          <option value="headphones">Headphones (Headphone)</option>
        </PropertySelect>
        <PropertyNote>
          Pilih icon yang ditampilkan di audio player
        </PropertyNote>
      </PropertySection>

      <PropertySection>
        <Slider
          label="Volume"
          value={Math.round(contentData.volume * 100)}
          onChange={(v) => handleContentUpdate({ volume: v / 100 })}
          min={0}
          max={100}
        />
        <PropertyNote>
          Volume audio (0% = silent, 100% = full volume)
        </PropertyNote>
      </PropertySection>

      <PropertySection>
        <PropertyLabel>
          <input
            type="checkbox"
            checked={contentData.autoPlay}
            onChange={(e) => handleContentUpdate({ autoPlay: e.target.checked })}
            style={{ marginRight: '8px' }}
          />
          Auto Play
        </PropertyLabel>
        <PropertyNote>
          Audio akan otomatis diputar saat halaman dimuat (mungkin diblokir browser)
        </PropertyNote>
      </PropertySection>

      <PropertySection>
        <PropertyLabel>
          <input
            type="checkbox"
            checked={contentData.loop}
            onChange={(e) => handleContentUpdate({ loop: e.target.checked })}
            style={{ marginRight: '8px' }}
          />
          Loop
        </PropertyLabel>
        <PropertyNote>
          Audio akan diulang terus menerus
        </PropertyNote>
      </PropertySection>

      <ImageGalleryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={(url) => {
          handleContentUpdate({ url });
          setIsModalOpen(false);
        }}
      />
    </>
  );
};

