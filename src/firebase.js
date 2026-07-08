// firebase.js — Singleton compartido para el dev-dashboard
// Reutiliza la instancia ya inicializada por App.jsx (evita double-init)
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const CENTRAL_CONFIG = {
  apiKey:            import.meta.env.VITE_DEVELOPER_CENTRAL_API_KEY            || '',
  authDomain:        import.meta.env.VITE_DEVELOPER_CENTRAL_AUTH_DOMAIN        || '',
  projectId:         import.meta.env.VITE_DEVELOPER_CENTRAL_PROJECT_ID         || '',
  storageBucket:     import.meta.env.VITE_DEVELOPER_CENTRAL_STORAGE_BUCKET     || '',
  messagingSenderId: import.meta.env.VITE_DEVELOPER_CENTRAL_MESSAGING_SENDER_ID || '',
  appId:             import.meta.env.VITE_DEVELOPER_CENTRAL_APP_ID             || ''
}

const app = getApps().length ? getApp() : initializeApp(CENTRAL_CONFIG)
export const db = getFirestore(app)
export const auth = getAuth(app)
