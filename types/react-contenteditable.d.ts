declare module 'react-contenteditable' {
  import { Component, HTMLAttributes } from 'react';

  interface ContentEditableEvent {
    target: {
      value: string;
    };
    currentTarget: {
      innerHTML: string;
    };
  }

  interface ContentEditableProps extends HTMLAttributes<HTMLDivElement> {
    html: string;
    disabled?: boolean;
    tagName?: string;
    onChange?: (evt: ContentEditableEvent) => void;
  }

  class ContentEditable extends Component<ContentEditableProps> {}

  export default ContentEditable;
}

