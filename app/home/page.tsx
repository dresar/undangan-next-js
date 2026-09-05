'use client';

import styled from 'styled-components';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useEditorStore } from '@/store/useEditorStore';
import { motion } from 'framer-motion';
import { FaEdit, FaTrash, FaPlus, FaSpinner } from 'react-icons/fa';

// Helper function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Helper function to generate unique slug with timestamp
function generateUniqueSlug(title: string): string {
  const baseSlug = generateSlug(title);
  // Tambahkan timestamp untuk memastikan slug selalu unik
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 6);
  return `${baseSlug}-${timestamp}-${random}`;
}

const HomeContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
`;

const ContentBox = styled(motion.div)`
  background: #ffffff;
  border-radius: 16px;
  padding: 40px;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
  text-align: center;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #666;
  margin-bottom: 32px;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 14px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ProjectsList = styled.div`
  margin-top: 32px;
  padding-top: 32px;
  border-top: 2px solid #e0e0e0;
`;

const ProjectsTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
`;

const ProjectCard = styled(motion.div)`
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e9ecef;
    border-color: #667eea;
  }
`;

const ProjectInfo = styled.div`
  flex: 1;
`;

const ProjectTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const ProjectMeta = styled.p`
  font-size: 12px;
  color: #666;
`;

const ProjectActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button<{ $danger?: boolean }>`
  padding: 8px 12px;
  background: ${(props) => (props.$danger ? '#dc3545' : '#667eea')};
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => (props.$danger ? '#c82333' : '#5568d3')};
    transform: translateY(-1px);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #999;
  font-size: 14px;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #667eea;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  svg {
    animation: spin 1s linear infinite;
  }
`;

interface Project {
  id: string;
  title: string;
  slug?: string;
  created_at?: string;
  updated_at?: string;
  blocks?: any[];
}

export default function HomePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { setProjectTitle, setProjectId, setProjectSlug } = useEditorStore();

  // Load projects list
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data || []);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Mohon masukkan judul undangan');
      return;
    }

    const titleTrimmed = title.trim();
    // Generate unique slug dengan timestamp untuk memastikan setiap project punya slug berbeda
    const slug = generateUniqueSlug(titleTrimmed);
    
    // Set project title dan buat ID baru
    const newProjectId = `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setProjectTitle(titleTrimmed);
    setProjectId(newProjectId);
    setProjectSlug(slug);
    
    // Simpan project ke database langsung dengan judul dan blocks kosong
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newProjectId,
          title: titleTrimmed,
          blocks: [], // Blocks kosong untuk project baru
          slug: slug, // Unique slug dengan timestamp
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error saving project:', errorText);
        alert('Gagal menyimpan undangan. Silakan coba lagi.');
        return;
      }

      const savedProject = await response.json();
      console.log('Project saved successfully:', savedProject);
      
      // Navigate ke editor dengan slug setelah berhasil disimpan
      // Gunakan slug dari response untuk memastikan menggunakan slug yang benar dari database
      const finalSlug = savedProject.slug || slug;
      router.push(`/editor/${finalSlug}`);
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Gagal menyimpan undangan. Silakan coba lagi.');
    }
  };

  const handleEdit = async (project: Project) => {
    try {
      // Clear cache dulu untuk memastikan load fresh dari database
      try {
        const currentCache = localStorage.getItem('invitation-builder-cache-meta');
        if (currentCache) {
          const meta = JSON.parse(currentCache);
          if (meta.projectId) {
            localStorage.removeItem(`invitation-builder-cache-${meta.projectId}`);
          }
          localStorage.removeItem('invitation-builder-cache-meta');
        }
      } catch (e) {
        // Silent fail
      }
      
      // Set project info dulu
      setProjectTitle(project.title);
      setProjectId(project.id);
      
      // HANYA gunakan slug dari database - JANGAN generate dari title
      if (!project.slug) {
        alert('Project tidak memiliki slug. Silakan buat project baru.');
        return;
      }
      
      const slug = project.slug;
      setProjectSlug(slug);
      
      console.log('Editing project:', {
        id: project.id,
        title: project.title,
        slug: slug,
        hasBlocks: Array.isArray(project.blocks) && project.blocks.length > 0
      });
      
      // Navigate ke editor dengan slug
      router.push(`/editor/${slug}`);
    } catch (error) {
      console.error('Error preparing edit:', error);
      alert('Gagal membuka editor. Silakan coba lagi.');
    }
  };

  const handleDelete = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Apakah Anda yakin ingin menghapus undangan ini?')) {
      return;
    }

    try {
      setDeleting(projectId);
      const response = await fetch(`/api/projects?id=${projectId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadProjects();
      } else {
        alert('Gagal menghapus undangan');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Gagal menghapus undangan');
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Tidak diketahui';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <HomeContainer>
      <ContentBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Title>Buat Undangan Digital</Title>
        <Subtitle>Buat undangan yang indah dan menarik dengan mudah</Subtitle>
        
        <Form onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="title">Judul Undangan</Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Undangan Pernikahan John & Jane"
              required
            />
          </div>
          
          <Button type="submit">
            <FaPlus style={{ marginRight: '8px' }} />
            Tambah Undangan
          </Button>
        </Form>

        <ProjectsList>
          <ProjectsTitle>Undangan Saya</ProjectsTitle>
          {loading ? (
            <LoadingState>
              <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
              Memuat undangan...
            </LoadingState>
          ) : projects.length === 0 ? (
            <EmptyState>Belum ada undangan yang dibuat</EmptyState>
          ) : (
            projects.map((project) => (
              <ProjectCard
                key={project.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => handleEdit(project)}
              >
                <ProjectInfo>
                  <ProjectTitle>{project.title}</ProjectTitle>
                  <ProjectMeta>
                    Diperbarui: {formatDate(project.updated_at || project.created_at)}
                  </ProjectMeta>
                </ProjectInfo>
                <ProjectActions>
                  <ActionButton
                    onClick={(e) => handleEdit(project)}
                    title="Edit"
                  >
                    <FaEdit />
                    Edit
                  </ActionButton>
                  <ActionButton
                    $danger
                    onClick={(e) => handleDelete(project.id, e)}
                    disabled={deleting === project.id}
                    title="Hapus"
                  >
                    {deleting === project.id ? (
                      <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                    ) : (
                      <FaTrash />
                    )}
                    Hapus
                  </ActionButton>
                </ProjectActions>
              </ProjectCard>
            ))
          )}
        </ProjectsList>
      </ContentBox>
    </HomeContainer>
  );
}

