import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai';

// Your web app's Firebase configuration
// For local development, check environment variables; fall back to placeholders.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA_C34R0SVnTdQLOot5fSbRCMcGllE-KgU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "text-improver-c35b4.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "text-improver-c35b4",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "text-improver-c35b4.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "264402124278",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:264402124278:web:171e92895fca785e055bd7"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore
export const db = getFirestore(app);

// Enable Firebase App Check
let appCheck;
if (typeof window !== 'undefined') {
  // If running locally, enable the debug token so requests aren't blocked during testing
  if (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('192.168.')
  ) {
    (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }

  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LdF0qAqAAAAAEFakeRecaptchaKeyForLocal';
  try {
    appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(siteKey),
      isTokenAutoRefreshEnabled: true
    });
  } catch (err) {
    console.warn("App Check failed to initialize, probably missing a valid siteKey:", err);
  }
}

export { appCheck };

// Initialize Firebase AI Logic with the GoogleAIBackend
export const ai = getAI(app, { backend: new GoogleAIBackend() });

// Get a reference to the generative model
const modelName = import.meta.env.VITE_GEMINI_MODEL || "gemini-2.0-flash";
export const getImproverModel = () => {
  return getGenerativeModel(ai, {
    model: modelName,
    systemInstruction: "You are a professional text editing and translation engine. Your sole objective is to improve, refine, or translate input text into the target language with the specified tone/style. Keep the response content formatting exactly matching the user's intent. Return ONLY the final improved text. Never add markdown explanations, conversational wrappers, greetings, or meta-comments."
  });
};

// User Profile Gemini API Key Sync Helpers
export const saveUserApiKey = async (uid: string, apiKey: string): Promise<void> => {
  await setDoc(doc(db, 'users', uid), { geminiApiKey: apiKey }, { merge: true });
};

export const getUserApiKey = async (uid: string): Promise<string | null> => {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (userDoc.exists()) {
    return userDoc.data().geminiApiKey || null;
  }
  return null;
};
