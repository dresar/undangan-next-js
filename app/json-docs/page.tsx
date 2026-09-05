'use client';

import styled from 'styled-components';
import { FaCode, FaArrowLeft, FaCopy, FaCheckCircle, FaFileCode } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ThemeData } from '@/lib/themeExportImport';

const Container = styled.div`
  min-height: 100vh;
  background: #1a1a1a;
  color: #ffffff;
  padding: 40px 20px;
`;

const Content = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 40px;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #2a2a2a;
  border: 1px solid #4a4a4a;
  color: #ffffff;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 20px;
  transition: all 0.2s;

  &:hover {
    background: #3a3a3a;
  }
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 12px;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #999999;
  line-height: 1.6;
`;

const Section = styled.section`
  margin-bottom: 48px;
  background: #2a2a2a;
  padding: 32px;
  border-radius: 8px;
  border: 1px solid #3a3a3a;
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #ff6b35;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SectionSubtitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin-top: 24px;
  margin-bottom: 12px;
  color: #ffffff;
`;

const Paragraph = styled.p`
  font-size: 15px;
  line-height: 1.8;
  color: #cccccc;
  margin-bottom: 16px;
`;

const CodeBlock = styled.pre`
  background: #1a1a1a;
  border: 1px solid #4a4a4a;
  border-radius: 6px;
  padding: 20px;
  font-size: 13px;
  font-family: 'Courier New', monospace;
  color: #ffffff;
  overflow-x: auto;
  margin: 16px 0;
  position: relative;
  line-height: 1.6;
`;

const CopyButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: #3a3a3a;
  border: 1px solid #4a4a4a;
  color: #ffffff;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;

  &:hover {
    background: #4a4a4a;
  }
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 16px 0;
`;

const ListItem = styled.li`
  font-size: 15px;
  line-height: 1.8;
  color: #cccccc;
  margin-bottom: 12px;
  padding-left: 24px;
  position: relative;

  &:before {
    content: '▸';
    position: absolute;
    left: 0;
    color: #ff6b35;
    font-weight: bold;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
  background: #1a1a1a;
  border-radius: 6px;
  overflow: hidden;
`;

const TableHeader = styled.thead`
  background: #3a3a3a;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #3a3a3a;
  
  &:last-child {
    border-bottom: none;
  }
`;

const TableHeaderCell = styled.th`
  padding: 12px 16px;
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
`;

const TableCell = styled.td`
  padding: 12px 16px;
  font-size: 14px;
  color: #cccccc;
  border-left: 1px solid #3a3a3a;
  
  &:first-child {
    border-left: none;
    color: #ff6b35;
    font-weight: 600;
  }
`;

const Code = styled.code`
  background: #1a1a1a;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #ff6b35;
`;

const HighlightBox = styled.div`
  background: #1f1f1f;
  border-left: 4px solid #ff6b35;
  padding: 16px;
  margin: 16px 0;
  border-radius: 4px;
`;

const HighlightTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #ff6b35;
  margin-bottom: 8px;
`;

export default function JSONDocsPage() {
  const router = useRouter();
  const [copied, setCopied] = useState<string | null>(null);

  const fullExample = `{
  "version": "1.0.0",
  "name": "Tema Undangan Pernikahan Klasik",
  "description": "Tema klasik dengan warna emas dan putih",
  "metadata": {
    "exportedAt": "2024-01-15T10:30:00.000Z",
    "exportedBy": "User",
    "appVersion": "1.0.0"
  },
  "canvas": {
    "background": "#f5f5f5",
    "deviceView": "mobile"
  },
  "blocks": [
    {
      "id": "text-1",
      "type": "text",
      "content": "Selamat Datang",
      "styles": {
        "fontSize": "28px",
        "fontWeight": "bold",
        "color": "#d4af37",
        "textAlign": "center",
        "margin": "20px 0"
      },
      "position": {
        "x": 0,
        "y": 0
      },
      "size": {
        "width": "100%",
        "height": "auto"
      }
    },
    {
      "id": "image-1",
      "type": "image",
      "content": {
        "src": "/media/uploads/image.jpg",
        "alt": "Foto Pasangan"
      },
      "styles": {
        "width": "100%",
        "height": "auto",
        "borderRadius": "8px"
      }
    }
  ]
}`;

  const blockExample = `{
  "id": "text-1",
  "type": "text",
  "content": "Teks konten",
  "styles": {
    "fontSize": "16px",
    "color": "#000000",
    "textAlign": "center"
  },
  "position": {
    "x": 0,
    "y": 0
  },
  "size": {
    "width": "100%",
    "height": "auto"
  },
  "animation": {
    "type": "fadeIn",
    "duration": 1000,
    "delay": 0,
    "easing": "ease-in-out"
  },
  "customCSS": ".custom-class { opacity: 0.9; }",
  "locked": false
}`;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Container>
      <Content>
        <Header>
          <BackButton onClick={() => router.back()}>
            <FaArrowLeft />
            Kembali
          </BackButton>
          <Title>
            <FaCode />
            Dokumentasi Format JSON Tema
          </Title>
          <Subtitle>
            Panduan lengkap untuk memahami dan membuat file JSON tema untuk undangan digital.
            Pelajari struktur, properti, dan contoh penggunaan format JSON tema.
          </Subtitle>
        </Header>

        <Section>
          <SectionTitle>1. Pengenalan</SectionTitle>
          <Paragraph>
            Format JSON Tema adalah standar yang digunakan untuk menyimpan dan membagikan desain undangan digital. 
            Format ini memungkinkan Anda untuk:
          </Paragraph>
          <List>
            <ListItem>Menyimpan desain undangan sebagai file JSON</ListItem>
            <ListItem>Membagikan tema dengan pengguna lain</ListItem>
            <ListItem>Mengimpor tema yang sudah dibuat sebelumnya</ListItem>
            <ListItem>Membuat template tema yang dapat digunakan kembali</ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>2. Struktur Utama JSON</SectionTitle>
          <Paragraph>
            Setiap file JSON tema harus mengikuti struktur berikut:
          </Paragraph>
          
          <CodeBlock>
            <CopyButton onClick={() => handleCopy(fullExample, 'full')}>
              {copied === 'full' ? <><FaCheckCircle /> Disalin</> : <><FaCopy /> Salin</>}
            </CopyButton>
            {fullExample}
          </CodeBlock>

          <SectionSubtitle>2.1. Root Properties</SectionSubtitle>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Property</TableHeaderCell>
                <TableHeaderCell>Tipe</TableHeaderCell>
                <TableHeaderCell>Wajib</TableHeaderCell>
                <TableHeaderCell>Deskripsi</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <tbody>
              <TableRow>
                <TableCell>version</TableCell>
                <TableCell>string</TableCell>
                <TableCell>Ya</TableCell>
                <TableCell>Versi format JSON (contoh: "1.0.0")</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>name</TableCell>
                <TableCell>string</TableCell>
                <TableCell>Ya</TableCell>
                <TableCell>Nama tema (contoh: "Tema Undangan Pernikahan")</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>description</TableCell>
                <TableCell>string</TableCell>
                <TableCell>Tidak</TableCell>
                <TableCell>Deskripsi tema (opsional)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>metadata</TableCell>
                <TableCell>object</TableCell>
                <TableCell>Ya</TableCell>
                <TableCell>Informasi metadata tema</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>canvas</TableCell>
                <TableCell>object</TableCell>
                <TableCell>Ya</TableCell>
                <TableCell>Pengaturan canvas/background</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>blocks</TableCell>
                <TableCell>array</TableCell>
                <TableCell>Ya</TableCell>
                <TableCell>Array dari semua block komponen</TableCell>
              </TableRow>
            </tbody>
          </Table>
        </Section>

        <Section>
          <SectionTitle>3. Metadata Object</SectionTitle>
          <Paragraph>
            Object <Code>metadata</Code> berisi informasi tentang kapan dan bagaimana tema diekspor:
          </Paragraph>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Property</TableHeaderCell>
                <TableHeaderCell>Tipe</TableHeaderCell>
                <TableHeaderCell>Wajib</TableHeaderCell>
                <TableHeaderCell>Deskripsi</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <tbody>
              <TableRow>
                <TableCell>exportedAt</TableCell>
                <TableCell>string (ISO 8601)</TableCell>
                <TableCell>Ya</TableCell>
                <TableCell>Waktu ekspor dalam format ISO (contoh: "2024-01-15T10:30:00.000Z")</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>exportedBy</TableCell>
                <TableCell>string</TableCell>
                <TableCell>Tidak</TableCell>
                <TableCell>Nama pengguna yang mengekspor tema</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>appVersion</TableCell>
                <TableCell>string</TableCell>
                <TableCell>Tidak</TableCell>
                <TableCell>Versi aplikasi saat ekspor (contoh: "1.0.0")</TableCell>
              </TableRow>
            </tbody>
          </Table>
        </Section>

        <Section>
          <SectionTitle>4. Canvas Object</SectionTitle>
          <Paragraph>
            Object <Code>canvas</Code> mengatur pengaturan background dan tampilan:
          </Paragraph>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Property</TableHeaderCell>
                <TableHeaderCell>Tipe</TableHeaderCell>
                <TableHeaderCell>Wajib</TableHeaderCell>
                <TableHeaderCell>Deskripsi</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <tbody>
              <TableRow>
                <TableCell>background</TableCell>
                <TableCell>string</TableCell>
                <TableCell>Tidak</TableCell>
                <TableCell>Warna background atau URL gambar (contoh: "#ffffff" atau "/path/to/image.jpg")</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>deviceView</TableCell>
                <TableCell>string</TableCell>
                <TableCell>Tidak</TableCell>
                <TableCell>Tampilan device: "mobile", "tablet", atau "desktop" (default: "mobile")</TableCell>
              </TableRow>
            </tbody>
          </Table>
        </Section>

        <Section>
          <SectionTitle>5. Block Object</SectionTitle>
          <Paragraph>
            Setiap item dalam array <Code>blocks</Code> adalah object block yang merepresentasikan sebuah komponen:
          </Paragraph>
          
          <CodeBlock>
            <CopyButton onClick={() => handleCopy(blockExample, 'block')}>
              {copied === 'block' ? <><FaCheckCircle /> Disalin</> : <><FaCopy /> Salin</>}
            </CopyButton>
            {blockExample}
          </CodeBlock>

          <SectionSubtitle>5.1. Block Properties</SectionSubtitle>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Property</TableHeaderCell>
                <TableHeaderCell>Tipe</TableHeaderCell>
                <TableHeaderCell>Wajib</TableHeaderCell>
                <TableHeaderCell>Deskripsi</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <tbody>
              <TableRow>
                <TableCell>id</TableCell>
                <TableCell>string</TableCell>
                <TableCell>Ya</TableCell>
                <TableCell>ID unik untuk block (akan di-generate ulang saat import)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>type</TableCell>
                <TableCell>string</TableCell>
                <TableCell>Ya</TableCell>
                <TableCell>Tipe block (lihat daftar tipe block di bawah)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>content</TableCell>
                <TableCell>any</TableCell>
                <TableCell>Ya</TableCell>
                <TableCell>Konten block (bisa string, object, atau array tergantung tipe)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>styles</TableCell>
                <TableCell>object</TableCell>
                <TableCell>Ya</TableCell>
                <TableCell>CSS styles untuk block (React.CSSProperties)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>position</TableCell>
                <TableCell>object</TableCell>
                <TableCell>Tidak</TableCell>
                <TableCell>Posisi block: {"{ x: number, y: number }"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>size</TableCell>
                <TableCell>object</TableCell>
                <TableCell>Tidak</TableCell>
                <TableCell>Ukuran block: {"{ width: number|string, height: number|string }"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>animation</TableCell>
                <TableCell>object</TableCell>
                <TableCell>Tidak</TableCell>
                <TableCell>Animasi block (type, duration, delay, easing)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>customCSS</TableCell>
                <TableCell>string</TableCell>
                <TableCell>Tidak</TableCell>
                <TableCell>CSS kustom untuk block</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>locked</TableCell>
                <TableCell>boolean</TableCell>
                <TableCell>Tidak</TableCell>
                <TableCell>Apakah block terkunci (default: false)</TableCell>
              </TableRow>
            </tbody>
          </Table>
        </Section>

        <Section>
          <SectionTitle>6. Tipe Block yang Tersedia</SectionTitle>
          <Paragraph>
            Berikut adalah semua tipe block yang dapat digunakan:
          </Paragraph>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Tipe</TableHeaderCell>
                <TableHeaderCell>Deskripsi</TableHeaderCell>
                <TableHeaderCell>Content Format</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <tbody>
              <TableRow>
                <TableCell>text</TableCell>
                <TableCell>Block teks</TableCell>
                <TableCell>string</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>image</TableCell>
                <TableCell>Block gambar</TableCell>
                <TableCell>{"{ src: string, alt?: string }"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>video</TableCell>
                <TableCell>Block video</TableCell>
                <TableCell>{"{ src: string, type?: string }"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>button</TableCell>
                <TableCell>Block tombol</TableCell>
                <TableCell>{"{ text: string, link?: string }"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>map</TableCell>
                <TableCell>Block peta</TableCell>
                <TableCell>{"{ lat: number, lng: number, zoom?: number }"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>countdown</TableCell>
                <TableCell>Block hitung mundur</TableCell>
                <TableCell>{"{ targetDate: string (ISO) }"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>form</TableCell>
                <TableCell>Block form</TableCell>
                <TableCell>{"{ fields: array }"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>gallery</TableCell>
                <TableCell>Block galeri gambar</TableCell>
                <TableCell>{"{ images: array }"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>masonry</TableCell>
                <TableCell>Block masonry layout</TableCell>
                <TableCell>{"{ items: array }"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>imageTransition</TableCell>
                <TableCell>Block transisi gambar</TableCell>
                <TableCell>{"{ images: array }"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>shape</TableCell>
                <TableCell>Block shape/geometri</TableCell>
                <TableCell>{"{ type: string, color?: string }"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>spacer</TableCell>
                <TableCell>Block jarak</TableCell>
                <TableCell>{"{ height: number }"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>icon</TableCell>
                <TableCell>Block ikon</TableCell>
                <TableCell>{"{ name: string, size?: number }"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>bank</TableCell>
                <TableCell>Block informasi bank</TableCell>
                <TableCell>{"{ bankName: string, accountNumber: string }"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>gift</TableCell>
                <TableCell>Block informasi kado</TableCell>
                <TableCell>{"{ message: string }"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>audio</TableCell>
                <TableCell>Block audio</TableCell>
                <TableCell>{"{ src: string }"}</TableCell>
              </TableRow>
            </tbody>
          </Table>
        </Section>

        <Section>
          <SectionTitle>7. Contoh Lengkap</SectionTitle>
          <Paragraph>
            Berikut adalah contoh lengkap JSON tema dengan beberapa block:
          </Paragraph>
          <CodeBlock>
            <CopyButton onClick={() => handleCopy(fullExample, 'complete')}>
              {copied === 'complete' ? <><FaCheckCircle /> Disalin</> : <><FaCopy /> Salin</>}
            </CopyButton>
            {fullExample}
          </CodeBlock>
        </Section>

        <Section>
          <SectionTitle>8. Tips dan Best Practices</SectionTitle>
          <List>
            <ListItem>Selalu validasi JSON sebelum mengimpor menggunakan validator JSON online</ListItem>
            <ListItem>Pastikan semua property wajib ada dalam JSON</ListItem>
            <ListItem>Gunakan format yang konsisten untuk ID block (contoh: "text-1", "image-1")</ListItem>
            <ListItem>Simpan file JSON dengan ekstensi .json</ListItem>
            <ListItem>Backup file JSON tema yang penting</ListItem>
            <ListItem>Gunakan deskripsi yang jelas untuk memudahkan identifikasi tema</ListItem>
            <ListItem>Perhatikan ukuran file JSON, hindari gambar base64 yang terlalu besar</ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>9. Validasi JSON</SectionTitle>
          <Paragraph>
            Sistem akan memvalidasi JSON saat import. Pastikan JSON Anda memenuhi kriteria berikut:
          </Paragraph>
          <List>
            <ListItem>Format JSON valid (dapat di-parse)</ListItem>
            <ListItem>Memiliki property version, name, metadata, canvas, dan blocks</ListItem>
            <ListItem>Metadata memiliki property exportedAt</ListItem>
            <ListItem>Canvas adalah object</ListItem>
            <ListItem>Blocks adalah array</ListItem>
            <ListItem>Setiap block memiliki id dan type</ListItem>
            <ListItem>Content block tidak null atau undefined</ListItem>
          </List>
        </Section>

        <HighlightBox>
          <HighlightTitle>
            <FaFileCode />
            Catatan Penting
          </HighlightTitle>
          <Paragraph>
            Saat mengimpor tema, ID block akan di-generate ulang secara otomatis untuk menghindari konflik. 
            Semua data block akan diimpor dengan benar termasuk position, size, styles, dan animation.
          </Paragraph>
        </HighlightBox>
      </Content>
    </Container>
  );
}

