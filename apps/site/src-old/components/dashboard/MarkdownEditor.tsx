'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { FormLabel } from 'react-bootstrap';
import 'easymde/dist/easymde.min.css';

// Dynamic import to avoid SSR issues
const SimpleMDE = dynamic(() => import('react-simplemde-editor'), {
  ssr: false,
  loading: () => <div className="text-muted">Chargement de l'éditeur...</div>,
});

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

const MarkdownEditor = ({
  value,
  onChange,
  label = "Contenu",
  placeholder = "Écrivez votre article en Markdown..."
}: MarkdownEditorProps) => {
  const options = useMemo(() => {
    return {
      spellChecker: false,
      placeholder,
      status: ['lines', 'words', 'cursor'] as any,
      toolbar: [
        'bold',
        'italic',
        'heading',
        '|',
        'quote',
        'unordered-list',
        'ordered-list',
        '|',
        'link',
        'image',
        '|',
        'preview',
        'side-by-side',
        'fullscreen',
        '|',
        'guide',
      ] as any,
      autofocus: false,
      hideIcons: ['guide'] as any,
      sideBySideFullscreen: false,
    };
  }, [placeholder]);

  return (
    <div className="mb-3">
      {label && <FormLabel>{label}</FormLabel>}
      <SimpleMDE value={value} onChange={onChange} options={options} />
    </div>
  );
};

export default MarkdownEditor;
