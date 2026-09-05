'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import styled from 'styled-components';
import { Block } from '@/types/block';

// Dynamic import untuk react-leaflet (client-side only)
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

const MapWrapper = styled.div`
  width: 100%;
  height: 300px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
`;

interface MapBlockProps {
  block: Block;
}

export default function MapBlock({ block }: MapBlockProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const coordinates = block.content || { lat: -6.2088, lng: 106.8456 };

  if (!isClient) {
    return (
      <MapWrapper style={block.styles}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#999',
          }}
        >
          Loading map...
        </div>
      </MapWrapper>
    );
  }

  return (
    <MapWrapper style={block.styles}>
      <MapContainer
        center={[coordinates.lat, coordinates.lng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[coordinates.lat, coordinates.lng]}>
          <Popup>Lokasi Acara</Popup>
        </Marker>
      </MapContainer>
    </MapWrapper>
  );
}

