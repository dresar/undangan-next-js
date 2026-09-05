'use client';

import React from 'react';
import { Block } from '@/types/block';
import { PropertySection, PropertyLabel, PropertyInput, PropertySelect, PropertyNote } from '../shared/styled';
import { useEditorStore } from '@/store/useEditorStore';

interface LayerTabProps {
  block: Block;
  updateStyle: (key: string, value: any) => void;
}

export const LayerTab: React.FC<LayerTabProps> = ({
  block,
  updateStyle,
}) => {
  const blocks = useEditorStore((state) => state.blocks);
  const toggleLock = useEditorStore((state) => state.toggleLock);
  const updateBlock = useEditorStore((state) => state.updateBlock);
  const getChildBlocks = useEditorStore((state) => state.getChildBlocks);
  const setSelectedId = useEditorStore((state) => state.setSelectedId);

  const handleLockAll = () => {
    blocks.forEach((b) => {
      if (!b.locked) {
        toggleLock(b.id);
      }
    });
  };

  const handleUnlockAll = () => {
    blocks.forEach((b) => {
      if (b.locked) {
        toggleLock(b.id);
      }
    });
  };

  const allLocked = blocks.length > 0 && blocks.every((b) => b.locked);
  const allUnlocked = blocks.length > 0 && blocks.every((b) => !b.locked);

  // Get children if this is a container
  const childBlocks = block.type === 'container' ? getChildBlocks(block.id) : [];

  const getBlockLabel = (b: Block) => {
    if (b.type === 'text') {
      const content = typeof b.content === 'string' ? b.content : '';
      const text = content.replace(/<[^>]*>/g, '').substring(0, 20);
      return text || 'Text';
    }
    if (b.type === 'image') {
      return 'Gambar';
    }
    if (b.type === 'container') {
      return 'Container';
    }
    return b.type.charAt(0).toUpperCase() + b.type.slice(1);
  };

  return (
    <>
      {block.type === 'container' && childBlocks.length > 0 && (
        <PropertySection>
          <PropertyLabel>Children ({childBlocks.length})</PropertyLabel>
          <div style={{ 
            marginTop: '8px', 
            border: '1px solid #e0e0e0', 
            borderRadius: '4px',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {childBlocks.map((child) => (
              <div
                key={child.id}
                onClick={() => setSelectedId(child.id)}
                style={{
                  padding: '10px',
                  borderBottom: '1px solid #f0f0f0',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f5f5f5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '4px',
                  background: '#e0e0e0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  flexShrink: 0,
                }}>
                  {child.type === 'text' ? 'T' : child.type === 'image' ? '🖼' : child.type === 'container' ? '📦' : '?'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: '#333' }}>
                    {getBlockLabel(child)}
                  </div>
                  <div style={{ fontSize: '11px', color: '#999', textTransform: 'capitalize' }}>
                    {child.type}
                  </div>
                </div>
                {child.locked && (
                  <div style={{ fontSize: '12px', color: '#999' }}>🔒</div>
                )}
              </div>
            ))}
          </div>
          <PropertyNote style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
            Klik untuk memilih child component
          </PropertyNote>
        </PropertySection>
      )}

      {block.type === 'container' && childBlocks.length === 0 && (
        <PropertySection>
          <PropertyLabel>Children</PropertyLabel>
          <div style={{ 
            padding: '20px',
            textAlign: 'center',
            color: '#999',
            fontSize: '12px',
            border: '1px dashed #e0e0e0',
            borderRadius: '4px',
            background: '#fafafa',
          }}>
            Container kosong. Seret komponen ke container untuk menambahkannya.
          </div>
        </PropertySection>
      )}
      <PropertySection>
        <PropertyLabel>Kunci Semua / Buka Semua Kunci</PropertyLabel>
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <button
            onClick={handleLockAll}
            disabled={allLocked}
            style={{
              flex: 1,
              padding: '10px 16px',
              background: allLocked ? '#4a4a4a' : '#ff6b35',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              cursor: allLocked ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              fontWeight: 500,
              opacity: allLocked ? 0.5 : 1,
              transition: 'all 0.2s',
            }}
          >
            🔒 Kunci Semua
          </button>
          <button
            onClick={handleUnlockAll}
            disabled={allUnlocked}
            style={{
              flex: 1,
              padding: '10px 16px',
              background: allUnlocked ? '#4a4a4a' : '#25D366',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              cursor: allUnlocked ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              fontWeight: 500,
              opacity: allUnlocked ? 0.5 : 1,
              transition: 'all 0.2s',
            }}
          >
            🔓 Buka Semua Kunci
          </button>
        </div>
        <PropertyNote style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
          {allLocked 
            ? 'Semua komponen sudah terkunci' 
            : allUnlocked 
            ? 'Semua komponen sudah terbuka' 
            : `Kunci/Buka semua ${blocks.length} komponen sekaligus`}
        </PropertyNote>
      </PropertySection>

      <PropertySection>
        <PropertyLabel>Z-Index (Lapisan)</PropertyLabel>
        <PropertyInput
          type="number"
          value={(block.styles as any).zIndex || 0}
          onChange={(e) => updateStyle('zIndex', parseInt(e.target.value) || 0)}
          placeholder="0"
        />
        <PropertyNote>Urutan lapisan komponen (angka lebih besar = di atas, angka lebih kecil = di bawah)</PropertyNote>
      </PropertySection>

      <PropertySection>
        <PropertyLabel>Posisi</PropertyLabel>
        <PropertySelect
          value={block.styles.position || 'static'}
          onChange={(e) => updateStyle('position', e.target.value)}
        >
          <option value="static">Normal</option>
          <option value="relative">Relatif</option>
          <option value="absolute">Absolut</option>
          <option value="fixed">Tetap</option>
          <option value="sticky">Lengket</option>
        </PropertySelect>
        <PropertyNote>Jenis posisi komponen. Absolut/Tetap memungkinkan posisi bebas</PropertyNote>
      </PropertySection>

      <PropertySection>
        <PropertyLabel>Jarak dari Atas</PropertyLabel>
        <PropertyInput
          type="text"
          value={(block.styles as any).top || 'auto'}
          onChange={(e) => updateStyle('top', e.target.value)}
          placeholder="auto atau 10px"
        />
        <PropertyNote>Jarak dari atas (hanya untuk absolute/fixed position)</PropertyNote>
      </PropertySection>

      <PropertySection>
        <PropertyLabel>Jarak dari Kiri</PropertyLabel>
        <PropertyInput
          type="text"
          value={(block.styles as any).left || 'auto'}
          onChange={(e) => updateStyle('left', e.target.value)}
          placeholder="auto atau 10px"
        />
        <PropertyNote>Jarak dari kiri (hanya untuk absolute/fixed position)</PropertyNote>
      </PropertySection>

      <PropertySection>
        <PropertyLabel>Jarak dari Kanan</PropertyLabel>
        <PropertyInput
          type="text"
          value={(block.styles as any).right || 'auto'}
          onChange={(e) => updateStyle('right', e.target.value)}
          placeholder="auto atau 10px"
        />
        <PropertyNote>Jarak dari kanan (hanya untuk absolute/fixed position)</PropertyNote>
      </PropertySection>

      <PropertySection>
        <PropertyLabel>Jarak dari Bawah</PropertyLabel>
        <PropertyInput
          type="text"
          value={(block.styles as any).bottom || 'auto'}
          onChange={(e) => updateStyle('bottom', e.target.value)}
          placeholder="auto atau 10px"
        />
        <PropertyNote>Jarak dari bawah (hanya untuk absolute/fixed position)</PropertyNote>
      </PropertySection>
    </>
  );
};
