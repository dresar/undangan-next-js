export type BlockType =
  | 'section'
  | 'container'
  | 'text'
  | 'image'
  | 'video'
  | 'map'
  | 'countdown'
  | 'button'
  | 'shape'
  | 'spacer'
  | 'masonry'
  | 'gallery'
  | 'imageTransition'
  | 'form'
  | 'icon'
  | 'bank'
  | 'gift'
  | 'audio';

// Simplified Block interface - seperti Elementor
export interface Block {
  id: string;
  type: BlockType;
  parentId: string | null; // null untuk section, sectionId untuk component
  children: string[]; // Array of child IDs
  content: any;
  styles: React.CSSProperties;
  animation?: {
    type: string;
    mode?: 'entrance' | 'continuous';
    duration?: number;
    delay?: number;
    easing?: string;
  };
  size?: {
    width: number | string;
    height: number | string;
  };
  customCSS?: string;
  locked?: boolean;
}

export interface HistoryState {
  past: Block[][];
  present: Block[];
  future: Block[][];
}

