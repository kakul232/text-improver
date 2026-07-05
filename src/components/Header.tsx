import React from 'react';
import type { User } from 'firebase/auth';
import { Sparkles, LogIn, LogOut, Download, History, Key } from 'lucide-react';

interface HeaderProps {
  user: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
  isInstallable: boolean;
  onInstall: () => void;
  onOpenHistory: () => void;
  hasKey: boolean;
  onOpenKeySettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onSignIn,
  onSignOut,
  isInstallable,
  onInstall,
  onOpenHistory,
  hasKey,
  onOpenKeySettings
}) => {
  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 0',
      marginBottom: '20px',
      borderBottom: '1px solid var(--card-border)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          background: 'var(--accent-gradient)',
          borderRadius: '10px',
          width: '36px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(124, 58, 237, 0.4)'
        }}>
          <Sparkles size={20} color="#fff" />
        </div>
        <h1 style={{ margin: 0, fontSize: '1.4rem' }}>LingoWand</h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* PWA Install Button */}
        {isInstallable && (
          <button
            className="btn-secondary"
            onClick={onInstall}
            title="Install App"
            style={{ padding: '8px 12px', minHeight: '40px' }}
          >
            <Download size={16} />
            <span style={{ fontSize: '0.85rem' }} className="hide-mobile">Install</span>
          </button>
        )}

        {/* Gemini API Key Status/Action */}
        {hasKey ? (
          <button
            className="btn-icon"
            onClick={onOpenKeySettings}
            title="Gemini API Key Settings"
            style={{ color: 'var(--success)' }}
          >
            <Key size={20} />
          </button>
        ) : (
          <button
            className="btn-primary"
            onClick={onOpenKeySettings}
            title="Add Gemini API Key"
            style={{
              padding: '6px 12px',
              minHeight: '36px',
              borderRadius: '10px',
              fontSize: '0.8rem',
              background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
              boxShadow: '0 0 10px rgba(245, 158, 11, 0.3)'
            }}
          >
            <Key size={14} />
            <span>+ Add Key</span>
          </button>
        )}

        {/* User History Action */}
        {user && (
          <button
            className="btn-icon"
            onClick={onOpenHistory}
            title="View History"
          >
            <History size={20} />
          </button>
        )}

        {/* User Auth Action */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img
              src={user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`}
              alt={user.displayName || 'User'}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: '1.5px solid var(--accent-primary)',
                objectFit: 'cover'
              }}
            />
            <button
              onClick={onSignOut}
              className="btn-icon"
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <button
            className="btn-secondary"
            onClick={onSignIn}
            style={{
              padding: '8px 14px',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <LogIn size={15} />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
