'use client';

import React, { useState, useEffect } from 'react';
import { Block } from '@/types/block';
import { PropertySection, PropertyLabel, PropertyInput, PropertySelect, PropertyNote } from '../shared/styled';
import { Slider } from '../shared/Slider';
import ImageGalleryModal from '../../Modal/ImageGalleryModal';
import { useEditorStore } from '@/store/useEditorStore';

interface ImagePropertiesProps {
  block: Block;
  updateStyle: (key: string, value: any) => void;
  updateContent: (value: any) => void;
}

interface Folder {
  id: string;
  name: string;
  description?: string;
}

export const ImageProperties: React.FC<ImagePropertiesProps> = ({
  block,
  updateStyle,
  updateContent,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const projectId = useEditorStore((state) => state.projectId);
  const imageSrc = block.content || '';
  const isPlaceholder = !imageSrc || imageSrc === '/media/default/image-placeholder.svg';

  useEffect(() => {
    loadFolders();
  }, [projectId]);

  const loadFolders = async () => {
    try {
      // Load folder global (tanpa projectId) DAN folder project-specific
      // API akan return semua folder: global + project-specific
      const url = projectId ? `/api/folders?projectId=${projectId}` : '/api/folders';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        console.log('Loaded folders:', data);
        setFolders(data || []);
      } else {
        console.error('Failed to load folders:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error loading folders:', error);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFolderName.trim(),
          projectId: projectId || null,
        }),
      });

      if (response.ok) {
        const newFolder = await response.json();
        console.log('Folder created successfully:', newFolder);
        // Reload folders setelah create
        await loadFolders();
        setNewFolderName('');
        setShowNewFolderInput(false);
      } else {
        const errorData = await response.json();
        console.error('Failed to create folder:', errorData);
      }
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };
  
  // Helper untuk extract number dari style value
  const extractStyleNumber = (value: any, defaultValue: number = 0): number => {
    if (!value) return defaultValue;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const numStr = value.replace(/px|%|em|rem/g, '').trim();
      const num = parseFloat(numStr);
      return isNaN(num) ? defaultValue : num;
    }
    return defaultValue;
  };

  const borderRadius = extractStyleNumber(block.styles.borderRadius, 0);
  const opacity = extractStyleNumber((block.styles as any).opacity, 100);
  
  // Extract transform values
  const extractRotation = (transform: string | undefined): number => {
    if (!transform) return 0;
    const match = transform.match(/rotate\(([^)]+)\)/);
    if (match) {
      const value = match[1].replace('deg', '').trim();
      return parseFloat(value) || 0;
    }
    return 0;
  };

  const extractScaleX = (transform: string | undefined): number => {
    if (!transform) return 1;
    const match = transform.match(/scaleX\(([^)]+)\)/);
    if (match) {
      return parseFloat(match[1]) || 1;
    }
    return 1;
  };

  const extractScaleY = (transform: string | undefined): number => {
    if (!transform) return 1;
    const match = transform.match(/scaleY\(([^)]+)\)/);
    if (match) {
      return parseFloat(match[1]) || 1;
    }
    return 1;
  };

  const currentTransform = (block.styles as any).transform || '';
  const rotation = extractRotation(currentTransform);
  const scaleX = extractScaleX(currentTransform);
  const scaleY = extractScaleY(currentTransform);

  const updateTransform = (newRotation: number, newScaleX: number, newScaleY: number) => {
    const transformValue = `rotate(${newRotation}deg) scaleX(${newScaleX}) scaleY(${newScaleY})`;
    updateStyle('transform', transformValue);
  };

  return (
    <>
      <PropertySection>
        <PropertyLabel style={{ color: '#ff4444' }}>*URL Gambar</PropertyLabel>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <PropertyInput
            type="url"
            value={imageSrc}
            onChange={(e) => updateContent(e.target.value)}
            placeholder="/media/default/image-placeholder.svg"
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
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            title="Pilih dari Library atau Upload"
          >
            📁 Pilih
          </button>
        </div>
        <PropertyNote>
          Masukkan URL gambar atau klik "Pilih" untuk memilih dari library, upload, atau CDN.
        </PropertyNote>
        {!isPlaceholder && (
          <button
            onClick={() => updateContent('/media/default/image-placeholder.svg')}
            style={{
              marginTop: '8px',
              padding: '8px 16px',
              background: '#4a4a4a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              width: '100%',
            }}
          >
            🔄 Reset ke Placeholder
          </button>
        )}
      </PropertySection>

      <PropertySection>
        <PropertyLabel>Folder (Organisasi)</PropertyLabel>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
          <select
            value={selectedFolderId || ''}
            onChange={(e) => setSelectedFolderId(e.target.value || null)}
            style={{
              flex: 1,
              minWidth: '150px',
              padding: '8px 12px',
              background: '#3a3a3a',
              border: '1px solid #4a4a4a',
              borderRadius: '4px',
              color: '#ffffff',
              fontSize: '12px',
            }}
          >
            <option value="">Tanpa Folder</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                📁 {folder.name}
              </option>
            ))}
          </select>
          {showNewFolderInput ? (
            <div style={{ display: 'flex', gap: '4px', flex: 1, minWidth: '200px' }}>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Nama folder..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateFolder();
                  }
                }}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  background: '#3a3a3a',
                  border: '1px solid #4a4a4a',
                  borderRadius: '4px',
                  color: '#ffffff',
                  fontSize: '12px',
                }}
                autoFocus
              />
              <button
                onClick={handleCreateFolder}
                style={{
                  padding: '8px 12px',
                  background: '#ff6b35',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                ✓
              </button>
              <button
                onClick={() => {
                  setShowNewFolderInput(false);
                  setNewFolderName('');
                }}
                style={{
                  padding: '8px 12px',
                  background: '#4a4a4a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowNewFolderInput(true)}
              style={{
                padding: '8px 12px',
                background: '#4a4a4a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
              title="Buat folder baru"
            >
              + Folder
            </button>
          )}
        </div>
        <PropertyNote>
          Pilih folder untuk mengorganisir gambar. Folder akan digunakan saat upload gambar baru.
        </PropertyNote>
      </PropertySection>

      <ImageGalleryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={(url) => {
          console.log('Image selected from gallery, URL:', url);
          if (!url) {
            console.error('Image URL is empty!');
            return;
          }
          updateContent(url);
          setIsModalOpen(false);
          // Force save immediately after selecting image
          setTimeout(() => {
            const saveToDatabase = useEditorStore.getState().saveToDatabase;
            saveToDatabase().catch((error) => {
              console.error('Error saving after image selection:', error);
            });
          }, 500);
        }}
      />

      <PropertySection>
        <PropertyLabel style={{ color: '#ff4444' }}>*Object Fit</PropertyLabel>
        <PropertySelect
          value={(block.styles as any).objectFit || 'cover'}
          onChange={(e) => updateStyle('objectFit', e.target.value)}
        >
          <option value="cover">Cover (Penuh, potong jika perlu)</option>
          <option value="contain">Contain (Masuk semua, ada ruang kosong)</option>
          <option value="fill">Fill (Regangkan penuh)</option>
          <option value="none">None (Ukuran asli)</option>
          <option value="scale-down">Scale Down (Perkecil jika perlu)</option>
        </PropertySelect>
        <PropertyNote>
          Cara gambar menyesuaikan dengan ukuran container
        </PropertyNote>
      </PropertySection>

      <PropertySection>
        <PropertyLabel>Object Position</PropertyLabel>
        <PropertySelect
          value={(block.styles as any).objectPosition || 'center'}
          onChange={(e) => updateStyle('objectPosition', e.target.value)}
        >
          <option value="center">Center (Tengah)</option>
          <option value="top">Top (Atas)</option>
          <option value="bottom">Bottom (Bawah)</option>
          <option value="left">Left (Kiri)</option>
          <option value="right">Right (Kanan)</option>
          <option value="top left">Top Left</option>
          <option value="top right">Top Right</option>
          <option value="bottom left">Bottom Left</option>
          <option value="bottom right">Bottom Right</option>
        </PropertySelect>
        <PropertyNote>
          Posisi gambar dalam container (berguna saat object-fit: cover)
        </PropertyNote>
      </PropertySection>

      <PropertySection>
        <PropertyLabel style={{ color: '#ff4444' }}>*Width (Lebar)</PropertyLabel>
        <Slider
          label="Width"
          value={extractStyleNumber(block.size?.width || block.styles.width, 300)}
          onChange={(v) => {
            const updateBlock = useEditorStore.getState().updateBlock;
            updateBlock(block.id, {
              size: {
                width: v,
                height: block.size?.height || block.styles.height || 'auto'
              }
            });
          }}
          min={50}
          max={1400}
        />
        <PropertyNote>
          Lebar gambar dalam pixel (50px - 1400px)
        </PropertyNote>
      </PropertySection>

      <PropertySection>
        <PropertyLabel style={{ color: '#ff4444' }}>*Height (Tinggi)</PropertyLabel>
        <Slider
          label="Height"
          value={extractStyleNumber(block.size?.height || block.styles.height, 200)}
          onChange={(v) => {
            const updateBlock = useEditorStore.getState().updateBlock;
            updateBlock(block.id, {
              size: {
                width: block.size?.width || block.styles.width || 300,
                height: v
              }
            });
          }}
          min={50}
          max={2000}
        />
        <PropertyNote>
          Tinggi gambar dalam pixel (50px - 2000px)
        </PropertyNote>
      </PropertySection>

      <PropertySection>
        <PropertyLabel>Posisi Gambar (Margin)</PropertyLabel>
        <div style={{ marginBottom: '12px' }}>
          <Slider
            label="Jarak dari Atas"
            value={extractStyleNumber((block.styles as any).marginTop, 0)}
            onChange={(v) => updateStyle('marginTop', `${v}px`)}
            min={0}
            max={500}
          />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <Slider
            label="Jarak dari Bawah"
            value={extractStyleNumber((block.styles as any).marginBottom, 0)}
            onChange={(v) => updateStyle('marginBottom', `${v}px`)}
            min={0}
            max={500}
          />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <Slider
            label="Jarak dari Kiri"
            value={extractStyleNumber((block.styles as any).marginLeft, 0)}
            onChange={(v) => updateStyle('marginLeft', `${v}px`)}
            min={0}
            max={500}
          />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <Slider
            label="Jarak dari Kanan"
            value={extractStyleNumber((block.styles as any).marginRight, 0)}
            onChange={(v) => updateStyle('marginRight', `${v}px`)}
            min={0}
            max={500}
          />
        </div>
        <PropertyNote>
          Atur jarak gambar dari semua sisi (atas, bawah, kiri, kanan)
        </PropertyNote>
      </PropertySection>

      <PropertySection>
        <Slider
          label="Border Radius (Sudut Runcing)"
          value={borderRadius}
          onChange={(v) => updateStyle('borderRadius', `${v}px`)}
          min={0}
          max={100}
        />
        <PropertyNote>
          Membuat sudut gambar menjadi runcing/lengkung (0px = persegi tajam, 10-20px = runcing, 50px+ = bulat)
        </PropertyNote>
      </PropertySection>


      <PropertySection>
        <PropertyLabel>Posisi (Seperti Volume)</PropertyLabel>
        <div style={{ marginBottom: '16px' }}>
          <Slider
            label="Jarak dari Atas (Y)"
            value={block.position?.y || 0}
            onChange={(v) => {
              const updateBlock = useEditorStore.getState().updateBlock;
              updateBlock(block.id, { 
                position: { 
                  x: block.position?.x || 0, 
                  y: v 
                } 
              });
            }}
            min={0}
            max={2000}
          />
          <PropertyNote>
            Geser untuk mengatur jarak dari atas (0 = rapat ke header)
          </PropertyNote>
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <Slider
            label="Jarak dari Kiri (X)"
            value={block.position?.x || 0}
            onChange={(v) => {
              const updateBlock = useEditorStore.getState().updateBlock;
              updateBlock(block.id, { 
                position: { 
                  x: v, 
                  y: block.position?.y || 0 
                } 
              });
            }}
            min={0}
            max={1400}
          />
          <PropertyNote>
            Geser untuk mengatur jarak dari kiri
          </PropertyNote>
        </div>
      </PropertySection>


      <PropertySection>
        <Slider
          label="Opacity"
          value={opacity}
          onChange={(v) => updateStyle('opacity', `${v / 100}`)}
          min={0}
          max={100}
        />
        <PropertyNote>
          Transparansi gambar (0% = transparan, 100% = solid). Berguna untuk efek overlay dan animasi.
        </PropertyNote>
      </PropertySection>

      <PropertySection>
        <PropertyLabel>Transform & Rotasi</PropertyLabel>
        <div style={{ marginBottom: '12px' }}>
          <Slider
            label={`Rotasi: ${rotation}°`}
            value={rotation}
            onChange={(v) => updateTransform(v, scaleX, scaleY)}
            min={0}
            max={360}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '12px' }}>
          <button
            onClick={() => updateTransform(90, scaleX, scaleY)}
            style={{
              padding: '8px',
              background: '#4a4a4a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            ↻ 90°
          </button>
          <button
            onClick={() => updateTransform(180, scaleX, scaleY)}
            style={{
              padding: '8px',
              background: '#4a4a4a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            ↻ 180°
          </button>
          <button
            onClick={() => updateTransform(rotation, scaleX === 1 ? -1 : 1, scaleY)}
            style={{
              padding: '8px',
              background: '#4a4a4a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            ⇄ Balik Horizontal
          </button>
          <button
            onClick={() => updateTransform(rotation, scaleX, scaleY === 1 ? -1 : 1)}
            style={{
              padding: '8px',
              background: '#4a4a4a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            ⇅ Balik Vertikal
          </button>
        </div>
        <button
          onClick={() => updateTransform(0, 1, 1)}
          style={{
            width: '100%',
            padding: '8px',
            background: '#ff6b35',
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            marginTop: '8px',
          }}
        >
          🔄 Reset Transform
        </button>
        <PropertyNote>
          Rotasi gambar (0-360°), balik horizontal/vertikal, atau reset ke default.
        </PropertyNote>
      </PropertySection>

      <PropertySection>
        <PropertyLabel>Alt Text</PropertyLabel>
        <PropertyInput
          type="text"
          value={(block as any).alt || ''}
          onChange={(e) => {
            updateStyle('alt', e.target.value);
          }}
          placeholder="Deskripsi gambar untuk aksesibilitas"
        />
        <PropertyNote>
          Teks alternatif untuk aksesibilitas dan SEO (opsional tapi disarankan)
        </PropertyNote>
      </PropertySection>
    </>
  );
};

