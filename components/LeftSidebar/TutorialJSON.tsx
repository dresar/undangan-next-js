'use client';

import styled from 'styled-components';
import { FaCode, FaFileCode, FaCopy, FaCheckCircle, FaExternalLinkAlt } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const Container = styled.div`
  padding: 20px;
  color: #ffffff;
  height: 100%;
  overflow-y: auto;
`;

const Title = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Section = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #ff6b35;
`;

const Paragraph = styled.p`
  font-size: 13px;
  line-height: 1.6;
  color: #cccccc;
  margin-bottom: 12px;
`;

const CodeBlock = styled.pre`
  background: #1a1a1a;
  border: 1px solid #4a4a4a;
  border-radius: 4px;
  padding: 12px;
  font-size: 12px;
  font-family: 'Courier New', monospace;
  color: #ffffff;
  overflow-x: auto;
  margin: 12px 0;
  position: relative;
`;

const CodeLine = styled.div`
  margin: 4px 0;
  color: #ffffff;
`;

const CopyButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: #3a3a3a;
  border: 1px solid #4a4a4a;
  color: #ffffff;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;

  &:hover {
    background: #4a4a4a;
  }
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 12px 0;
`;

const ListItem = styled.li`
  font-size: 13px;
  line-height: 1.6;
  color: #cccccc;
  margin-bottom: 8px;
  padding-left: 20px;
  position: relative;

  &:before {
    content: '•';
    position: absolute;
    left: 0;
    color: #ff6b35;
    font-weight: bold;
  }
`;

const LinkButton = styled.button`
  background: #ff6b35;
  border: none;
  color: #ffffff;
  padding: 10px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  transition: all 0.2s;
  width: 100%;

  &:hover {
    background: #ff5722;
  }
`;

const ExampleBox = styled.div`
  background: #1f1f1f;
  border-left: 3px solid #ff6b35;
  padding: 12px;
  margin: 12px 0;
  border-radius: 4px;
`;

const ExampleTitle = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #ff6b35;
  margin-bottom: 8px;
`;

export default function TutorialJSON() {
  const router = useRouter();
  const [copied, setCopied] = useState<string | null>(null);

  const exampleJSON = `{
  "version": "1.0.0",
  "name": "Tema Undangan Pernikahan",
  "description": "Tema klasik untuk undangan pernikahan",
  "metadata": {
    "exportedAt": "2024-01-15T10:30:00.000Z",
    "appVersion": "1.0.0"
  },
  "canvas": {
    "background": "#ffffff",
    "deviceView": "mobile"
  },
  "blocks": [
    {
      "id": "text-1",
      "type": "text",
      "content": "Selamat Datang",
      "styles": {
        "fontSize": "24px",
        "color": "#000000",
        "textAlign": "center"
      }
    }
  ]
}`;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Container>
      <Title>
        <FaCode />
        Tutorial Pembuatan JSON Tema
      </Title>

      <Section>
        <SectionTitle>1. Apa itu JSON Tema?</SectionTitle>
        <Paragraph>
          JSON Tema adalah format file yang digunakan untuk menyimpan dan membagikan desain undangan digital. 
          Format ini memungkinkan Anda untuk mengekspor desain yang sudah dibuat dan mengimpornya kembali di kemudian hari.
        </Paragraph>
      </Section>

      <Section>
        <SectionTitle>2. Struktur Dasar JSON</SectionTitle>
        <Paragraph>
          Setiap file JSON tema harus memiliki struktur berikut:
        </Paragraph>
        <List>
          <ListItem><strong>version</strong> - Versi format JSON (contoh: "1.0.0")</ListItem>
          <ListItem><strong>name</strong> - Nama tema (contoh: "Tema Undangan Pernikahan")</ListItem>
          <ListItem><strong>description</strong> - Deskripsi tema (opsional)</ListItem>
          <ListItem><strong>metadata</strong> - Informasi metadata (exportedAt, appVersion)</ListItem>
          <ListItem><strong>canvas</strong> - Pengaturan canvas (background, deviceView)</ListItem>
          <ListItem><strong>blocks</strong> - Array dari semua blok komponen dalam tema</ListItem>
        </List>
      </Section>

      <Section>
        <SectionTitle>3. Contoh Format JSON</SectionTitle>
        <ExampleBox>
          <ExampleTitle>Contoh JSON Minimal:</ExampleTitle>
          <CodeBlock>
            <CopyButton onClick={() => handleCopy(exampleJSON, 'example')}>
              {copied === 'example' ? <><FaCheckCircle /> Disalin</> : <><FaCopy /> Salin</>}
            </CopyButton>
            <CodeLine>{exampleJSON}</CodeLine>
          </CodeBlock>
        </ExampleBox>
      </Section>

      <Section>
        <SectionTitle>4. Struktur Block</SectionTitle>
        <Paragraph>
          Setiap block dalam array blocks memiliki struktur:
        </Paragraph>
        <List>
          <ListItem><strong>id</strong> - ID unik untuk block (string)</ListItem>
          <ListItem><strong>type</strong> - Tipe block (text, image, video, dll)</ListItem>
          <ListItem><strong>content</strong> - Konten block (bisa string, object, atau array)</ListItem>
          <ListItem><strong>styles</strong> - CSS styles untuk block (object)</ListItem>
          <ListItem><strong>position</strong> - Posisi block (x, y) - opsional</ListItem>
          <ListItem><strong>size</strong> - Ukuran block (width, height) - opsional</ListItem>
          <ListItem><strong>animation</strong> - Animasi block - opsional</ListItem>
          <ListItem><strong>customCSS</strong> - CSS kustom - opsional</ListItem>
        </List>
      </Section>

      <Section>
        <SectionTitle>5. Tipe Block yang Tersedia</SectionTitle>
        <Paragraph>
          Berikut adalah tipe-tipe block yang dapat digunakan:
        </Paragraph>
        <List>
          <ListItem>text - Block teks</ListItem>
          <ListItem>image - Block gambar</ListItem>
          <ListItem>video - Block video</ListItem>
          <ListItem>button - Block tombol</ListItem>
          <ListItem>map - Block peta</ListItem>
          <ListItem>countdown - Block hitung mundur</ListItem>
          <ListItem>form - Block form</ListItem>
          <ListItem>gallery - Block galeri gambar</ListItem>
          <ListItem>masonry - Block masonry layout</ListItem>
          <ListItem>shape - Block shape/geometri</ListItem>
          <ListItem>spacer - Block jarak</ListItem>
          <ListItem>icon - Block ikon</ListItem>
          <ListItem>bank - Block informasi bank</ListItem>
          <ListItem>gift - Block informasi kado</ListItem>
          <ListItem>audio - Block audio</ListItem>
        </List>
      </Section>

      <Section>
        <SectionTitle>6. Cara Menggunakan</SectionTitle>
        <List>
          <ListItem>Buat desain undangan di editor</ListItem>
          <ListItem>Klik tombol "Export" di toolbar atas</ListItem>
          <ListItem>Pilih "Export JSON (Tampilkan di Modal)"</ListItem>
          <ListItem>Salin atau unduh file JSON yang ditampilkan</ListItem>
          <ListItem>Untuk import, klik tombol "Import" dan pilih file JSON</ListItem>
        </List>
      </Section>

      <LinkButton onClick={() => router.push('/json-docs')}>
        <FaExternalLinkAlt />
        Lihat Dokumentasi Lengkap
      </LinkButton>
    </Container>
  );
}

