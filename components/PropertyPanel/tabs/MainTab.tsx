'use client';

import React from 'react';
import { Block } from '@/types/block';
import { TextProperties } from '../properties/TextProperties';
import { ImageProperties } from '../properties/ImageProperties';
import { ShapeProperties } from '../properties/ShapeProperties';
import { GiftProperties } from '../properties/GiftProperties';
import { BankProperties } from '../properties/BankProperties';
import { CountdownProperties } from '../properties/CountdownProperties';
import { ButtonProperties } from '../properties/ButtonProperties';
import { VideoProperties } from '../properties/VideoProperties';
import { MapProperties } from '../properties/MapProperties';
import { SpacerProperties } from '../properties/SpacerProperties';
import { FormProperties } from '../properties/FormProperties';
import { GalleryProperties } from '../properties/GalleryProperties';
import { IconProperties } from '../properties/IconProperties';
import { ImageTransitionProperties } from '../properties/ImageTransitionProperties';
import { MasonryProperties } from '../properties/MasonryProperties';
import { ContainerProperties } from '../properties/ContainerProperties';
import { SectionProperties } from '../properties/SectionProperties';

interface MainTabProps {
  block: Block;
  updateStyle: (key: string, value: any) => void;
  updateContent: (value: any) => void;
}

export const MainTab: React.FC<MainTabProps> = ({
  block,
  updateStyle,
  updateContent,
}) => {
  switch (block.type) {
    case 'text':
      return (
        <TextProperties
          block={block}
          updateStyle={updateStyle}
          updateContent={updateContent}
        />
      );

    case 'image':
      return (
        <ImageProperties
          block={block}
          updateStyle={updateStyle}
          updateContent={updateContent}
        />
      );

    case 'shape':
      return (
        <ShapeProperties
          block={block}
          updateStyle={updateStyle}
          updateContent={updateContent}
        />
      );

    case 'gift':
      return (
        <GiftProperties
          block={block}
          updateStyle={updateStyle}
          updateContent={updateContent}
        />
      );

    case 'bank':
      return (
        <BankProperties
          block={block}
          updateStyle={updateStyle}
          updateContent={updateContent}
        />
      );

    case 'countdown':
      return (
        <CountdownProperties
          block={block}
          updateStyle={updateStyle}
          updateContent={updateContent}
        />
      );

    case 'button':
      return (
        <ButtonProperties
          block={block}
          updateStyle={updateStyle}
          updateContent={updateContent}
        />
      );

    case 'video':
      return (
        <VideoProperties
          block={block}
          updateStyle={updateStyle}
          updateContent={updateContent}
        />
      );

    case 'map':
      return (
        <MapProperties
          block={block}
          updateStyle={updateStyle}
          updateContent={updateContent}
        />
      );

    case 'spacer':
      return (
        <SpacerProperties
          block={block}
          updateStyle={updateStyle}
          updateContent={updateContent}
        />
      );

    case 'form':
      return (
        <FormProperties
          block={block}
          updateStyle={updateStyle}
          updateContent={updateContent}
        />
      );

    case 'gallery':
      return (
        <GalleryProperties
          block={block}
          updateStyle={updateStyle}
          updateContent={updateContent}
        />
      );

    case 'icon':
      return (
        <IconProperties
          block={block}
          updateStyle={updateStyle}
          updateContent={updateContent}
        />
      );

    case 'imageTransition':
      return (
        <ImageTransitionProperties
          block={block}
          updateStyle={updateStyle}
          updateContent={updateContent}
        />
      );

    case 'masonry':
      return (
        <MasonryProperties
          block={block}
          updateStyle={updateStyle}
          updateContent={updateContent}
        />
      );

    case 'section':
      return (
        <>
          <SectionProperties
            block={block}
            updateStyle={updateStyle}
          />
          <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #4a4a4a' }}>
            <ContainerProperties
              block={block}
              updateStyle={updateStyle}
            />
          </div>
        </>
      );

    case 'container':
      return (
        <ContainerProperties
          block={block}
          updateStyle={updateStyle}
        />
      );

    default:
      return (
        <div style={{ padding: '20px', textAlign: 'center', color: '#999', fontSize: '12px' }}>
          Pengaturan untuk komponen ini belum tersedia
        </div>
      );
  }
};

