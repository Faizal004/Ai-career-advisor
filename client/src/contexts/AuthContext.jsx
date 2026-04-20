  import React, { createContext, useContext, useEffect, useState } from "react";
  import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    getIdToken,
    signInWithPopup,
    GoogleAuthProvider,
  } from "firebase/auth";
  import { auth, googleProvider } from "../firebase";

  const AuthContext = createContext();

  export function useAuth() {
    return useContext(AuthContext);
  }

  export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser);
        setAuthLoading(false);
      });
      return unsubscribe;
    }, []);

    // Email/Password
    const register = (email, password) =>
      createUserWithEmailAndPassword(auth, email, password);

    const login = (email, password) =>
      signInWithEmailAndPassword(auth, email, password);

    // Google Sign-In
    const loginWithGoogle = () => signInWithPopup(auth, googleProvider);

    const logout = () => signOut(auth);

    const getToken = async () => {
      if (!auth.currentUser) return null;
      return await getIdToken(auth.currentUser, false);
    };

    const value = {
      user,
      register,
      login,
      loginWithGoogle, // 👈 added
      logout,
      getToken,
      authLoading,
    };

    return (
      <AuthContext.Provider value={value}>
        {!authLoading && children}
      </AuthContext.Provider>
    );
  }
