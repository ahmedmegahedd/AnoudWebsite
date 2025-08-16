import React, { useState, useRef, useEffect } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Enter text...',
  disabled = false,
  error = false
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selection, setSelection] = useState({ start: 0, end: 0 });

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.setSelectionRange(selection.start, selection.end);
    }
  }, [selection]);

  const getSelection = () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      return { start, end };
    }
    return { start: 0, end: 0 };
  };

  const insertText = (text: string) => {
    const { start, end } = getSelection();
    const newValue = value.substring(0, start) + text + value.substring(end);
    const newCursorPos = start + text.length;
    
    onChange(newValue);
    setSelection({ start: newCursorPos, end: newCursorPos });
  };

  const wrapText = (before: string, after: string) => {
    const { start, end } = getSelection();
    const selectedText = value.substring(start, end);
    
    if (selectedText) {
      const newValue = value.substring(0, start) + before + selectedText + after + value.substring(end);
      const newCursorPos = end + before.length + after.length;
      
      onChange(newValue);
      setSelection({ start: newCursorPos, end: newCursorPos });
    } else {
      insertText(before + after);
      setSelection({ start: start + before.length, end: start + before.length });
    }
  };

  const formatBold = () => wrapText('**', '**');
  const formatItalic = () => wrapText('*', '*');
  const formatUnderline = () => wrapText('<u>', '</u>');
  const formatHeading1 = () => wrapText('# ', '');
  const formatHeading2 = () => wrapText('## ', '');
  const formatBulletList = () => wrapText('- ', '');
  const formatNumberedList = () => wrapText('1. ', '');
  const formatLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      const { start, end } = getSelection();
      const selectedText = value.substring(start, end);
      const linkText = selectedText || 'Link';
      wrapText(`[${linkText}](${url})`, '');
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleTextareaSelect = () => {
    setSelection(getSelection());
  };

  return (
    <div className={`rich-text-editor ${error ? 'error' : ''}`}>
      {/* Toolbar */}
      <div className="rich-text-toolbar">
        <button
          type="button"
          onClick={formatBold}
          className="toolbar-btn"
          title="Bold"
          disabled={disabled}
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={formatItalic}
          className="toolbar-btn"
          title="Italic"
          disabled={disabled}
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={formatUnderline}
          className="toolbar-btn"
          title="Underline"
          disabled={disabled}
        >
          <u>U</u>
        </button>
        <div className="toolbar-separator"></div>
        <button
          type="button"
          onClick={formatHeading1}
          className="toolbar-btn"
          title="Heading 1"
          disabled={disabled}
        >
          H1
        </button>
        <button
          type="button"
          onClick={formatHeading2}
          className="toolbar-btn"
          title="Heading 2"
          disabled={disabled}
        >
          H2
        </button>
        <div className="toolbar-separator"></div>
        <button
          type="button"
          onClick={formatBulletList}
          className="toolbar-btn"
          title="Bullet List"
          disabled={disabled}
        >
          •
        </button>
        <button
          type="button"
          onClick={formatNumberedList}
          className="toolbar-btn"
          title="Numbered List"
          disabled={disabled}
        >
          1.
        </button>
        <div className="toolbar-separator"></div>
        <button
          type="button"
          onClick={formatLink}
          className="toolbar-btn"
          title="Insert Link"
          disabled={disabled}
        >
          🔗
        </button>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextareaChange}
        onSelect={handleTextareaSelect}
        placeholder={placeholder}
        disabled={disabled}
        className="rich-text-textarea"
        rows={8}
      />
    </div>
  );
};

export default RichTextEditor; 