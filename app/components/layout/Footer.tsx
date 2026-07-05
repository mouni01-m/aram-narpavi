import Link from 'next/link';
import { Container } from "@/app/components/ui/Container";import Image from "next/image";
import { Mail, MapPin, Phone } from 'lucide-react';
export function Footer() {
  return <footer className="bg-[#143d24] text-white"><Container><div className="grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_.7fr_.7fr_1fr]">
<div className="max-w-sm">
    <div className="flex items-center gap-3">
        <Image
            src="/logo/aram_logo.png"
            alt="Aram Narpavi Herbals Logo"
            width={55}
            height={55}
            className="object-contain"
        />

        <div>
            <h3 className="text-xl font-bold">
                Aram Narpavi
            </h3>
            <p className="text-xs font-bold uppercase tracking-[.24em] text-[#b9d9af]">
                Herbals
            </p>
        </div>
    </div>

    <p className="mt-5 text-sm leading-7 text-white/70">
        Traditional herbal care, thoughtfully made for modern everyday wellness.
    </p>
</div>
    <div><h4 className="text-lg font-bold">Explore</h4><div className="mt-5 space-y-3 text-sm text-white/70"><Link className="block hover:text-white" href="/#products">All products</Link><Link className="block hover:text-white" href="/#benefits">Benefits</Link><Link className="block hover:text-white" href="/#story">Our heritage</Link></div></div>
    <div><h4 className="text-lg font-bold">Help</h4><div className="mt-5 space-y-3 text-sm text-white/70"><Link className="block hover:text-white" href="/#faq">FAQs</Link><Link className="block hover:text-white" href="/#contact">Contact</Link></div></div>
    <div><h4 className="text-lg font-bold">Connect</h4><div className="mt-5 space-y-3 text-sm text-white/70"><a className="flex items-center gap-2 hover:text-white" href="mailto:aramnarpavi@gmail.com"><Mail className="size-4" />aramnarpavi@gmail.com</a><a className="flex items-center gap-2 hover:text-white" href="tel:+919585304545"><Phone className="size-4" />+91 95853 04545</a><p className="flex items-center gap-2"><MapPin className="size-10" />1555/1, Kartran Kulam Street,
                    Devikapuram, Tiruvannamalai,
                    Tamil Nadu, 606902</p></div></div>
  </div><div className="flex flex-col gap-2 border-t border-white/10 py-6 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between"><p>© 2026 Aram Narpavi Herbals. All rights reserved.</p><p>Rooted in tradition. Made with care.</p></div></Container></footer>;
}
