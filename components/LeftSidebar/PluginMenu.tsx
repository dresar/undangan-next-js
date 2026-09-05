'use client';

import styled from 'styled-components';
import { FaWhatsapp, FaQrcode, FaCode, FaChevronRight, FaShare } from 'react-icons/fa';
import { useEditorStore } from '@/store/useEditorStore';

const MenuContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
`;

const MenuItem = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #3a3a3a;
  border: none;
  border-radius: 8px;
  color: #ffffff;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  text-align: left;

  &:hover {
    background: #4a4a4a;
    transform: translateX(4px);
  }
`;

const MenuIcon = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const MenuLabel = styled.span`
  font-weight: 500;
`;

const InstallLinkButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  background: #ff6b35;
  border: none;
  border-radius: 8px;
  color: #ffffff;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  margin-top: 8px;
  width: 100%;

  &:hover {
    background: #ff5722;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(255, 107, 53, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

export default function PluginMenu() {
  const projectId = useEditorStore((state) => state.projectId);
  const projectSlug = useEditorStore((state) => state.projectSlug);

  const plugins = [
    {
      id: 'kirim-instan',
      label: 'Kirim Instan',
      icon: <FaWhatsapp />,
      path: '/plugin/kirim-instan',
    },
    {
      id: 'daftar-undangan',
      label: 'Daftar Undangan',
      icon: <FaQrcode />,
      path: '/plugin/daftar-undangan',
    },
    {
      id: 'css-editor',
      label: 'CSS Editor',
      icon: <FaCode />,
      path: '/plugin/css-editor',
    },
  ];

  const handlePluginClick = (path: string) => {
    if (!projectId) {
      alert('Harap buat atau buka project terlebih dahulu');
      return;
    }
    
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    let url = `${baseUrl}${path}`;
    const params = new URLSearchParams();
    
    if (projectId) {
      params.append('project_id', projectId);
    }
    if (projectSlug) {
      params.append('slug', projectSlug);
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    window.open(url, '_blank');
  };

  const handleInstallLink = () => {
    if (!projectId) {
      alert('Harap buat atau buka project terlebih dahulu');
      return;
    }
    
    if (!projectSlug) {
      alert('Harap simpan project terlebih dahulu untuk mendapatkan slug');
      return;
    }
    
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const params = new URLSearchParams();
    params.append('project_id', projectId);
    params.append('slug', projectSlug);
    
    const installLinkUrl = `${baseUrl}/plugin/kirim-instan?${params.toString()}`;
    window.open(installLinkUrl, '_blank');
  };

  return (
    <MenuContainer>
      {plugins.map((plugin) => (
        <MenuItem
          key={plugin.id}
          onClick={() => handlePluginClick(plugin.path)}
        >
          <MenuIcon>
            {plugin.icon}
            <MenuLabel>{plugin.label}</MenuLabel>
          </MenuIcon>
          <FaChevronRight size={12} />
        </MenuItem>
      ))}
      <InstallLinkButton onClick={handleInstallLink}>
        <FaShare />
        Kirim Install Link Undangan
      </InstallLinkButton>
    </MenuContainer>
  );
}

