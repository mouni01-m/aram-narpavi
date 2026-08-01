"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";

import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({
  children,
}: ProtectedRouteProps) {
  const router = useRouter();

  const { user, loading } = useAuth();

  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function verifyAdmin() {
      if (loading) return;

      if (!user) {
        setIsAdmin(false);
        setCheckingAdmin(false);
        router.replace("/login");
        return;
      }

      setCheckingAdmin(true);

      try {
        const adminRef = doc(db, "admins", user.uid);
        const adminDoc = await getDoc(adminRef);

        if (adminDoc.exists()) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Admin verification failed:", error);
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    }

    verifyAdmin();
  }, [user, loading, router]);

  if (!loading && !user) {
    return null;
  }

  if (loading || checkingAdmin) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F7F8F5]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#1E5631] border-t-transparent" />
          <h2 className="text-lg font-semibold text-[#1E5631]">
            Checking permissions...
          </h2>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F7F8F5] px-4">
        <div className="max-w-md rounded-xl border border-red-200 bg-white p-8 text-center shadow-lg">
          <h1 className="mb-2 text-6xl font-bold text-red-600">403</h1>

          <h2 className="mb-3 text-2xl font-bold text-[#1E5631]">
            Access Denied
          </h2>

          <p className="mb-6 text-gray-600">
            You don&apos;t have permission to access the Admin Dashboard.
          </p>

          <button
            onClick={() => router.push("/")}
            className="rounded-lg bg-[#1E5631] px-6 py-3 font-semibold text-white transition hover:bg-[#174526]"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
