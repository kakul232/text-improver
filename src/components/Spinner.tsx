import React, { useState, useEffect } from 'react';

const LOADING_TEXTS = [
  'Waving wand...',
  'Refining structure...',
  'Polishing tone...',
  'Correcting grammar...',
  'Optimizing expression...',
  'Translating elements...'
];

export const Spinner: React.FC = () => {
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % LOADING_TEXTS.length);
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="spinner-container">
      <div className="spinner"></div>
      <div
        style={{
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          fontWeight: 500,
          letterSpacing: '0.05em',
          animation: 'pulse 1.5s infinite ease-in-out'
        }}
      >
        {LOADING_TEXTS[textIndex]}
      </div>
    </div>
  );
};
