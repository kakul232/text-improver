import React, { useState, useRef, useEffect } from 'react';
import { Copy, Check, Edit2 } from 'lucide-react';

interface TextOutputProps {
  value: string;
  onChange: (value: string) => void;
  onCopySuccess: () => void;
}

export const TextOutput: React.FC<TextOutputProps> = ({
  value,
  onChange,
  onCopySuccess
}) => {
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-expand height
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 350)}px`;
    }
  }, [value]);

  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      onCopySuccess();
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  if (!value) return null;

  return (
    <div
      className="input-card glass"
      style={{
        marginTop: '20px',
        borderLeft: '4px solid var(--accent-secondary)',
        animation: 'slideUp 0.3s ease-out'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px'
        }}
      >
        <span
          style={{
            fontSize: '0.85rem',
            fontWeight: 700,
            color: 'var(--accent-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Edit2 size={13} />
          IMPROVED RESULT (EDITABLE)
        </span>
        <button
          className="btn-secondary"
          onClick={handleCopy}
          style={{
            padding: '4px 10px',
            fontSize: '0.75rem',
            minHeight: '32px'
          }}
        >
          {copied ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          paddingBottom: '8px',
          overflowY: 'auto'
        }}
      />
    </div>
  );
};
