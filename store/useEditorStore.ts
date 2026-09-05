import { create } from 'zustand';
import { Block, HistoryState } from '@/types/block';
import { 
  exportThemeToJSON, 
  importThemeFromJSON, 
  downloadThemeAsJSON,
  readThemeFromFile 
} from '@/lib/themeExportImport';
import { generateSlug } from '@/lib/utils';

interface EditorState {
  blocks: Block[];
  sectionOrder: string[];
  selectedId: string | null;
  history: HistoryState;
  deviceView: 'mobile' | 'tablet' | 'desktop';
  canvasBackground?: string;
  
  // Actions
  addBlock: (block: Block) => void;
  updateBlock: (id: string, updates: Partial<Block>) => void;
  deleteBlock: (id: string) => void;
  duplicateBlock: (id: string) => void;
  toggleLock: (id: string) => void;
  setSelectedId: (id: string | null) => void;
  setDeviceView: (view: 'mobile' | 'tablet' | 'desktop') => void;
  
  // Section operations
  addSection: () => string;
  getSections: () => Block[];
  getComponentsInSection: (sectionId: string) => Block[];
  addComponentToSection: (sectionId: string, component: Block) => void;
  
  // History
  undo: () => void;
  redo: () => void;
  saveHistory: () => void;
  
  // Persistence
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => boolean;
  
  // Database operations
  saveToDatabase: (title?: string) => Promise<void>;
  loadFromDatabase: (id: string) => Promise<void>;
  publish: () => Promise<string | null>;
  projectId: string | null;
  projectTitle: string;
  projectDescription: string;
  projectUrl: string;
  projectThumbnail: string;
  projectSlug: string;
  coverImage: string;
  coverButtonText: string;
  coverEnabled: boolean;
  musicUrl: string;
  setProjectId: (id: string | null) => void;
  setProjectTitle: (title: string) => void;
  setProjectDescription: (description: string) => void;
  setProjectUrl: (url: string) => void;
  setProjectThumbnail: (thumbnail: string) => void;
  setProjectSlug: (slug: string) => void;
  setCoverImage: (url: string) => void;
  setCoverButtonText: (text: string) => void;
  setCoverEnabled: (enabled: boolean) => void;
  setMusicUrl: (url: string) => void;
  generateInvitationUrl: () => string;
  
  // Theme export/import operations
  exportTheme: (name?: string, description?: string) => string;
  exportThemeToFile: (name?: string, description?: string) => void;
  exportThemeToDatabase: (name: string, description?: string) => Promise<void>;
  importThemeFromFile: (file: File) => Promise<void>;
  importThemeFromJSON: (jsonString: string) => Promise<void>;
  importThemeFromDatabase: (id: string) => Promise<void>;
}

const MAX_HISTORY = 200;

const createHistoryState = (blocks: Block[]): HistoryState => ({
  past: [],
  present: blocks,
  future: [],
});

export const useEditorStore = create<EditorState>((set, get) => ({
  blocks: [],
  sectionOrder: [], // Maintain vertical order of sections
  selectedId: null,
  history: createHistoryState([]),
  deviceView: 'mobile',
  projectId: null,
  projectTitle: 'Untitled Project',
  projectDescription: 'Undangan digital yang dibuat dengan Idinvitebook',
  projectUrl: '',
  projectThumbnail: '',
  projectSlug: '',
  coverImage: '',
  coverButtonText: 'Buka Undangan',
  coverEnabled: false,
  musicUrl: '',

  addBlock: (block, parentId = null) => {
    const { blocks, saveHistory } = get();
    // PASTIKAN: Block dengan ID yang sama tidak ada (mencegah duplikasi)
    const existingBlock = blocks.find(b => b.id === block.id);
    if (existingBlock) {
      // Block dengan ID yang sama sudah ada, TIDAK akan menambahkan (mencegah duplikasi)
      return;
    }
    
    const newBlock: Block = {
      ...block,
      parentId: parentId ?? block.parentId ?? null,
      children: block.type === 'section' ? (block.children || []) : [],
    };
    
    const newBlocks = [...blocks, newBlock];
    
    if (newBlock.type === 'section' && newBlock.parentId === null) {
      const { sectionOrder } = get();
      if (!sectionOrder.includes(newBlock.id)) {
        set({ sectionOrder: [...sectionOrder, newBlock.id] });
      }
    }
    
    if (newBlock.parentId) {
      const parentIndex = newBlocks.findIndex(b => b.id === newBlock.parentId);
      if (parentIndex !== -1) {
        const parent = newBlocks[parentIndex];
        if (parent.type === 'section') {
          newBlocks[parentIndex] = {
            ...parent,
            children: [...(parent.children || []), newBlock.id],
          };
        }
      }
    }
    
    set({ blocks: newBlocks });
    saveHistory();
    
    // SAVE KE LOCALSTORAGE DULU (hard cache, instant)
    get().saveToLocalStorage();
    
    // TIDAK AUTO-SAVE KE DATABASE - hanya save ketika tombol Save diklik
  },

  updateBlock: (id, updates) => {
    const { blocks, saveHistory, projectId, projectTitle } = get();
    const newBlocks = blocks.map((block) => {
      if (block.id === id) {
        let updatedBlock = { ...block };
        
        if (updates.styles) {
          updatedBlock = {
            ...updatedBlock,
            styles: {
              ...block.styles,
              ...updates.styles,
            },
          };
        }
        
        if (updates.size) {
          updatedBlock = {
            ...updatedBlock,
            size: {
              ...block.size,
              ...updates.size,
            },
          };
        }
        
        if (updates.position) {
          updatedBlock = {
            ...updatedBlock,
            position: {
              ...block.position,
              ...updates.position,
            },
          };
        }
        
        if (updates.animation) {
          updatedBlock = {
            ...updatedBlock,
            animation: {
              ...block.animation,
              ...updates.animation,
            },
          };
        }
        
        const otherUpdates = { ...updates };
        delete otherUpdates.styles;
        delete otherUpdates.size;
        delete otherUpdates.position;
        delete otherUpdates.animation;
        
        updatedBlock = { ...updatedBlock, ...otherUpdates };
        
        return updatedBlock;
      }
      return block;
    });
    set({ blocks: newBlocks });
    saveHistory();
    
    // SAVE KE LOCALSTORAGE DULU (hard cache, instant)
    get().saveToLocalStorage();
    
    // TIDAK AUTO-SAVE KE DATABASE - hanya save ketika tombol Save diklik
  },

  deleteBlock: (id) => {
    const { blocks, sectionOrder, saveHistory } = get();
    
    // Fungsi recursive untuk menghapus block dan semua children-nya
    const deleteBlockRecursive = (blockId: string, blocksList: Block[]): Block[] => {
      const blockToDelete = blocksList.find(b => b.id === blockId);
      if (!blockToDelete) return blocksList;
      
      // Hapus semua children terlebih dahulu
      let updatedBlocks = blocksList;
      if ((blockToDelete.type === 'container' || blockToDelete.type === 'section') && blockToDelete.children) {
        blockToDelete.children.forEach(childId => {
          updatedBlocks = deleteBlockRecursive(childId, updatedBlocks);
        });
      }
      
      // Hapus block dari children array parent jika ada
      if (blockToDelete.parentId) {
        updatedBlocks = updatedBlocks.map(block => {
          if (block.id === blockToDelete.parentId && (block.type === 'container' || block.type === 'section')) {
            return {
              ...block,
              children: (block.children || []).filter(childId => childId !== blockId),
            };
          }
          return block;
        });
      }
      
      // Hapus block itu sendiri
      return updatedBlocks.filter(block => block.id !== blockId);
    };
    
    const newBlocks = deleteBlockRecursive(id, blocks);
    
    // If deleting a section, remove from sectionOrder
    const blockToDelete = blocks.find(b => b.id === id);
    let newSectionOrder = sectionOrder;
    if (blockToDelete && (blockToDelete.type === 'section' || (blockToDelete.type === 'container' && blockToDelete.parentId === null))) {
      newSectionOrder = sectionOrder.filter(sectionId => sectionId !== id);
    }
    
    set({ blocks: newBlocks, sectionOrder: newSectionOrder, selectedId: null });
    saveHistory();
    
    // SAVE KE LOCALSTORAGE DULU (hard cache, instant)
    get().saveToLocalStorage();
  },

  duplicateBlock: (id) => {
    const { blocks, duplicateSection } = get();
    const blockToDuplicate = blocks.find((b) => b.id === id);
    if (!blockToDuplicate) return;

    if (blockToDuplicate.type === 'section') {
      duplicateSection(id);
      return;
    }

    if (blockToDuplicate.type === 'container') {
      const parentSection = blocks.find(b => b.id === blockToDuplicate.parentId && b.type === 'section');
      if (parentSection) {
        duplicateSection(parentSection.id);
        return;
      }
    }

    const { saveHistory, addBlock } = get();
    const newBlock: Block = {
      id: `${blockToDuplicate.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: blockToDuplicate.type,
      parentId: blockToDuplicate.parentId ?? null,
      children: [],
      content: typeof blockToDuplicate.content === 'string' 
        ? blockToDuplicate.content 
        : JSON.parse(JSON.stringify(blockToDuplicate.content || '')),
      styles: JSON.parse(JSON.stringify(blockToDuplicate.styles || {})),
      position: blockToDuplicate.position
        ? {
            x: blockToDuplicate.position.x || 0,
            y: (blockToDuplicate.position.y || 0) + (blockToDuplicate.size?.height ? (typeof blockToDuplicate.size.height === 'number' ? blockToDuplicate.size.height : parseInt(blockToDuplicate.size.height.toString().replace('px', '')) || 300) : 300) + 20,
          }
        : undefined,
      size: blockToDuplicate.size 
        ? JSON.parse(JSON.stringify(blockToDuplicate.size))
        : undefined,
      animation: blockToDuplicate.animation
        ? JSON.parse(JSON.stringify(blockToDuplicate.animation))
        : undefined,
      customCSS: blockToDuplicate.customCSS || undefined,
      locked: blockToDuplicate.locked || false,
    };

    addBlock(newBlock, newBlock.parentId);
    set({ selectedId: newBlock.id });
    saveHistory();
    get().saveToLocalStorage();
  },


  toggleLock: (id) => {
    const { blocks, saveHistory } = get();
    const newBlocks = blocks.map((block) =>
      block.id === id ? { ...block, locked: !block.locked } : block
    );
    set({ blocks: newBlocks });
    saveHistory();
  },

  moveBlock: (id, direction) => {
    const { blocks, saveHistory } = get();
    const index = blocks.findIndex((b) => b.id === id);
    if (index === -1) return;

    const newBlocks = [...blocks];
    if (direction === 'up' && index > 0) {
      [newBlocks[index - 1], newBlocks[index]] = [
        newBlocks[index],
        newBlocks[index - 1],
      ];
    } else if (direction === 'down' && index < newBlocks.length - 1) {
      [newBlocks[index], newBlocks[index + 1]] = [
        newBlocks[index + 1],
        newBlocks[index],
      ];
    }
    set({ blocks: newBlocks });
    saveHistory();
    get().saveToLocalStorage();
  },

  moveBlockToPosition: (id, newIndex) => {
    const { blocks, saveHistory } = get();
    const currentIndex = blocks.findIndex((b) => b.id === id);
    if (currentIndex === -1) return;
    
    const targetIndex = Math.max(0, Math.min(newIndex, blocks.length - 1));
    if (currentIndex === targetIndex) return;
    
    const newBlocks = [...blocks];
    const movedBlock = newBlocks[currentIndex];
    
    newBlocks.splice(currentIndex, 1);
    newBlocks.splice(targetIndex, 0, movedBlock);
    
    set({ blocks: newBlocks });
    saveHistory();
    get().saveToLocalStorage();
  },

  setSelectedId: (id) => set({ selectedId: id }),

  // Nested container helper functions
  getParentBlock: (blockId) => {
    const { blocks } = get();
    const block = blocks.find(b => b.id === blockId);
    if (!block || !block.parentId) return null;
    return blocks.find(b => b.id === block.parentId) || null;
  },

  getChildBlocks: (parentId) => {
    const { blocks } = get();
    const parent = blocks.find(b => b.id === parentId);
    if (!parent || parent.type !== 'section' || !parent.children) return [];
    return blocks.filter(b => parent.children.includes(b.id));
  },

  getRootBlocks: () => {
    const { blocks } = get();
    return blocks.filter(b => b.parentId === null);
  },

  getSections: () => {
    const { blocks, sectionOrder } = get();
    const allSections = blocks.filter(b => b.type === 'section' && b.parentId === null);
    
    if (sectionOrder.length === 0 && allSections.length > 0) {
      const order = allSections.map(s => s.id);
      set({ sectionOrder: order });
      return allSections;
    }
    
    if (sectionOrder.length > 0) {
      const orderedSections = sectionOrder
        .map(id => blocks.find(b => b.id === id))
        .filter((b): b is Block => b !== undefined && b.type === 'section' && b.parentId === null);
      
      const missingSections = allSections.filter(s => !sectionOrder.includes(s.id));
      if (missingSections.length > 0) {
        const newOrder = [...sectionOrder, ...missingSections.map(s => s.id)];
        set({ sectionOrder: newOrder });
        return [...orderedSections, ...missingSections];
      }
      
      return orderedSections;
    }
    
    return [];
  },

  selectParent: (blockId) => {
    const { getParentBlock, setSelectedId } = get();
    const parent = getParentBlock(blockId);
    if (parent) {
      setSelectedId(parent.id);
    }
  },

  // Section-based operations
  addSection: () => {
    const { blocks, sectionOrder, saveHistory } = get();
    
    const sectionId = `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newSection: Block = {
      id: sectionId,
      type: 'section',
      parentId: null,
      children: [],
      content: '',
      styles: {
        width: '100%',
        minHeight: '150px',
        backgroundColor: '#ffffff',
        position: 'relative',
        containerStyles: {
          maxWidth: '1400px',
          padding: '20px',
          backgroundColor: '',
        },
      },
      position: undefined,
      size: {
        width: '100%',
        height: 'auto',
      },
      animation: {
        type: 'none',
        duration: 1000,
        delay: 0,
        easing: 'easeInOut',
      },
    };

    const newBlocks = [...blocks, newSection];
    const newSectionOrder = [...sectionOrder, sectionId];
    
    set({ blocks: newBlocks, sectionOrder: newSectionOrder });
    saveHistory();
    get().saveToLocalStorage();
    
    return sectionId;
  },

  duplicateSection: (sectionId) => {
    const { blocks, sectionOrder, saveHistory } = get();
    const sectionToDuplicate = blocks.find(b => b.id === sectionId);
    if (!sectionToDuplicate || sectionToDuplicate.type !== 'section') {
      return sectionId;
    }

    const newSectionId = `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newSection: Block = {
      ...sectionToDuplicate,
      id: newSectionId,
      parentId: null,
      children: [],
    };

    const childBlocks = sectionToDuplicate.children
      ? blocks.filter(b => sectionToDuplicate.children.includes(b.id))
      : [];
    
    const container = childBlocks.find(b => b.type === 'container');
    const otherChildren = childBlocks.filter(b => b.type !== 'container');
    
    const clonedChildren: Block[] = [];
    
    if (container) {
      const newContainerId = `container-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newContainer: Block = {
        ...container,
        id: newContainerId,
        parentId: newSectionId,
        children: [],
      };
      clonedChildren.push(newContainer);
      newSection.children = [newContainerId];
      
      const containerChildBlocks = container.children
        ? blocks.filter(b => container.children.includes(b.id))
        : [];
      
      const clonedContainerChildren = containerChildBlocks.map(child => ({
        ...child,
        id: `${child.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        parentId: newContainerId,
      }));
      
      newContainer.children = clonedContainerChildren.map(c => c.id);
      clonedChildren.push(...clonedContainerChildren);
    }
    
    const clonedOtherChildren = otherChildren.map(child => ({
      ...child,
      id: `${child.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      parentId: newSectionId,
    }));
    
    newSection.children = [...newSection.children, ...clonedOtherChildren.map(c => c.id)];
    clonedChildren.push(...clonedOtherChildren);

    const newBlocks = [...blocks, newSection, ...clonedChildren];
    
    const originalIndex = sectionOrder.indexOf(sectionId);
    const newSectionOrder = [...sectionOrder];
    newSectionOrder.splice(originalIndex + 1, 0, newSectionId);

    set({ blocks: newBlocks, sectionOrder: newSectionOrder });
    saveHistory();
    get().saveToLocalStorage();
    set({ selectedId: newSectionId });
    
    return newSectionId;
  },

  moveSection: (sectionId, direction) => {
    const { sectionOrder, saveHistory } = get();
    const currentIndex = sectionOrder.indexOf(sectionId);
    if (currentIndex === -1) return;

    const newSectionOrder = [...sectionOrder];
    if (direction === 'up' && currentIndex > 0) {
      [newSectionOrder[currentIndex - 1], newSectionOrder[currentIndex]] = [
        newSectionOrder[currentIndex],
        newSectionOrder[currentIndex - 1],
      ];
    } else if (direction === 'down' && currentIndex < newSectionOrder.length - 1) {
      [newSectionOrder[currentIndex], newSectionOrder[currentIndex + 1]] = [
        newSectionOrder[currentIndex + 1],
        newSectionOrder[currentIndex],
      ];
    }

    set({ sectionOrder: newSectionOrder });
    saveHistory();
    get().saveToLocalStorage();
  },

  getComponentsInSection: (sectionId) => {
    const { blocks } = get();
    const section = blocks.find(b => b.id === sectionId);
    if (!section || section.type !== 'section') {
      return [];
    }
    
    return section.children
      ? blocks.filter(b => section.children.includes(b.id) && b.type !== 'container')
      : [];
  },

  getContainerInSection: (sectionId) => {
    const { blocks } = get();
    const section = blocks.find(b => b.id === sectionId);
    if (!section || section.type !== 'section') {
      return null;
    }
    
    return section.children
      ? blocks.find(b => section.children.includes(b.id) && b.type === 'container')
      : null;
  },

  addComponentToSection: (sectionId, component) => {
    const { blocks, saveHistory } = get();
    const section = blocks.find(b => b.id === sectionId);
    if (!section || section.type !== 'section') {
      return;
    }

    const newComponent: Block = {
      ...component,
      parentId: sectionId,
    };

    const newBlocks = [...blocks, newComponent];
    const sectionIndex = newBlocks.findIndex(b => b.id === sectionId);
    if (sectionIndex !== -1) {
      newBlocks[sectionIndex] = {
        ...section,
        children: [...(section.children || []), newComponent.id],
      };
    }

    set({ blocks: newBlocks });
    saveHistory();
    get().saveToLocalStorage();
  },


  addChildToContainer: (containerId, childBlock) => {
    const { blocks, addBlock } = get();
    const container = blocks.find(b => b.id === containerId);
    if (!container || container.type !== 'container') {
      console.warn('Block is not a container');
      return;
    }
    addBlock(childBlock, containerId);
  },

  removeChildFromContainer: (containerId, childId) => {
    const { blocks, updateBlock } = get();
    const container = blocks.find(b => b.id === containerId);
    if (!container || container.type !== 'container') {
      console.warn('Block is not a container');
      return;
    }
    const updatedChildren = (container.children || []).filter(id => id !== childId);
    updateBlock(containerId, { children: updatedChildren });
    
    // Update child block untuk menghapus parentId
    const childBlock = blocks.find(b => b.id === childId);
    if (childBlock) {
      updateBlock(childId, { parentId: null });
    }
  },

  setDeviceView: (view) => set({ deviceView: view }),

  setBackgroundImage: (url) => {
    set({ canvasBackground: url || undefined });
    // SAVE KE LOCALSTORAGE DULU (hard cache, instant)
    get().saveToLocalStorage();
  },

  saveHistory: () => {
    const { blocks, history, projectId } = get();
    const newPast = [...history.past, history.present].slice(-MAX_HISTORY);
    const newHistory = {
      past: newPast,
      present: blocks,
      future: [],
    };
    set({ history: newHistory });
    
    if (projectId) {
      try {
        const historyData = {
          history: newHistory,
          timestamp: Date.now(),
        };
        localStorage.setItem(`invitation-builder-history-${projectId}`, JSON.stringify(historyData));
      } catch (e) {
        // localStorage penuh atau error, skip
      }
    }
  },

  undo: () => {
    const { history, projectId } = get();
    if (history.past.length === 0) return;

    const previous = history.past[history.past.length - 1];
    const newPast = history.past.slice(0, -1);
    const newHistory = {
      past: newPast,
      present: previous,
      future: [history.present, ...history.future],
    };
    set({
      blocks: previous,
      history: newHistory,
      selectedId: null,
    });
    
    if (projectId) {
      try {
        const historyData = {
          history: newHistory,
          timestamp: Date.now(),
        };
        localStorage.setItem(`invitation-builder-history-${projectId}`, JSON.stringify(historyData));
      } catch (e) {
        // localStorage penuh atau error, skip
      }
    }
  },

  redo: () => {
    const { history, projectId } = get();
    if (history.future.length === 0) return;

    const next = history.future[0];
    const newFuture = history.future.slice(1);
    const newHistory = {
      past: [...history.past, history.present],
      present: next,
      future: newFuture,
    };
    set({
      blocks: next,
      history: newHistory,
      selectedId: null,
    });
    
    if (projectId) {
      try {
        const historyData = {
          history: newHistory,
          timestamp: Date.now(),
        };
        localStorage.setItem(`invitation-builder-history-${projectId}`, JSON.stringify(historyData));
      } catch (e) {
        // localStorage penuh atau error, skip
      }
    }
  },

  saveToLocalStorage: () => {
    const state = get();
    if ((state as any)._saveTimeout) {
      clearTimeout((state as any)._saveTimeout);
    }
    
    (state as any)._saveTimeout = setTimeout(() => {
      try {
        const currentState = get();
        
        const lightweightCache = {
          projectId: currentState.projectId,
          projectTitle: currentState.projectTitle,
          projectSlug: currentState.projectSlug,
          timestamp: Date.now(),
        };
        
        localStorage.setItem('invitation-builder-cache-meta', JSON.stringify(lightweightCache));
        
        if (currentState.projectId) {
        const cacheData = {
          blocks: currentState.blocks,
          sectionOrder: (currentState as any).sectionOrder || [],
          projectId: currentState.projectId,
          projectTitle: currentState.projectTitle,
          projectDescription: currentState.projectDescription,
          projectUrl: currentState.projectUrl,
          projectThumbnail: currentState.projectThumbnail,
          projectSlug: currentState.projectSlug,
          canvasBackground: currentState.canvasBackground,
          coverImage: currentState.coverImage,
          coverButtonText: currentState.coverButtonText,
          coverEnabled: currentState.coverEnabled,
          musicUrl: currentState.musicUrl,
          deviceView: currentState.deviceView,
          timestamp: Date.now(),
        };
          
          try {
            const cacheString = JSON.stringify(cacheData);
            if (cacheString.length < 5 * 1024 * 1024) {
              localStorage.setItem(`invitation-builder-cache-${currentState.projectId}`, cacheString);
            }
          } catch (e) {
            // localStorage penuh atau error, skip full cache
          }
        }
      } catch (error) {
        // Silent fail
      }
    }, 500);
  },

  loadFromLocalStorage: () => {
    try {
      const savedMeta = localStorage.getItem('invitation-builder-cache-meta');
      if (savedMeta) {
        const meta = JSON.parse(savedMeta);
        
        if (meta.projectId) {
          try {
            const fullCache = localStorage.getItem(`invitation-builder-cache-${meta.projectId}`);
            if (fullCache) {
              const cacheData = JSON.parse(fullCache);
              const cacheAge = Date.now() - (cacheData.timestamp || 0);
              
              if (cacheAge < 24 * 60 * 60 * 1000) {
                // Normalize blocks untuk memastikan semua styles termasuk transform tersimpan
                const normalizedCacheBlocks = (cacheData.blocks || []).map((block: any) => {
                  let normalizedStyles = {};
                  if (block.styles && typeof block.styles === 'object') {
                    normalizedStyles = JSON.parse(JSON.stringify(block.styles));
                  }
                  
                  return {
                    id: block.id,
                    type: block.type,
                    parentId: block.parentId ?? null,
                    children: (block.type === 'section' || block.type === 'container') ? (block.children || []) : [],
                    content: block.content || '',
                    styles: normalizedStyles,
                    position: block.position ? { ...block.position } : undefined,
                    size: block.size ? { ...block.size } : undefined,
                    animation: block.animation ? { ...block.animation } : undefined,
                    customCSS: block.customCSS || undefined,
                    locked: block.locked || false,
                  };
                });
                
                const loadedSectionOrder = cacheData.sectionOrder || [];
                const validSectionOrder = loadedSectionOrder.filter((id: string) => 
                  normalizedCacheBlocks.some((b: Block) => b.id === id && b.type === 'section')
                );
                
                if (validSectionOrder.length === 0 && normalizedCacheBlocks.length > 0) {
                  const sections = normalizedCacheBlocks.filter((b: Block) => b.type === 'section');
                  sections.forEach((section: Block) => {
                    if (!validSectionOrder.includes(section.id)) {
                      validSectionOrder.push(section.id);
                    }
                  });
                }
                
                let loadedHistory = createHistoryState(normalizedCacheBlocks);
                try {
                  const historyData = localStorage.getItem(`invitation-builder-history-${cacheData.projectId}`);
                  if (historyData) {
                    const parsedHistory = JSON.parse(historyData);
                    if (parsedHistory.history && parsedHistory.history.past && parsedHistory.history.present) {
                      loadedHistory = parsedHistory.history;
                    }
                  }
                } catch (e) {
                  // Jika error, gunakan history default
                }
                
                set({
                  blocks: normalizedCacheBlocks,
                  sectionOrder: validSectionOrder,
                  projectId: cacheData.projectId || null,
                  projectTitle: cacheData.projectTitle || 'Untitled Project',
                  projectDescription: cacheData.projectDescription || 'Undangan digital yang dibuat dengan Idinvitebook',
                  projectUrl: cacheData.projectUrl || '',
                  projectThumbnail: cacheData.projectThumbnail || '',
                  projectSlug: cacheData.projectSlug || '',
                  canvasBackground: cacheData.canvasBackground || undefined,
                  coverImage: cacheData.coverImage || '',
                  coverButtonText: cacheData.coverButtonText || 'Buka Undangan',
                  coverEnabled: cacheData.coverEnabled || false,
                  musicUrl: cacheData.musicUrl || '',
                  deviceView: cacheData.deviceView || 'mobile',
                  history: loadedHistory,
                });
                
                // Force re-render dengan memanggil getSections setelah set
                setTimeout(() => {
                  const state = get();
                  const sections = state.getSections();
                  if (sections.length === 0 && normalizedCacheBlocks.length > 0) {
                    const allSections = normalizedCacheBlocks.filter((b: Block) => b.type === 'section');
                    if (allSections.length > 0) {
                      const newSectionOrder = allSections.map((s: Block) => s.id);
                      set({ sectionOrder: newSectionOrder });
                    }
                  }
                }, 100);
                
                return true;
              } else {
                localStorage.removeItem(`invitation-builder-cache-${meta.projectId}`);
              }
            }
          } catch (e) {
            console.error('Error loading from localStorage:', e);
          }
        }
        
        return true;
      }
    } catch (error) {
      console.error('Error in loadFromLocalStorage:', error);
    }
    return false;
  },

  setProjectId: (id) => set({ projectId: id }),
  setProjectTitle: (title) => set({ projectTitle: title }),
  setProjectDescription: (description) => set({ projectDescription: description }),
  setProjectUrl: (url) => set({ projectUrl: url }),
  setProjectThumbnail: (thumbnail) => set({ projectThumbnail: thumbnail }),
  setProjectSlug: (slug) => set({ projectSlug: slug }),
  setCoverImage: (url) => set({ coverImage: url }),
  setCoverButtonText: (text) => set({ coverButtonText: text }),
  setCoverEnabled: (enabled) => set({ coverEnabled: enabled }),
  setMusicUrl: (url) => set({ musicUrl: url }),
  generateInvitationUrl: () => {
    const { projectId } = get();
    if (projectId) {
      const url = `/invitation/${projectId}`;
      set({ projectUrl: url });
      return url;
    }
    const newId = `invitation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    set({ projectId: newId });
    const url = `/invitation/${newId}`;
    set({ projectUrl: url });
    return url;
  },

  saveToDatabase: async (title?: string) => {
    try {
      const { blocks, sectionOrder, projectId, projectTitle, projectDescription, projectUrl, projectThumbnail, projectSlug, canvasBackground, coverImage, coverButtonText, coverEnabled, musicUrl } = get();
      const projectTitleToUse = title || projectTitle;
      const id = projectId || `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // SAVE KE LOCALSTORAGE DULU (hard cache, ringan untuk user)
      get().saveToLocalStorage();

      // Pastikan blocks adalah array yang valid
      const blocksToSave = Array.isArray(blocks) ? blocks : [];
      
      // Serialize semua blocks dengan lengkap (seperti Elementor)
      const serializedBlocks = blocksToSave.map((block: Block) => {
        // Pastikan semua property terserialisasi dengan benar, termasuk semua styles
        // Deep clone untuk memastikan semua property termasuk transform, borderColor, borderStyle, backgroundGradient, dll tersimpan
        const serializedStyles = block.styles ? JSON.parse(JSON.stringify(block.styles)) : {};
        
        // Debug: Log transform untuk image blocks
        if (block.type === 'image' && serializedStyles.transform) {
          console.log('Saving image block with transform:', {
            id: block.id,
            transform: serializedStyles.transform,
            allStyles: Object.keys(serializedStyles)
          });
        }
        
        // Pastikan semua property block tersimpan dengan benar
        const serializedBlock = {
          id: block.id,
          type: block.type,
          parentId: block.parentId ?? null,
          children: block.type === 'container' ? (block.children || []) : [],
          content: typeof block.content === 'string' 
            ? block.content 
            : (block.content ? JSON.parse(JSON.stringify(block.content)) : ''),
          styles: serializedStyles,
          position: block.position ? JSON.parse(JSON.stringify(block.position)) : undefined,
          size: block.size ? JSON.parse(JSON.stringify(block.size)) : undefined,
          animation: block.animation ? JSON.parse(JSON.stringify(block.animation)) : undefined,
          customCSS: block.customCSS || undefined,
          locked: block.locked || false,
        };
        
        return serializedBlock;
      });
      

      const response = await fetch('/api/projects', {
        method: projectId ? 'PUT' : 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        cache: 'no-store',
        body: JSON.stringify({
          id,
          title: projectTitleToUse,
          blocks: serializedBlocks, // Gunakan serialized blocks
          sectionOrder: sectionOrder || [],
          description: projectDescription,
          url: projectUrl,
          thumbnail: projectThumbnail,
          slug: projectSlug,
          canvasBackground: canvasBackground,
          coverImage: coverImage,
          coverButtonText: coverButtonText,
          coverEnabled: coverEnabled,
          musicUrl: musicUrl,
          updatedAt: Date.now(),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save to database: ${errorText}`);
      }

      const project = await response.json();
      
      set({ 
        projectId: project.id, 
        projectTitle: project.title,
        projectDescription: project.description || projectDescription,
        projectUrl: project.url || projectUrl,
        projectThumbnail: project.thumbnail || projectThumbnail,
        projectSlug: project.slug || projectSlug,
        canvasBackground: project.canvasBackground || canvasBackground,
      });
      return;
    } catch (error) {
      throw error;
    }
  },

  loadFromDatabase: async (id: string) => {
    try {
      const response = await fetch(`/api/projects?id=${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          // Jika project tidak ditemukan, clear projectId dan reset state
          set({
            projectId: null,
            blocks: [],
            projectTitle: '',
            projectDescription: '',
            projectUrl: '',
            projectThumbnail: '',
            projectSlug: '',
            canvasBackground: undefined,
          coverImage: '',
          coverButtonText: 'Buka Undangan',
          coverEnabled: false,
          musicUrl: '',
          history: createHistoryState([]),
          selectedId: null,
          });
          throw new Error(`Project not found: ${id}`);
        }
        const errorText = await response.text();
        throw new Error(`Failed to load from database: ${errorText}`);
      }

      const project = await response.json();
      
      
      // Pastikan blocks adalah array dan tidak null/undefined
      let loadedBlocks: any[] = [];
      
      if (Array.isArray(project.blocks)) {
        loadedBlocks = project.blocks;
      } else if (typeof project.blocks === 'string') {
        // Jika blocks adalah string JSON, parse dulu
        try {
          loadedBlocks = JSON.parse(project.blocks);
        } catch (e) {
          console.error('Error parsing blocks from database:', e);
          loadedBlocks = [];
        }
      } else {
        loadedBlocks = [];
      }
      
      // Pastikan semua blocks memiliki styles yang lengkap
      const normalizedBlocks = loadedBlocks.map((block: any) => {
        // Pastikan styles adalah object dan tidak null/undefined
        let normalizedStyles = {};
        if (block.styles && typeof block.styles === 'object') {
          normalizedStyles = { ...block.styles };
        }
        
        // Pastikan semua property styles tersimpan, termasuk transform, borderColor, borderStyle, backgroundGradient, dll
        // Deep clone untuk memastikan tidak ada reference yang hilang
        normalizedStyles = JSON.parse(JSON.stringify(normalizedStyles));
        
        // Debug: Log transform untuk image blocks
        if (block.type === 'image' && normalizedStyles.transform) {
          console.log('Loading image block with transform:', {
            id: block.id,
            transform: normalizedStyles.transform,
            allStyles: Object.keys(normalizedStyles)
          });
        }
        
        return {
          id: block.id,
          type: block.type,
          parentId: block.parentId ?? null,
          children: block.type === 'container' ? (block.children || []) : [],
          content: block.content || '',
          styles: normalizedStyles,
          position: block.position ? { ...block.position } : undefined,
          size: block.size ? { ...block.size } : undefined,
          animation: block.animation ? { ...block.animation } : undefined,
          customCSS: block.customCSS || undefined,
          locked: block.locked || false,
        };
      });
      
      let loadedHistory = createHistoryState(normalizedBlocks);
      try {
        const historyData = localStorage.getItem(`invitation-builder-history-${project.id}`);
        if (historyData) {
          const parsedHistory = JSON.parse(historyData);
          if (parsedHistory.history && parsedHistory.history.past && parsedHistory.history.present) {
            loadedHistory = parsedHistory.history;
          }
        }
      } catch (e) {
        // Jika error, gunakan history default
      }
      
      set({
        blocks: normalizedBlocks,
        projectId: project.id,
        projectTitle: project.title || 'Untitled Project',
        projectDescription: project.description || 'Undangan digital yang dibuat dengan Idinvitebook',
        projectUrl: project.url || '',
        projectThumbnail: project.thumbnail || '',
        projectSlug: project.slug || projectSlug, // Gunakan slug dari database, atau tetap gunakan yang sudah ada
        canvasBackground: project.canvasBackground || undefined,
        coverImage: project.coverImage || '',
        coverButtonText: project.coverButtonText || 'Buka Undangan',
        coverEnabled: project.coverEnabled || false,
        musicUrl: project.musicUrl || '',
        history: loadedHistory,
        selectedId: null, // Reset selection saat load
      });
      
      
      // SAVE KE LOCALSTORAGE SETELAH LOAD (hard cache)
      get().saveToLocalStorage();
    } catch (error) {
      throw error;
    }
  },

  publish: async () => {
    try {
      const { projectId, blocks, projectTitle } = get();
      
      if (!projectId) {
        // Save first if not saved
        await get().saveToDatabase();
        const newProjectId = get().projectId;
        if (!newProjectId) {
          throw new Error('Failed to create project');
        }
      }

      const finalProjectId = get().projectId!;
      
      // Save current state
      await get().saveToDatabase();

      // Publish
      const response = await fetch('/api/projects/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: finalProjectId }),
      });

      if (!response.ok) {
        throw new Error('Failed to publish');
      }

      const result = await response.json();
      return result.published_url || `/invitation/${finalProjectId}`;
    } catch (error) {
      return null;
    }
  },

  // Export tema ke JSON string
  exportTheme: (name, description) => {
    const { blocks, canvasBackground, deviceView, projectTitle } = get();
    return exportThemeToJSON(
      blocks,
      canvasBackground,
      deviceView,
      name || projectTitle || 'Untitled Theme',
      description
    );
  },

  // Export tema ke file JSON
  exportThemeToFile: (name, description) => {
    const { blocks, canvasBackground, deviceView, projectTitle } = get();
    downloadThemeAsJSON(
      blocks,
      canvasBackground,
      deviceView,
      name || projectTitle || 'theme'
    );
  },

  // Export tema ke database
  exportThemeToDatabase: async (name, description) => {
    try {
      const { blocks, canvasBackground, deviceView } = get();
      const themeData = exportThemeToJSON(
        blocks,
        canvasBackground,
        deviceView,
        name,
        description
      );

      const id = `theme-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const response = await fetch('/api/themes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          name,
          description,
          themeData: JSON.parse(themeData),
        }),
      });

      if (!response.ok) {
        throw new Error('Gagal menyimpan tema ke database');
      }

      return;
    } catch (error) {
      throw error;
    }
  },

  // Import tema dari file
  importThemeFromFile: async (file) => {
    try {
      const jsonString = await readThemeFromFile(file);
      await get().importThemeFromJSON(jsonString);
    } catch (error) {
      throw error;
    }
  },

  // Import tema dari JSON string
  importThemeFromJSON: async (jsonString) => {
    try {
      const imported = importThemeFromJSON(jsonString);
      
      // Konfirmasi sebelum mengganti konten
      const confirmed = window.confirm(
        'Apakah Anda yakin ingin mengimpor tema ini? Konten saat ini akan diganti.'
      );

      if (!confirmed) {
        return;
      }

      set({
        blocks: imported.blocks,
        canvasBackground: imported.canvasBackground,
        deviceView: imported.deviceView || 'mobile',
        projectTitle: imported.name,
        history: createHistoryState(imported.blocks),
        selectedId: null,
      });

      // Simpan ke localStorage sebagai backup
      get().saveToLocalStorage();
    } catch (error) {
      throw error;
    }
  },

  // Import tema dari database
  importThemeFromDatabase: async (id) => {
    try {
      const response = await fetch(`/api/themes?id=${id}`);
      if (!response.ok) {
        throw new Error('Tema tidak ditemukan');
      }

      const theme = await response.json();
      
      if (!theme.themeData) {
        throw new Error('Data tema tidak valid');
      }

      // Parse themeData jika berupa string
      const themeDataString = typeof theme.themeData === 'string' 
        ? theme.themeData 
        : JSON.stringify(theme.themeData);

      await get().importThemeFromJSON(themeDataString);
    } catch (error) {
      throw error;
    }
  },
}));

