'use client';

import styled from 'styled-components';
import Countdown from 'react-countdown';
import { Block } from '@/types/block';

const CountdownContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const TimeDisplay = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
`;

const TimeUnit = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 60px;
`;

const TimeValue = styled.div`
  font-size: 32px;
  font-weight: bold;
  color: #007bff;
`;

const TimeLabel = styled.div`
  font-size: 12px;
  color: #666666;
  text-transform: uppercase;
  margin-top: 4px;
`;

interface CountdownBlockProps {
  block: Block;
}

const renderer = ({ days, hours, minutes, seconds, completed }: any) => {
  if (completed) {
    return <div>Acara telah dimulai!</div>;
  }

  return (
    <TimeDisplay>
      <TimeUnit>
        <TimeValue>{days}</TimeValue>
        <TimeLabel>Hari</TimeLabel>
      </TimeUnit>
      <TimeUnit>
        <TimeValue>{hours}</TimeValue>
        <TimeLabel>Jam</TimeLabel>
      </TimeUnit>
      <TimeUnit>
        <TimeValue>{minutes}</TimeValue>
        <TimeLabel>Menit</TimeLabel>
      </TimeUnit>
      <TimeUnit>
        <TimeValue>{seconds}</TimeValue>
        <TimeLabel>Detik</TimeLabel>
      </TimeUnit>
    </TimeDisplay>
  );
};

export default function CountdownBlock({ block }: CountdownBlockProps) {
  const targetDate = block.content ? new Date(block.content) : new Date();

  return (
    <CountdownContainer style={block.styles}>
      <Countdown date={targetDate} renderer={renderer} />
    </CountdownContainer>
  );
}

