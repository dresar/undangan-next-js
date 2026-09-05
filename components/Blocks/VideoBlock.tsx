'use client';

import styled from 'styled-components';
import ReactPlayer from 'react-player';
import { Block } from '@/types/block';

const VideoContainer = styled.div`
  width: 100%;
  position: relative;
  padding-top: 56.25%; /* 16:9 aspect ratio */
`;

const PlayerWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

interface VideoBlockProps {
  block: Block;
}

export default function VideoBlock({ block }: VideoBlockProps) {
  return (
    <VideoContainer style={block.styles}>
      <PlayerWrapper>
        <ReactPlayer
          url={block.content}
          width="100%"
          height="100%"
          controls
          playing={false}
        />
      </PlayerWrapper>
    </VideoContainer>
  );
}

