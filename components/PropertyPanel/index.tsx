'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useEditorStore } from '@/store/useEditorStore';
import { Block } from '@/types/block';
import { PropertyTabs, PropertyTab, PropertyContent } from './shared/styled';
import { PropertyTabType } from './shared/constants';
import { MainTab } from './tabs/MainTab';
import { SettingTab } from './tabs/SettingTab';
import { LayerTab } from './tabs/LayerTab';
import { AnimasiTab } from './tabs/AnimasiTab';
import { CSSTab } from './tabs/CSSTab';
import { parsePadding } from './shared/utils';

interface PropertyPanelProps {
  block: Block;
}

export default function PropertyPanel({ block }: PropertyPanelProps) {
  const [activePropertyTab, setActivePropertyTab] = useState<PropertyTabType>('main');
  const updateBlock = useEditorStore((state) => state.updateBlock);
  
  // Check if layer is selected (layer selection takes priority)

  const updateStyle = (key: string, value: any) => {
    updateBlock(block.id, {
      styles: {
        ...block.styles,
        [key]: value,
      },
    });
  };

  const updateContent = (value: any) => {
    updateBlock(block.id, { content: value });
  };

  const updateAnimation = (updates: Partial<Block['animation']>) => {
    updateBlock(block.id, {
      animation: {
        ...(block.animation || { type: 'none', duration: 2000, delay: 0, easing: 'power1.inOut' }),
        ...updates,
      },
    });
  };

  const updateCustomCSS = (css: string) => {
    updateBlock(block.id, { customCSS: css });
  };

  const updatePadding = (side: 'top' | 'right' | 'bottom' | 'left', value: number) => {
    const padding = parsePadding(block);
    const newPadding = { ...padding, [side]: value };
    updateStyle('padding', `${newPadding.top}px ${newPadding.right}px ${newPadding.bottom}px ${newPadding.left}px`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <PropertyTabs>
        <PropertyTab
          $active={activePropertyTab === 'main'}
          onClick={() => setActivePropertyTab('main')}
        >
          utama
        </PropertyTab>
        <PropertyTab
          $active={activePropertyTab === 'setting'}
          onClick={() => setActivePropertyTab('setting')}
        >
          pengaturan
        </PropertyTab>
        <PropertyTab
          $active={activePropertyTab === 'layer'}
          onClick={() => setActivePropertyTab('layer')}
        >
          lapisan
        </PropertyTab>
        <PropertyTab
          $active={activePropertyTab === 'animasi'}
          onClick={() => setActivePropertyTab('animasi')}
        >
          animasi
        </PropertyTab>
        <PropertyTab
          $active={activePropertyTab === 'css'}
          onClick={() => setActivePropertyTab('css')}
        >
          css
        </PropertyTab>
      </PropertyTabs>
      <PropertyContent>
        <motion.div
          key={activePropertyTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activePropertyTab === 'main' && (
            <MainTab
              block={block}
              updateStyle={updateStyle}
              updateContent={updateContent}
            />
          )}
          {activePropertyTab === 'setting' && (
            <SettingTab
              block={block}
              updateStyle={updateStyle}
              updatePadding={updatePadding}
            />
          )}
          {activePropertyTab === 'layer' && (
            <LayerTab
              block={block}
              updateStyle={updateStyle}
            />
          )}
          {activePropertyTab === 'animasi' && (
            <AnimasiTab
              block={block}
              updateAnimation={updateAnimation}
            />
          )}
          {activePropertyTab === 'css' && (
            <CSSTab
              block={block}
              updateCustomCSS={updateCustomCSS}
            />
          )}
        </motion.div>
      </PropertyContent>
    </div>
  );
}

