import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "../lib/firebase";

const AuthContext = createContext(null);

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || "ceo@rojob.eu")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [ready, setReady] = useState(!isFirebaseConfigured);

  const loadProfile = useCallback(async (uid) => {
    if (!db || !uid) {
      setProfile(null);
      return null;
    }
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = { id: snap.id, ...snap.data() };
      setProfile(data);
      return data;
    }
    setProfile(null);
    return null;
  }, []);

  const ensureUserDoc = useCallback(
    async (u, extra = {}) => {
      if (!db || !u) return null;
      const ref = doc(db, "users", u.uid);
      const snap = await getDoc(ref);
      const base = {
        email: u.email || "",
        displayName: u.displayName || extra.displayName || "",
        phone: extra.phone || "",
        updatedAt: serverTimestamp(),
      };
      if (!snap.exists()) {
        await setDoc(ref, {
          ...base,
          addresses: [],
          cart: [],
          wishlist: [],
          createdAt: serverTimestamp(),
        });
      } else {
        await setDoc(
          ref,
          {
            email: base.email,
            displayName: base.displayName || snap.data().displayName || "",
            updatedAt: serverTimestamp(),
            ...(extra.phone ? { phone: extra.phone } : {}),
          },
          { merge: true }
        );
      }
      return loadProfile(u.uid);
    },
    [loadProfile]
  );

  useEffect(() => {
    if (!isFirebaseConfigured) return undefined;
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          await ensureUserDoc(u);
        } catch {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setReady(true);
    });
  }, [ensureUserDoc]);

  const login = useCallback(
    async (email, password) => {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await ensureUserDoc(cred.user);
      return cred;
    },
    [ensureUserDoc]
  );

  const register = useCallback(
    async ({ email, password, displayName = "", phone = "" }) => {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(cred.user, { displayName });
      }
      await ensureUserDoc(cred.user, { displayName, phone });
      return cred;
    },
    [ensureUserDoc]
  );

  const logout = useCallback(() => (auth ? signOut(auth) : Promise.resolve()), []);

  const saveProfile = useCallback(
    async (patch) => {
      if (!db || !user) throw new Error("Sign in required.");
      const ref = doc(db, "users", user.uid);
      await setDoc(
        ref,
        {
          ...patch,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      if (patch.displayName && auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: patch.displayName });
      }
      return loadProfile(user.uid);
    },
    [user, loadProfile]
  );

  const isAdmin = Boolean(
    user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase())
  );

  const value = useMemo(
    () => ({
      user,
      profile,
      ready,
      configured: isFirebaseConfigured,
      isAdmin,
      login,
      register,
      logout,
      saveProfile,
      refreshProfile: () => (user ? loadProfile(user.uid) : Promise.resolve(null)),
    }),
    [user, profile, ready, isAdmin, login, register, logout, saveProfile, loadProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
