'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import EditorLayout from '@/components/EditorLayout';
import { useEditorStore } from '@/store/useEditorStore';

// Helper function to generate slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Helper function to normalize slug (remove special chars, lowercase)
function normalizeSlug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Helper function to get project ID from slug
async function getProjectIdFromSlug(slug: string): Promise<string | null> {
  try {
    const normalizedSlug = normalizeSlug(slug);
    
    // Coba fetch langsung dari API slug
    try {
      const slugResponse = await fetch(`/api/projects/slug/${slug}`);
      if (slugResponse.ok) {
        const project = await slugResponse.json();
        return project.id;
      }
    } catch (error) {
      // Silent fail, fallback ke search
    }
    
    // Fallback: cari dari semua projects dengan normalized comparison
    const response = await fetch('/api/projects');
    if (!response.ok) {
      return null;
    }
    
    const projects = await response.json();
    
    // Cek slug yang tersimpan di database - JANGAN generate dari title, selalu gunakan slug dari database
    const project = projects.find((p: any) => {
      // Hanya gunakan slug dari database, jangan generate dari title
      if (!p.slug) {
        return false; // Jika tidak ada slug di database, skip project ini
      }
      const dbSlugNormalized = normalizeSlug(p.slug);
      return dbSlugNormalized === normalizedSlug;
    });
    
    if (project) {
      return project.id;
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

export default function EditorPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const saveToDatabase = useEditorStore((state) => state.saveToDatabase);
  const loadFromDatabase = useEditorStore((state) => state.loadFromDatabase);
  const projectTitle = useEditorStore((state) => state.projectTitle);
  const projectId = useEditorStore((state) => state.projectId);
  const projectSlug = useEditorStore((state) => state.projectSlug);
  const blocks = useEditorStore((state) => state.blocks);
  const setProjectId = useEditorStore((state) => state.setProjectId);
  const setProjectTitle = useEditorStore((state) => state.setProjectTitle);
  const setProjectSlug = useEditorStore((state) => state.setProjectSlug);

  // Load project from slug - hanya sekali saat mount atau saat slug berubah
  useEffect(() => {
    let isMounted = true;
    let hasLoaded = false;
    
    const loadProject = async () => {
      if (slug && slug !== 'new' && isMounted && !hasLoaded) {
        hasLoaded = true; // Set immediately to prevent double loading
        
        // Normalize slug untuk comparison
        const normalizeSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
        const targetSlugNormalized = normalizeSlug(slug);
        
        // Cek cache HANYA jika slug match - JANGAN gunakan cache jika slug berbeda
        const loadFromLocalStorage = useEditorStore.getState().loadFromLocalStorage;
        loadFromLocalStorage();
        const cachedState = useEditorStore.getState();
        
        // Hanya gunakan cache jika slug match dengan slug di cache
        const cachedSlugNormalized = cachedState.projectSlug ? normalizeSlug(cachedState.projectSlug) : null;
        const canUseCache = cachedSlugNormalized === targetSlugNormalized && cachedState.projectId;
        
        if (canUseCache && cachedState.projectId) {
          // Slug match, gunakan cache dan sync dengan database di background
          try {
            await loadFromDatabase(cachedState.projectId);
            useEditorStore.getState().saveToLocalStorage();
            return;
          } catch (error: any) {
            // Jika project tidak ditemukan, clear cache dan load dari slug
            if (error.message && error.message.includes('Project not found')) {
              // Clear invalid cache
              setProjectId(null);
              setProjectTitle('');
              setProjectSlug('');
              // Continue to load from slug below
            } else {
              // Error lain, tetap gunakan cache
              return;
            }
          }
        } else {
          // Slug tidak match atau tidak ada cache - CLEAR cache dan load dari database
          if (cachedState.projectId && cachedSlugNormalized !== targetSlugNormalized) {
            // Clear cache yang tidak match
            setProjectId(null);
            setProjectTitle('');
            setProjectSlug('');
            // Clear localStorage untuk project lama
            try {
              localStorage.removeItem(`invitation-builder-cache-${cachedState.projectId}`);
              localStorage.removeItem('invitation-builder-cache-meta');
            } catch (e) {
              // Silent fail
            }
          }
        }
        
        // Load project dari database menggunakan slug
        const id = await getProjectIdFromSlug(slug);
        
        if (id && isMounted) {
          try {
            await loadFromDatabase(id);
            // Set slug dari database setelah load
            const loadedState = useEditorStore.getState();
            if (loadedState.projectSlug && loadedState.projectSlug !== slug) {
              // Jika slug di database berbeda dengan URL, update URL ke slug yang benar
              window.history.replaceState(null, '', `/editor/${loadedState.projectSlug}`);
            }
            // Save ke cache setelah load
            useEditorStore.getState().saveToLocalStorage();
          } catch (error) {
            // Tetap set projectId meskipun load gagal, agar bisa save
            if (id) {
              setProjectId(id);
            }
          }
        } else if (isMounted) {
          // Project tidak ditemukan - clear state
          setProjectId(null);
          setProjectTitle('');
          setProjectSlug('');
        }
      }
    };
    
    loadProject();
    
    return () => {
      isMounted = false;
    };
  }, [slug, loadFromDatabase, setProjectId]); // Tambahkan dependencies

  // JANGAN update URL berdasarkan title - selalu gunakan slug dari database
  // useEffect ini dihapus karena menyebabkan redirect ke slug yang salah
  // Slug harus selalu sesuai dengan yang ada di database, bukan generate dari title

  // Ctrl+S untuk manual save
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (blocks.length > 0 && projectTitle) {
          try {
            if (!projectId) {
              const newProjectId = `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
              setProjectId(newProjectId);
            }
            await saveToDatabase();
            // Saved successfully
          } catch (error) {
            alert('Gagal menyimpan project');
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [blocks, projectTitle, projectId, saveToDatabase, setProjectId]);

  // Auto-save setiap 3 menit (180 detik)
  useEffect(() => {
    // Hanya auto-save jika ada blocks dan projectTitle
    if (blocks.length === 0 || !projectTitle) {
      return;
    }

    const autoSaveInterval = setInterval(async () => {
      try {
        // Jika belum ada projectId, buat baru
        let currentProjectId = projectId;
        if (!currentProjectId) {
          currentProjectId = `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          setProjectId(currentProjectId);
        }
        
        await saveToDatabase();
        // Auto-save berhasil (silent, tidak perlu notifikasi)
      } catch (error) {
        // Silent fail untuk auto-save (tidak perlu alert)
      }
    }, 180000); // 3 menit = 180000 milliseconds

    // Cleanup interval saat component unmount atau dependencies berubah
    return () => {
      clearInterval(autoSaveInterval);
    };
  }, [projectId, blocks, projectTitle, saveToDatabase, setProjectId]);

  return <EditorLayout />;
}

