'use client';

import styled from 'styled-components';
import LeftSidebar from '../LeftSidebar';
import TopToolbar from '../TopToolbar';
import EditorArea from '../Canvas/EditorArea';
import LayerPanel from '../LayerPanel';
import UploadImageModal from '../Modal/UploadImageModal';
import ImageGalleryModal from '../Modal/ImageGalleryModal';
import MediaLibrary from '../LeftSidebar/MediaLibrary';
import NotificationProvider from '../Notification';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useState, useEffect } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { Block } from '@/types/block';

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: #f5f5f5;
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const CanvasContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  overflow-y: auto;
  overflow-x: hidden;
  background: #f5f5f5;
  padding: 0;
  position: relative;
  pointer-events: auto;
  width: 100%;
`;

export default function EditorLayout() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Configure sensors for drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    })
  );
  
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadCallback, setUploadCallback] = useState<((urls: string[]) => void) | null>(null);
  const [imageGalleryModalOpen, setImageGalleryModalOpen] = useState(false);
  const [imageGalleryCallback, setImageGalleryCallback] = useState<((url: string) => void) | null>(null);
  const [mediaLibraryModalOpen, setMediaLibraryModalOpen] = useState(false);
  const [mediaLibraryCallback, setMediaLibraryCallback] = useState<((url: string) => void) | null>(null);
  const [mediaLibraryType, setMediaLibraryType] = useState<'image' | 'video' | 'audio'>('image');
  const blocks = useEditorStore((state) => state.blocks);
  const addBlock = useEditorStore((state) => state.addBlock);
  const deviceView = useEditorStore((state) => state.deviceView);
  const selectedId = useEditorStore((state) => state.selectedId);
  const setSelectedId = useEditorStore((state) => state.setSelectedId);
  const updateBlock = useEditorStore((state) => state.updateBlock);
  const getState = useEditorStore.getState;

  // Fungsi untuk menghitung posisi tengah canvas berdasarkan device view
  const getCenterPosition = () => {
    let canvasWidth = 375; // mobile default
    switch (deviceView) {
      case 'mobile':
        canvasWidth = 375;
        break;
      case 'tablet':
        canvasWidth = 768;
        break;
      case 'desktop':
        canvasWidth = 1400;
        break;
    }
    
    const blockWidth = 300;
    const centerX = Math.max(0, (canvasWidth - blockWidth) / 2 - 20);
    const centerY = 100;
    
    return { x: centerX, y: centerY };
  };

  const duplicateBlock = useEditorStore((state) => state.duplicateBlock);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);

  // Keyboard shortcuts untuk move/resize selected block
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      // Ctrl+Z atau Cmd+Z untuk undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      // Ctrl+Y atau Ctrl+Shift+Z atau Cmd+Shift+Z untuk redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
        return;
      }

      // Ctrl+D atau Cmd+D untuk duplicate
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        if (selectedId) {
          duplicateBlock(selectedId);
        }
        return;
      }

      // Hanya aktif jika ada block yang dipilih dan tidak sedang mengetik di input
      if (!selectedId) return;

      const selectedBlock = blocks.find(b => b.id === selectedId);
      if (!selectedBlock || selectedBlock.locked) return;

      const step = e.shiftKey ? 10 : 1; // Shift = move lebih cepat
      const resizeStep = e.shiftKey ? 10 : 1;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          updateBlock(selectedId, {
            position: {
              x: selectedBlock.position?.x || 0,
              y: Math.max(0, (selectedBlock.position?.y || 0) - step)
            }
          });
          break;
        case 'ArrowDown':
          e.preventDefault();
          updateBlock(selectedId, {
            position: {
              x: selectedBlock.position?.x || 0,
              y: (selectedBlock.position?.y || 0) + step
            }
          });
          break;
        case 'ArrowLeft':
          e.preventDefault();
          updateBlock(selectedId, {
            position: {
              x: Math.max(0, (selectedBlock.position?.x || 0) - step),
              y: selectedBlock.position?.y || 0
            }
          });
          break;
        case 'ArrowRight':
          e.preventDefault();
          updateBlock(selectedId, {
            position: {
              x: (selectedBlock.position?.x || 0) + step,
              y: selectedBlock.position?.y || 0
            }
          });
          break;
        case 'PageUp':
          e.preventDefault();
          // Resize: increase size
          const currentWidth = typeof selectedBlock.size?.width === 'number' 
            ? selectedBlock.size.width 
            : (typeof selectedBlock.size?.width === 'string' && selectedBlock.size.width.includes('px')
              ? parseInt(selectedBlock.size.width) 
              : 300);
          const currentHeight = typeof selectedBlock.size?.height === 'number'
            ? selectedBlock.size.height
            : (typeof selectedBlock.size?.height === 'string' && selectedBlock.size.height.includes('px')
              ? parseInt(selectedBlock.size.height)
              : 200);
          updateBlock(selectedId, {
            size: {
              width: currentWidth + resizeStep,
              height: currentHeight + resizeStep
            }
          });
          break;
        case 'PageDown':
          e.preventDefault();
          // Resize: decrease size
          const currentWidth2 = typeof selectedBlock.size?.width === 'number'
            ? selectedBlock.size.width
            : (typeof selectedBlock.size?.width === 'string' && selectedBlock.size.width.includes('px')
              ? parseInt(selectedBlock.size.width)
              : 300);
          const currentHeight2 = typeof selectedBlock.size?.height === 'number'
            ? selectedBlock.size.height
            : (typeof selectedBlock.size?.height === 'string' && selectedBlock.size.height.includes('px')
              ? parseInt(selectedBlock.size.height)
              : 200);
          updateBlock(selectedId, {
            size: {
              width: Math.max(50, currentWidth2 - resizeStep),
              height: Math.max(50, currentHeight2 - resizeStep)
            }
          });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedId, blocks, updateBlock, duplicateBlock]);

  useEffect(() => {
    (window as any).openUploadModal = (callback: (urls: string[]) => void) => {
      setUploadCallback(() => callback);
      setUploadModalOpen(true);
    };
    (window as any).openImageGalleryModal = (callback: (url: string) => void) => {
      setImageGalleryCallback(() => callback);
      setImageGalleryModalOpen(true);
    };
    (window as any).openMediaLibrary = (type: 'image' | 'video' | 'audio', callback: (url: string) => void) => {
      setMediaLibraryType(type);
      setMediaLibraryCallback(() => callback);
      setMediaLibraryModalOpen(true);
    };
    return () => {
      delete (window as any).openUploadModal;
      delete (window as any).openImageGalleryModal;
      delete (window as any).openMediaLibrary;
    };
  }, []);

  // Handler untuk klik di luar canvas (di CanvasContainer tapi bukan di canvas atau block)
  const handleCanvasContainerClick = (e: React.MouseEvent) => {
    // Deselect block if clicking on canvas background, but not on a block itself
    const target = e.target as HTMLElement;
    
    // Don't deselect if clicking on:
    // - Section/container
    // - Layer/drop zone
    // - Toolbar
    // - Component/block
    if (
      target.closest('section') ||
      target.closest('[data-drop-zone]') ||
      target.closest('[data-toolbar]') ||
      target.closest('[data-block-id]') ||
      target.closest('[data-component-id]')
    ) {
      return;
    }
    
    // Only deselect if clicking directly on canvas background
    if (e.target === e.currentTarget) {
      setSelectedId(null);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    // HANYA set activeId jika drag dari sidebar (component-*)
    // JANGAN set jika drag block yang sudah ada di canvas
    // Pastikan ID adalah string dan dimulai dengan 'component-'
    const activeIdValue = event.active.id;
    
    // PASTIKAN: Hanya proses jika ID dimulai dengan 'component-'
    // Block yang sudah ada di canvas memiliki ID seperti 'image-1234567890-0.123'
    // Bukan 'component-image', jadi tidak akan terdeteksi
    if (typeof activeIdValue === 'string' && activeIdValue.startsWith('component-')) {
      // Double check: pastikan bukan block yang sudah ada
      const currentBlocks = getState().blocks;
      const isExistingBlock = currentBlocks.some(block => block.id === activeIdValue);
      if (!isExistingBlock) {
        setActiveId(activeIdValue);
      }
      // Jika block sudah ada, IGNORE (tidak akan terjadi karena ID berbeda)
    }
    // Jika bukan 'component-*', IGNORE (ini adalah block yang sudah ada di canvas)
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    // Validasi: pastikan ada over dan bukan drag ke dirinya sendiri
    if (!over || active.id === over.id) return;

    // PASTIKAN: HANYA proses jika drag dari sidebar (component type)
    // Block yang sudah ada di canvas memiliki ID seperti 'image-1234567890-0.123'
    // Bukan 'component-image', jadi TIDAK AKAN terdeteksi di sini
    const activeIdValue = active.id;
    
    // HANYA proses jika ID dimulai dengan 'component-' (dari sidebar)
    // JIKA TIDAK dimulai dengan 'component-', IGNORE (ini adalah block yang sudah ada)
    if (typeof activeIdValue === 'string' && activeIdValue.startsWith('component-')) {
      // Double check: pastikan bukan block yang sudah ada (seharusnya tidak terjadi)
      const currentBlocks = getState().blocks;
      const isExistingBlock = currentBlocks.some(block => block.id === activeIdValue);
      if (isExistingBlock) {
        // Ini adalah block yang sudah ada, jangan duplikasi
        return;
      }
      
      const componentType = activeIdValue.replace('component-', '') as Block['type'];
      
      // Only process valid BlockTypes (including section/container)
      const validTypes: Block['type'][] = [
        'section', 'text', 'image', 'video', 'map', 'countdown', 'button', 'shape', 'spacer',
        'masonry', 'gallery', 'imageTransition', 'form', 'icon', 'bank', 'gift', 'audio'
      ];
      if (!validTypes.includes(componentType)) {
        return; // Skip invalid component types
      }
      
      // Check if dropped on a section
      const overId = over.id as string;
      if (overId && overId.startsWith('section-drop-')) {
        const sectionId = overId.replace('section-drop-', '');
        const { addComponentToSection } = getState();
        const newComponent: Block = {
          id: `${componentType}-${Date.now()}-${Math.random()}`,
          type: componentType,
          parentId: sectionId,
          children: [],
          content: getDefaultContent(componentType),
          styles: getDefaultStyles(componentType),
          position: componentType === 'image' ? { x: 20, y: 20 } : undefined,
          size: componentType === 'image' ? { width: 200, height: 200 } : undefined,
        };
        addComponentToSection(sectionId, newComponent);
        getState().setSelectedId(newComponent.id);
        return;
      }
      
      // Fallback: If dropped on canvas (legacy support)
      if (over.id === 'canvas') {
        const centerPos = getCenterPosition();
        
        const newBlock: Block = {
          id: `${componentType}-${Date.now()}-${Math.random()}`,
          type: componentType,
          parentId: null,
          children: componentType === 'container' ? [] : [],
          content: getDefaultContent(componentType),
          styles: getDefaultStyles(componentType),
          position: centerPos, // Posisi di tengah canvas
          size: componentType === 'button' 
            ? { width: 200, height: 50 } // Default size untuk button agar bisa di-resize
            : undefined,
          animation: {
            type: 'none',
            duration: 1000,
            delay: 0,
            easing: 'easeInOut',
          },
        };

        addBlock(newBlock);
      }
    }
    // Jika bukan dari sidebar (misalnya drag block yang sudah ada), IGNORE TOTAL
    // react-rnd akan menangani drag block yang sudah ada di canvas
    // TIDAK ADA duplikasi di sini untuk block yang sudah ada
  };

  const getDefaultContent = (type: Block['type']): any => {
    switch (type) {
      case 'text':
        return 'Klik untuk mengedit teks';
      case 'image':
        return '/media/default/image-placeholder.svg';
      case 'video':
        return 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      case 'map':
        return { lat: -6.2088, lng: 106.8456 }; // Jakarta
      case 'countdown':
        return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      case 'button':
        return 'Klik Disini';
      case 'shape':
        return 'rectangle';
      case 'spacer':
        return { height: 40 };
      case 'masonry':
        return [
          '/media/default/image-placeholder.svg',
          '/media/default/image-placeholder.svg',
          '/media/default/image-placeholder.svg',
        ];
      case 'gallery':
        return [
          '/media/default/image-placeholder.svg',
          '/media/default/image-placeholder.svg',
          '/media/default/image-placeholder.svg',
        ];
      case 'imageTransition':
        return {
          images: [
            '/media/default/image-placeholder.svg',
            '/media/default/image-placeholder.svg',
          ],
          interval: 3000,
        };
      case 'form':
        return {
          fields: [
            { type: 'text', label: 'Nama', placeholder: 'Masukkan nama' },
            { type: 'email', label: 'Email', placeholder: 'Masukkan email' },
          ],
        };
      case 'icon':
        return { name: 'FaHeart', size: 24, color: '#ff0000' };
      case 'bank':
        return {
          name: 'Bank BCA',
          account: '1234567890',
          holder: 'Nama Pemilik',
        };
      case 'gift':
        return {
          title: 'Kirim Hadiah',
          description: 'Kirim hadiah untuk pasangan',
          accounts: [],
        };
      default:
        return '';
    }
  };

  const getDefaultStyles = (type: Block['type']): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      padding: '10px',
      margin: '10px 0',
    };

    switch (type) {
      case 'text':
        return {
          ...baseStyles,
          fontSize: '16px',
          color: '#000000',
          textAlign: 'left',
        };
      case 'image':
        return {
          ...baseStyles,
        };
      case 'button':
        return {
          ...baseStyles,
          backgroundColor: '#007bff',
          color: '#ffffff',
          padding: '12px 24px',
          borderRadius: '8px',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'center',
        };
      default:
        return baseStyles;
    }
  };

  const handleUpload = (urls: string[]) => {
    if (uploadCallback) {
      uploadCallback(urls);
    } else {
      // Jika tidak ada callback, langsung tambahkan sebagai image block baru
      urls.forEach((url) => {
        const newBlock: Block = {
          id: `image-${Date.now()}-${Math.random()}`,
          type: 'image',
          parentId: null,
          children: [],
          content: url,
          styles: {
            padding: '10px',
            margin: '10px 0',
          },
          size: {
            width: 200,
            height: 200,
          },
          position: {
            x: 0,
            y: 0,
          },
          animation: {
            type: 'none',
            duration: 1000,
            delay: 0,
            easing: 'easeInOut',
          },
        };
        addBlock(newBlock);
      });
    }
  };

  return (
    <DndContext 
      sensors={sensors}
      onDragStart={handleDragStart} 
      onDragEnd={handleDragEnd}
      // PASTIKAN: Hanya menangkap event dari sidebar, bukan dari react-rnd
      // Block yang sudah ada di canvas menggunakan react-rnd, bukan DndContext
    >
      <LayoutContainer>
        <TopToolbar />
        <MainContent>
          <LeftSidebar 
            collapsed={sidebarCollapsed} 
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} 
          />
          <CanvasContainer onClick={handleCanvasContainerClick}>
            <EditorArea />
          </CanvasContainer>
        </MainContent>
        <LayerPanel />
      </LayoutContainer>
      <DragOverlay>
        {activeId && activeId.startsWith('component-') ? (
          <div style={{ opacity: 0.5, pointerEvents: 'none' }}>
            {activeId.replace('component-', '')}
          </div>
        ) : null}
      </DragOverlay>
      <UploadImageModal
        isOpen={uploadModalOpen}
        onClose={() => {
          setUploadModalOpen(false);
          setUploadCallback(null);
        }}
        onUpload={handleUpload}
      />
      <ImageGalleryModal
        isOpen={imageGalleryModalOpen}
        onClose={() => {
          setImageGalleryModalOpen(false);
          setImageGalleryCallback(null);
        }}
        onSelect={(url) => {
          if (imageGalleryCallback) {
            imageGalleryCallback(url);
            setImageGalleryCallback(null);
          }
          setImageGalleryModalOpen(false);
        }}
      />
      {mediaLibraryModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
          }}
          onClick={() => {
            setMediaLibraryModalOpen(false);
            setMediaLibraryCallback(null);
          }}
        >
          <div
            style={{
              background: '#2a2a2a',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '900px',
              maxHeight: '90vh',
              overflow: 'auto',
              padding: '20px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#ffffff', margin: 0 }}>
                Pilih {mediaLibraryType === 'audio' ? 'Audio' : mediaLibraryType === 'video' ? 'Video' : 'Gambar'}
              </h2>
              <button
                onClick={() => {
                  setMediaLibraryModalOpen(false);
                  setMediaLibraryCallback(null);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#999',
                  fontSize: '20px',
                  cursor: 'pointer',
                  padding: '8px',
                }}
              >
                ×
              </button>
            </div>
            <MediaLibrary
              fileType={mediaLibraryType}
              onSelect={(url) => {
                if (mediaLibraryCallback) {
                  mediaLibraryCallback(url);
                  setMediaLibraryCallback(null);
                }
                setMediaLibraryModalOpen(false);
              }}
              showUploadButton={false}
            />
          </div>
        </div>
      )}
      <NotificationProvider />
    </DndContext>
  );
}

