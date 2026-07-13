"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { OrderList } from "@/components/orders/OrderList";
export default function OrdersPage(){const {user,loading}=useAuth();const router=useRouter();useEffect(()=>{if(!loading&&!user)router.replace("/login?next=/orders");},[loading,user,router]);if(loading||!user)return <main className="mx-auto max-w-5xl px-4 py-12"><div className="h-64 animate-pulse rounded-2xl bg-[#1E5631]/5"/></main>;return <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6"><p className="eyebrow">Your purchases</p><h1 className="mt-2 text-4xl font-bold text-[#1E5631]">My orders</h1><p className="mt-2 text-sm text-[#607065]">Track deliveries, view details, download invoices, or cancel eligible orders.</p><div className="mt-8"><OrderList uid={user.uid}/></div></main>;}
