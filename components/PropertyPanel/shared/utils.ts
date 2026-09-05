import { Block } from '@/types/block';

// Helper function to extract number from string (removes px, %, etc.)
const extractNumber = (str: string): number => {
  if (!str) return 0;
  const numStr = str.toString().replace(/px|%|em|rem/g, '').trim();
  const num = parseFloat(numStr);
  return isNaN(num) ? 0 : num;
};

export const parsePadding = (block: Block) => {
  const padding = block.styles.padding || '0px';
  if (typeof padding === 'string') {
    const parts = padding.split(' ').map(p => extractNumber(p));
    return {
      top: parts[0] || 0,
      right: parts[1] !== undefined ? parts[1] : parts[0] || 0,
      bottom: parts[2] !== undefined ? parts[2] : parts[0] || 0,
      left: parts[3] !== undefined ? parts[3] : parts[1] !== undefined ? parts[1] : parts[0] || 0,
    };
  }
  return { top: 0, right: 0, bottom: 0, left: 0 };
};

export const parseMargin = (block: Block) => {
  const margin = block.styles.margin || '0px';
  if (typeof margin === 'string') {
    const parts = margin.split(' ').map(p => extractNumber(p));
    return {
      top: parts[0] || 0,
      right: parts[1] !== undefined ? parts[1] : parts[0] || 0,
      bottom: parts[2] !== undefined ? parts[2] : parts[0] || 0,
      left: parts[3] !== undefined ? parts[3] : parts[1] !== undefined ? parts[1] : parts[0] || 0,
    };
  }
  return { top: 0, right: 0, bottom: 0, left: 0 };
};

