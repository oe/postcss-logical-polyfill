import React from 'react';
import SimpleCodeEditor from 'react-simple-code-editor';
// @ts-expect-error ignore prism types
import Prism from 'prismjs';
import 'prismjs/components/prism-css';
import 'prismjs/themes/prism.css';

interface EditorProps {
  value: string;
  onChange?: (val: string) => void;
  readOnly?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const Editor: React.FC<EditorProps> = ({ value, onChange, readOnly = false, className = '', style }) => {
  return (
    <SimpleCodeEditor
      value={value}
      onValueChange={onChange || (() => {})}
      highlight={code => Prism.highlight(code, Prism.languages.css, 'css')}
      padding={12}
      readOnly={readOnly}
      className={`cm-editor ${className}`}
      style={{
        fontFamily: 'JetBrains Mono, Fira Code, monospace',
        fontSize: 14,
        background: '#1e1e1e',
        color: '#fff',
        borderRadius: 6,
        minHeight: 180,
        ...style
      }}
      textareaId={undefined}
      textareaClassName={undefined}
      preClassName={undefined}
    />
  );
};

export default Editor;
