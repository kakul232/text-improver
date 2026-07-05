import React, { useState } from 'react';

export interface LanguageConfig {
  language: string;
  customLanguage: string;
  style: string;
}

interface LanguageSelectProps {
  config: LanguageConfig;
  onChange: (config: LanguageConfig) => void;
}

const LANGUAGES = [
  { value: 'Same Language (Fix Grammar)', label: '✨ Same Language (Fix Grammar)' },
  { value: 'English', label: '🇺🇸 English' },
  { value: 'Spanish', label: '🇪🇸 Spanish' },
  { value: 'Hindi', label: '🇮🇳 Hindi' },
  { value: 'Assamese', label: '🇮🇳 Assamese' },
  { value: 'Bengali', label: '🇮🇳 Bengali' },
  { value: 'French', label: '🇫🇷 French' },
  { value: 'German', label: '🇩🇪 German' },
  { value: 'Japanese', label: '🇯🇵 Japanese' },
  { value: 'Chinese', label: '🇨🇳 Chinese' },
  { value: 'Korean', label: '🇰🇷 Korean' },
  { value: 'Portuguese', label: '🇵🇹 Portuguese' },
  { value: 'Russian', label: '🇷🇺 Russian' },
  { value: 'Italian', label: '🇮🇹 Italian' },
  { value: 'Custom', label: '✏️ Custom Language...' }
];

const STYLES = [
  { value: 'Professional & Formal', label: '👔 Professional' },
  { value: 'Casual & Friendly', label: '💬 Casual' },
  { value: 'Academic & Technical', label: '🔬 Academic / Technical' },
  { value: 'Simple & Clear', label: '💡 Simple & Clear' },
  { value: 'Short & Concise', label: '✂️ Short & Concise' },
  { value: 'Expanded & Eloquent', label: '✍️ Detailed & Eloquent' }
];

export const LanguageSelect: React.FC<LanguageSelectProps> = ({ config, onChange }) => {
  const [showCustomInput, setShowCustomInput] = useState(config.language === 'Custom');

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const isCustom = val === 'Custom';
    setShowCustomInput(isCustom);
    
    onChange({
      ...config,
      language: val,
      customLanguage: isCustom ? config.customLanguage : ''
    });
  };

  const handleCustomLanguageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...config,
      customLanguage: e.target.value
    });
  };

  const handleStyleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      ...config,
      style: e.target.value
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
      <div className="select-wrapper">
        {/* Language dropdown */}
        <div className="select-container">
          <select
            className="custom-select"
            value={config.language}
            onChange={handleLanguageChange}
            aria-label="Target Language"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        {/* Style/Tone dropdown */}
        <div className="select-container">
          <select
            className="custom-select"
            value={config.style}
            onChange={handleStyleChange}
            aria-label="Improvement Style"
          >
            {STYLES.map((style) => (
              <option key={style.value} value={style.value}>
                {style.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Show custom language text input when "Custom" is selected */}
      {showCustomInput && (
        <div style={{ display: 'flex', gap: '8px', animation: 'fadeIn 0.2s ease' }}>
          <input
            type="text"
            className="custom-select"
            value={config.customLanguage}
            onChange={handleCustomLanguageChange}
            placeholder="Type target language (e.g., Arabic, Latin, Marathi)..."
            style={{
              padding: '10px 14px',
              borderRadius: '10px'
            }}
          />
        </div>
      )}
    </div>
  );
};
