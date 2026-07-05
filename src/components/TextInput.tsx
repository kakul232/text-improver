import React, { useRef, useEffect } from 'react';
import { X } from 'lucide-react';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  placeholder?: string;
}

export const TextInput: React.FC<TextInputProps> = ({
  value,
  onChange,
  maxLength = 5000,
  placeholder = "Paste or type your text here..."
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-expand height as text grows
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 350)}px`;
    }
  }, [value]);

  const handleClear = () => {
    onChange('');
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="input-card glass">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
        placeholder={placeholder}
        maxLength={maxLength}
        style={{
          paddingBottom: '20px',
          overflowY: 'auto'
        }}
      />
      {value.length > 0 && (
        <button
          onClick={handleClear}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: 'none',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            cursor: 'pointer'
          }}
          title="Clear text"
        >
          <X size={14} />
        </button>
      )}
      <div className="char-counter">
        {value.length.toLocaleString()} / {maxLength.toLocaleString()}
      </div>
    </div>
  );
};
