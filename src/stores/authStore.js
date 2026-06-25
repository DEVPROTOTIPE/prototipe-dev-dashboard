import { create } from 'zustand';
import { auth, db } from '../services/firebase';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export const useAuthStore = create((set) => ({
  user: null,
  role: null, // 'admin' | 'comercial' | 'ops'
  loading: true,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Intentar obtener el rol del documento en Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      let role = 'admin'; // Rol por defecto
      if (userDoc.exists()) {
        role = userDoc.data().role || 'admin';
      } else {
        console.warn('Usuario sin documento en Firestore /users. Asignando rol por defecto: admin');
      }

      set({ user, role, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await signOut(auth);
      set({ user: null, role: null, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  initialize: () => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Buscar el rol
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          let role = 'admin';
          if (userDoc.exists()) {
            role = userDoc.data().role || 'admin';
          }
          set({ user, role, loading: false });
        } catch (err) {
          console.error('Error recuperando rol del usuario:', err);
          // Si falla (ej. problemas de red), asignamos admin para no bloquear la consola local
          set({ user, role: 'admin', loading: false });
        }
      } else {
        set({ user: null, role: null, loading: false });
      }
    });
    return unsubscribe;
  }
}));

if (typeof window !== 'undefined') {
  window.useAuthStore = useAuthStore;
}
