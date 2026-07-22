"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LoginForm from "@/app/components/auth/LoginForm";

function LoginPageContent() { const router = useRouter(); const query = useSearchParams(); const next = query.get("next"); const success = () => router.replace(next && next.startsWith("/") ? next : "/checkout"); return <main className="mx-auto flex min-h-[70vh] max-w-lg items-center px-4 py-12"><section className="w-full rounded-2xl border border-[#1E5631]/12 bg-white p-6 shadow-xl sm:p-9"><p className="eyebrow">Secure checkout</p><h1 className="mt-2 text-4xl font-bold text-[#1E5631]">Sign in to continue</h1><p className="mt-2 text-sm text-[#607065]">Your address and order history stay safely connected to your account.</p><div className="mt-7"><LoginForm onSignup={() => router.push("/?auth=signup")} onForgot={() => router.push("/?auth=forgot")} onSuccess={success} /></div></section></main>; }

export default function LoginPage() { return <Suspense fallback={<main className="mx-auto flex min-h-[70vh] max-w-lg items-center px-4 py-12"><div className="h-80 w-full animate-pulse rounded-2xl bg-[#1E5631]/5" /></main>}><LoginPageContent /></Suspense>; }
