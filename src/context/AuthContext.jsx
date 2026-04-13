import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { getUserDoc } from '../services/bankingService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userDoc, setUserDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const doc = await getUserDoc(firebaseUser.uid);
          setUserDoc(doc);
        } catch (err) {
          console.error('Failed to load user doc:', err);
          setUserDoc(null);
        }
      } else {
        setUserDoc(null);
      }
      // Always unblock loading regardless of userDoc outcome
      setLoading(false);
    });
    return unsub;
  }, []);

  const refreshUserDoc = async () => {
    if (user) {
      try {
        const doc = await getUserDoc(user.uid);
        setUserDoc(doc);
      } catch (err) {
        console.error('Failed to refresh user doc:', err);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, userDoc, loading, refreshUserDoc }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
