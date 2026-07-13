"use client";

import { createContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import type { CustomerProfile } from "@/lib/user";
import * as authService from "@/services/authService";
import { getUserProfile } from "@/services/userService";

type AuthContextValue = { user: User | null; profile: CustomerProfile | null; loading: boolean; refreshProfile: () => Promise<void> } & typeof authService;
export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshProfile = async () => { if (auth.currentUser) setProfile(await getUserProfile(auth.currentUser.uid)); };
  useEffect(() => onAuthStateChanged(auth, async (currentUser) => { setUser(currentUser); setProfile(currentUser ? await getUserProfile(currentUser.uid) : null); setLoading(false); }), []);
  const value = useMemo(() => ({ user, profile, loading, refreshProfile, ...authService }), [user, profile, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
