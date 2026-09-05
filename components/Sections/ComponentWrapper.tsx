'use client';

import { Block } from '@/types/block';
import BlockWrapper from '../BlockWrapper';

interface ComponentWrapperProps {
  component: Block;
}

export default function ComponentWrapper({ component }: ComponentWrapperProps) {
  return <BlockWrapper block={component} />;
}
