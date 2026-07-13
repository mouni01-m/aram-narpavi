"use client";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import { ForgotPassword } from "./ForgotPassword";

type View = "login" | "signup" | "forgot";
export function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [view, setView] = useState<View>("login");
  const close = useCallback(() => { setView("login"); onClose(); }, [onClose]);
  useEffect(() => { const escape = (event: KeyboardEvent) => { if (event.key === "Escape") close(); }; if (open) window.addEventListener("keydown", escape); return () => window.removeEventListener("keydown", escape); }, [open, close]);
  const title = view === "signup" ? "Create your account" : view === "forgot" ? "Reset your password" : "Welcome back";
  const description = view === "signup" ? "Join our herbal wellness community." : view === "forgot" ? "We will help you get back in." : "Sign in to continue your wellness journey.";
  return <AnimatePresence>{open && <motion.div className="fixed inset-0 z-[100] grid place-items-center bg-[#173522]/45 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={close}><motion.section role="dialog" aria-modal="true" aria-labelledby="auth-modal-title" className="relative max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-xl border border-white/70 bg-[#F8F7F2]/95 p-5 shadow-2xl sm:p-8" initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 16 }} transition={{ duration: 0.2 }} onMouseDown={(event) => event.stopPropagation()}><button type="button" onClick={close} className="absolute right-4 top-4 grid size-9 place-items-center rounded-full text-[#1E5631]/65 hover:bg-[#1E5631]/10 hover:text-[#1E5631]" aria-label="Close account dialog"><X className="size-5"/></button><div className="mb-6 pr-9"><p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#E69500]">Aram Narpavi Herbals</p><h2 id="auth-modal-title" className="text-3xl font-bold text-[#1E5631]">{title}</h2><p className="mt-2 text-sm text-[#173522]/65">{description}</p></div><AnimatePresence mode="wait"><motion.div key={view} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.16 }}>{view === "login" && <LoginForm onSignup={() => setView("signup")} onForgot={() => setView("forgot")} onSuccess={close}/>} {view === "signup" && <SignupForm onLogin={() => setView("login")} onSuccess={close}/>} {view === "forgot" && <ForgotPassword onBack={() => setView("login")}/>}</motion.div></AnimatePresence></motion.section></motion.div>}</AnimatePresence>;
}
