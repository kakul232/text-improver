import React from 'react';
import { X, Trash2, Globe, Clock, MessageSquareCode } from 'lucide-react';

export interface HistoryItem {
  id: string;
  inputText: string;
  outputText: string;
  language: string;
  style: string;
  timestamp: any; // Firestore Timestamp
}

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  historyItems: HistoryItem[];
  isLoading: boolean;
  onSelectItem: (item: HistoryItem) => void;
  onDeleteItem: (id: string, e: React.MouseEvent) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  historyItems,
  isLoading,
  onSelectItem,
  onDeleteItem
}) => {
  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    // Handle Firestore timestamp vs JS Date
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`drawer-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`drawer ${isOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem' }}>
            <Clock size={20} color="var(--accent-primary)" />
            Your History
          </h2>
          <button className="btn-icon" onClick={onClose} aria-label="Close drawer">
            <X size={20} />
          </button>
        </div>

        <div className="drawer-body">
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
              <div className="spinner" style={{ width: '24px', height: '24px' }}></div>
            </div>
          ) : historyItems.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px 20px',
              color: 'var(--text-muted)',
              textAlign: 'center',
              gap: '12px'
            }}>
              <MessageSquareCode size={40} strokeWidth={1.5} />
              <p style={{ fontSize: '0.9rem' }}>No history items saved yet.</p>
              <p style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                Perform text improvements while signed in to save them here.
              </p>
            </div>
          ) : (
            historyItems.map((item) => (
              <div
                key={item.id}
                className="history-card"
                onClick={() => onSelectItem(item)}
              >
                <div className="meta">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
                    <Globe size={11} />
                    {item.language} • {item.style}
                  </span>
                  <span>{formatTime(item.timestamp)}</span>
                </div>
                
                <div className="text-preview" style={{ fontWeight: 600, marginBottom: '4px' }}>
                  {item.inputText}
                </div>
                <div className="text-preview" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  {item.outputText}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button
                    onClick={(e) => onDeleteItem(item.id, e)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '4px',
                      borderRadius: '4px'
                    }}
                    title="Delete item"
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--error)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};
