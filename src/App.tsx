import { useState, useEffect } from 'react';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { 
  auth, 
  googleProvider, 
  db, 
  saveUserApiKey, 
  getUserApiKey 
} from './firebase';
import { Header } from './components/Header';
import { TextInput } from './components/TextInput';
import { LanguageSelect } from './components/LanguageSelect';
import type { LanguageConfig } from './components/LanguageSelect';
import { TextOutput } from './components/TextOutput';
import { Spinner } from './components/Spinner';
import { HistoryDrawer } from './components/HistoryDrawer';
import type { HistoryItem } from './components/HistoryDrawer';
import { ApiKeyModal } from './components/ApiKeyModal';
import { usePWAInstall } from './hooks/usePWAInstall';
import { Sparkles, Info, Check, Share, Key } from 'lucide-react';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [langConfig, setLangConfig] = useState<LanguageConfig>({
    language: 'Same Language (Fix Grammar)',
    customLanguage: '',
    style: 'Professional & Formal'
  });
  
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    return localStorage.getItem('lingowand_gemini_api_key') || '';
  });
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [geminiModel, setGeminiModel] = useState<string>(() => {
    return localStorage.getItem('lingowand_gemini_model') || 'gemini-1.5-flash';
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const { isInstallable, isIOS, install } = usePWAInstall();

  // Listen to Auth State and sync API keys
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const dbKey = await getUserApiKey(currentUser.uid);
          const localKey = localStorage.getItem('lingowand_gemini_api_key') || '';

          if (dbKey && !localKey) {
            // Sync database key to local storage
            localStorage.setItem('lingowand_gemini_api_key', dbKey);
            setGeminiApiKey(dbKey);
            showToast('Synced API Key from your profile');
          } else if (localKey && !dbKey) {
            // Backup local key to database
            await saveUserApiKey(currentUser.uid, localKey);
          } else if (localKey && dbKey && localKey !== dbKey) {
            // If keys differ, save the local one to Firestore to keep updated
            await saveUserApiKey(currentUser.uid, localKey);
          }
        } catch (err) {
          console.error('Failed to sync API key on login:', err);
        }
      }
    });
    return unsubscribe;
  }, []);

  // Listen to Firestore history if user is authenticated
  useEffect(() => {
    if (!user) {
      setHistoryItems([]);
      return;
    }

    setIsHistoryLoading(true);
    const historyRef = collection(db, 'users', user.uid, 'history');
    const q = query(historyRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: HistoryItem[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          inputText: data.inputText || '',
          outputText: data.outputText || '',
          language: data.language || '',
          style: data.style || '',
          timestamp: data.timestamp
        });
      });
      setHistoryItems(items);
      setIsHistoryLoading(false);
    }, (error) => {
      console.error("Failed to fetch history:", error);
      setIsHistoryLoading(false);
    });

    return unsubscribe;
  }, [user]);

  // Auth Handlers
  const handleSignIn = async () => {
    try {
      setErrorMsg(null);
      await signInWithPopup(auth, googleProvider);
      showToast('Signed in successfully!');
    } catch (err: any) {
      console.error('Sign in error:', err);
      setErrorMsg('Failed to sign in. Please try again.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      showToast('Signed out successfully.');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  // Toast Helper
  const showToast = (message: string) => {
    setToastMsg(message);
    setTimeout(() => {
      setToastMsg(null);
    }, 2500);
  };

  // Select item from history
  const handleSelectHistoryItem = (item: HistoryItem) => {
    setInputText(item.inputText);
    setOutputText(item.outputText);
    
    const isCustom = !['Same Language (Fix Grammar)', 'English', 'Spanish', 'Hindi', 'Assamese', 'Bengali', 'French', 'German', 'Japanese', 'Chinese', 'Korean', 'Portuguese', 'Russian', 'Italian'].includes(item.language);
    
    setLangConfig({
      language: isCustom ? 'Custom' : item.language,
      customLanguage: isCustom ? item.language : '',
      style: item.style
    });
    
    setShowHistory(false);
    showToast('Loaded conversion from history');
  };

  // Delete history item
  const handleDeleteHistoryItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'history', id));
      showToast('Item deleted');
    } catch (err) {
      console.error('Failed to delete doc:', err);
      showToast('Failed to delete history item');
    }
  };

  // API Key handlers
  const handleSaveKey = async (newKey: string) => {
    setGeminiApiKey(newKey);
    localStorage.setItem('lingowand_gemini_api_key', newKey);
    if (user) {
      try {
        await saveUserApiKey(user.uid, newKey);
      } catch (err) {
        console.error('Failed to sync key to database:', err);
      }
    }
    showToast('API Key saved successfully!');
  };

  const handleDeleteKey = async () => {
    setGeminiApiKey('');
    localStorage.removeItem('lingowand_gemini_api_key');
    if (user) {
      try {
        await saveUserApiKey(user.uid, '');
      } catch (err) {
        console.error('Failed to clear key from database:', err);
      }
    }
    showToast('API Key deleted');
  };

  const handleChangeModel = (model: string) => {
    setGeminiModel(model);
    localStorage.setItem('lingowand_gemini_model', model);
    showToast(`Model switched to ${model}`);
  };

  // Core Translation/Improvement trigger
  const handleImproveText = async () => {
    if (!inputText.trim()) {
      setErrorMsg('Please enter some text to improve.');
      return;
    }

    if (!geminiApiKey) {
      setErrorMsg('Please connect your Gemini API Key first.');
      setIsKeyModalOpen(true);
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setOutputText('');

    try {
      const targetLanguage = langConfig.language === 'Custom' 
        ? langConfig.customLanguage 
        : langConfig.language;
      
      const prompt = `System Instructions:
You are a professional text editing and translation engine. Your sole objective is to improve, refine, or translate input text into the target language with the specified tone/style. Keep the response content formatting exactly matching the user's intent. Return ONLY the final improved text. Never add markdown explanations, conversational wrappers, greetings, or meta-comments.

User Input to process:
Improve and translate the following text.
Target Language: ${targetLanguage}
Target Tone/Style: ${langConfig.style}

Instructions:
1. Fix all typos, grammar, and spelling issues.
2. Adapt word choices and structure to match the selected Target Tone/Style perfectly.
3. Translate the text to the Target Language (if target language is "Same Language", do not translate, just polish the original language).
4. Preserve the formatting and paragraph breaks if any.
5. Return ONLY the final improved/translated text. DO NOT wrap in quotes, do not write comments, do not add prefaces or explain.

Text to process:
${inputText}`;

      const modelName = geminiModel;
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const message = errData?.error?.message || `HTTP Error ${response.status}`;
        throw new Error(message);
      }

      const data = await response.json();
      const cleanedOutput = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      
      if (!cleanedOutput) {
        throw new Error('Received an empty response from Gemini. Verify your API Key and try again.');
      }

      setOutputText(cleanedOutput);

      // Save to history if logged in
      if (user) {
        const historyRef = collection(db, 'users', user.uid, 'history');
        await addDoc(historyRef, {
          inputText,
          outputText: cleanedOutput,
          language: targetLanguage,
          style: langConfig.style,
          timestamp: serverTimestamp()
        });
      }
    } catch (err: any) {
      console.error('Gemini call error:', err);
      setErrorMsg(err.message || 'Could not connect to AI service. Check your connection or API Key.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Header component */}
      <Header
        user={user}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        isInstallable={isInstallable}
        onInstall={install}
        onOpenHistory={() => setShowHistory(true)}
        hasKey={!!geminiApiKey}
        onOpenKeySettings={() => setIsKeyModalOpen(true)}
      />

      {/* PWA IOS Fallback Helper */}
      {isIOS && (
        <div className="install-banner" style={{ animation: 'fadeIn 0.3s ease' }}>
          <div className="install-banner-text" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Info size={18} color="var(--accent-secondary)" />
            <span>
              Install <strong>LingoWand</strong>: tap <Share size={14} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> and then <strong>"Add to Home Screen"</strong>.
            </span>
          </div>
        </div>
      )}

      {/* Main Core Content */}
      <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Gemini API Key Warning Card if key is missing */}
        {!geminiApiKey && (
          <div
            className="glass"
            style={{
              padding: '16px',
              borderRadius: '16px',
              marginBottom: '16px',
              borderLeft: '4px solid var(--warning)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              animation: 'fadeIn 0.3s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--warning)' }}>
              <Key size={18} />
              Gemini API Key Required
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
              Connect your own free Gemini API Key to run text improvements. Your key will be synced securely to your private database profile when logged in.
            </p>
            <button
              className="btn-primary"
              onClick={() => setIsKeyModalOpen(true)}
              style={{
                alignSelf: 'flex-start',
                minHeight: '36px',
                padding: '6px 14px',
                fontSize: '0.85rem',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                boxShadow: 'none'
              }}
            >
              Connect API Key
            </button>
          </div>
        )}

        {/* Input box */}
        <TextInput
          value={inputText}
          onChange={setInputText}
          maxLength={5000}
        />

        {/* Dropdowns */}
        <LanguageSelect
          config={langConfig}
          onChange={setLangConfig}
        />

        {/* Error message card */}
        {errorMsg && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--error)',
              color: 'var(--text-primary)',
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '0.85rem',
              marginBottom: '16px',
              animation: 'shake 0.3s ease'
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* Submit action button */}
        <div className="bottom-action-container">
          <button
            className="btn-primary sticky-mobile"
            onClick={handleImproveText}
            disabled={isLoading || !inputText.trim()}
            style={{ width: '100%' }}
          >
            <Sparkles size={18} />
            <span>{isLoading ? 'Enhancing...' : 'Improve Text'}</span>
          </button>
        </div>

        {/* Loading state indicator */}
        {isLoading && <Spinner />}

        {/* Output box */}
        <TextOutput
          value={outputText}
          onChange={setOutputText}
          onCopySuccess={() => showToast('Copied to clipboard!')}
        />
      </main>

      {/* History Slide-over Drawer */}
      <HistoryDrawer
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        historyItems={historyItems}
        isLoading={isHistoryLoading}
        onSelectItem={handleSelectHistoryItem}
        onDeleteItem={handleDeleteHistoryItem}
      />

      {/* API Key Modal Component */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        savedKey={geminiApiKey}
        onSave={handleSaveKey}
        onDelete={handleDeleteKey}
        selectedModel={geminiModel}
        onChangeModel={handleChangeModel}
      />

      {/* Toast Alert Message Notification */}
      <div className={`toast-container ${toastMsg ? 'show' : ''}`}>
        <div className="toast">
          <Check size={16} />
          <span>{toastMsg}</span>
        </div>
      </div>
    </div>
  );
}

export default App;
