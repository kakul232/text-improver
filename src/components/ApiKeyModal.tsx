import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Key, Eye, EyeOff, Trash2, CheckCircle2, RefreshCw } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedKey: string;
  onSave: (key: string) => void;
  onDelete: () => void;
  selectedModel: string;
  onChangeModel: (model: string) => void;
}

const DEFAULT_MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
  'gemini-2.0-flash',
  'gemini-2.5-flash'
];

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  savedKey,
  onSave,
  onDelete,
  selectedModel,
  onChangeModel
}) => {
  const [keyInput, setKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Diagnostic states
  const [isTesting, setIsTesting] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>(() => {
    const cached = localStorage.getItem('lingowand_available_models');
    return cached ? JSON.parse(cached) : DEFAULT_MODELS;
  });

  // Load saved key input if any
  useEffect(() => {
    if (savedKey) {
      setKeyInput(savedKey);
    } else {
      setKeyInput('');
    }
    setError(null);
  }, [savedKey, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const trimmed = keyInput.trim();
    if (!trimmed) {
      setError('Key cannot be empty');
      return;
    }
    
    // Validate format: API Keys are typically at least 20 characters long
    if (trimmed.length < 20) {
      setError('Invalid API Key. It must be at least 20 characters long.');
      return;
    }

    onSave(trimmed);
    setError(null);
    onClose();
  };

  const handleTestKeyAndListModels = async () => {
    const trimmed = keyInput.trim();
    if (!trimmed) {
      setError('Enter an API key first to test connection.');
      return;
    }

    setIsTesting(true);
    setError(null);

    // Try v1 first, fall back to v1beta if needed
    let fetchError: any = null;
    let modelsFetched = false;

    for (const version of ['v1', 'v1beta']) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/${version}/models?key=${trimmed}`
        );

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData?.error?.message || `HTTP Error ${response.status}`);
        }

        const data = await response.json();
        const models = data.models || [];
        
        // Filter models that support generateContent
        const generateModels = models
          .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
          .map((m: any) => m.name.replace('models/', ''));

        if (generateModels.length > 0) {
          setAvailableModels(generateModels);
          localStorage.setItem('lingowand_available_models', JSON.stringify(generateModels));
          
          // Auto-select first matching model if current selected model is not supported
          if (!generateModels.includes(selectedModel)) {
            onChangeModel(generateModels[0]);
          }
          
          modelsFetched = true;
          break; // Stop loop since it succeeded
        }
      } catch (err: any) {
        fetchError = err;
      }
    }

    setIsTesting(false);

    if (modelsFetched) {
      alert(`Success! Successfully connected and loaded available models.`);
    } else {
      setError(fetchError?.message || 'Could not connect to Gemini API. Please check your API key.');
    }
  };

  const maskKey = (key: string) => {
    if (!key) return '';
    if (key.length <= 10) return '••••••••••';
    return `${key.slice(0, 6)}••••••••${key.slice(-4)}`;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="drawer-backdrop open"
        style={{ zIndex: 110 }}
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '460px',
          background: 'var(--card-bg-solid)',
          border: '1px solid var(--card-border)',
          borderRadius: '20px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
          zIndex: 111,
          padding: '24px',
          animation: 'fadeIn 0.2s ease-out',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem', margin: 0 }}>
            <Key size={20} color="var(--accent-primary)" />
            Gemini API Settings
          </h2>
          <button className="btn-icon" onClick={onClose} aria-label="Close settings">
            <X size={20} />
          </button>
        </div>

        {/* Info Box */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--card-border)',
            borderRadius: '12px',
            padding: '12px',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)'
          }}
        >
          LingoWand runs directly on your device. To use it, you need to supply your own free Gemini API Key from Google.
          
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              color: 'var(--accent-secondary)',
              textDecoration: 'none',
              fontWeight: 600,
              marginTop: '8px'
            }}
          >
            Create API Key in Google AI Studio
            <ExternalLink size={12} />
          </a>
        </div>

        {/* Saved key indicator */}
        {savedKey && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '12px',
              padding: '10px 16px',
              fontSize: '0.9rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} color="var(--success)" />
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Key Connected</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {maskKey(savedKey)}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete your Gemini API key?')) {
                  onDelete();
                  setKeyInput('');
                }
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '6px'
              }}
              title="Delete Saved Key"
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--error)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}

        {/* Input form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            {savedKey ? 'Update API Key' : 'Enter Gemini API Key'}
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showKey ? 'text' : 'password'}
              className="custom-select"
              value={keyInput}
              onChange={(e) => {
                setKeyInput(e.target.value);
                setError(null);
              }}
              placeholder="Paste your API key here"
              style={{
                width: '100%',
                paddingRight: '45px',
                borderRadius: '12px'
              }}
            />
            <button
              onClick={() => setShowKey(!showKey)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <button
            className="btn-secondary"
            onClick={handleTestKeyAndListModels}
            disabled={isTesting || !keyInput.trim()}
            style={{
              marginTop: '6px',
              padding: '6px 12px',
              fontSize: '0.8rem',
              alignSelf: 'flex-start',
              minHeight: '32px'
            }}
          >
            <RefreshCw size={12} className={isTesting ? 'spin' : ''} style={{ marginRight: '4px' }} />
            {isTesting ? 'Connecting...' : 'Test Connection & Load Models'}
          </button>
        </div>

        {/* Model Selection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Select Active Gemini Model
          </label>
          <div className="select-container" style={{ flex: 'none' }}>
            <select
              className="custom-select"
              value={selectedModel}
              onChange={(e) => onChangeModel(e.target.value)}
              style={{ width: '100%', paddingRight: '35px' }}
            >
              {availableModels.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div style={{ color: 'var(--error)', fontSize: '0.8rem', marginTop: '-4px' }}>
            {error}
          </div>
        )}

        {/* Footer Actions */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
          <button
            className="btn-secondary"
            onClick={onClose}
            style={{ flex: 1, minHeight: '44px' }}
          >
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={!keyInput.trim()}
            style={{ flex: 1, minHeight: '44px' }}
          >
            Save Key
          </button>
        </div>
      </div>
    </>
  );
};
