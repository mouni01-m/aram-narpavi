
'use client';

import { FormEvent, useState } from 'react';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { Container } from '@/app/components/ui/Container';

export function ContactSection() {
  const [sent, setSent] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
  e.preventDefault();

  const form = e.currentTarget;

  const formData = new FormData(form);

  const payload = {
    name: formData.get('name'),
    email: formData.get('email'),
    subject: formData.get('subject'),
    message: formData.get('message'),
  };

  const response = await fetch('/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (response.ok) {
    setSent(true);
    form.reset();
  } else {
    alert('Failed to send message');
  }
}
    

  return (
    <section id="contact" className="bg-white py-20">
      <Container>
        <div className="overflow-hidden rounded-[2rem] bg-[#1E5631] text-white">
          <div className="grid lg:grid-cols-[.85fr_1.15fr]">

            <div className="p-7 sm:p-10 lg:p-12">
              <p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#b9d9af]">
                Let’s connect
              </p>

              <h2 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
                We’re here to help.
              </h2>

              <p className="mt-5 max-w-md leading-7 text-white/70">
                Questions about a product or your order?
                Reach out and our team will get back to you.
              </p>

              <div className="mt-9 space-y-5 text-sm">

                <a
                  href="mailto:aramnarpavi@gmail.com"
                  className="flex items-center gap-4 hover:text-[#E69500] transition"
                >
                  <span className="grid size-11 place-items-center rounded-full bg-white/10">
                    <Mail className="size-5" />
                  </span>

                  <span>
                    <small className="block text-white/55">Email</small>
                    aramnarpavi@gmail.com
                  </span>
                </a>

                <a
                  href="tel:+919585304545"
                  className="flex items-center gap-4 hover:text-[#E69500] transition"
                >
                  <span className="grid size-11 place-items-center rounded-full bg-white/10">
                    <Phone className="size-5" />
                  </span>

                  <span>
                    <small className="block text-white/55">Phone</small>
                    +91 95853 04545
                  </span>
                </a>

                <a
                  href="https://maps.google.com/?q=1555/1,Kartran+Kulam+Street,Devikapuram,Tiruvannamalai,Tamil+Nadu+606902"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 hover:text-[#E69500] transition"
                >
                  <span className="grid size-11 place-items-center rounded-full bg-white/10">
                    <MapPin className="size-5" />
                  </span>

                  <span>
                    <small className="block text-white/55">Location</small>
                    1555/1, Kartran Kulam Street,
                    Devikapuram, Tiruvannamalai,
                    Tamil Nadu, 606902
                  </span>
                </a>

              </div>
            </div>

            <div className="m-2 rounded-[1.6rem] bg-[#F8F7F2] p-6 text-[#173522] sm:p-9 lg:p-10">

              <h3 className="text-2xl font-bold text-[#1E5631]">
                Send a message
              </h3>

              {sent && (
                <p
                  role="status"
                  className="mt-4 rounded-xl bg-[#EAF5E4] p-3 text-sm font-semibold text-[#1E5631]"
                >
                  Thank you. Your message has been received.
                </p>
              )}

              <form onSubmit={submit} className="mt-6 space-y-4">

                <div className="grid gap-4 sm:grid-cols-2">

                  <label className="text-sm font-bold">
                    Name
                    <input
                      required
                      name="name"
                      className="mt-2 w-full rounded-xl border border-[#1E5631]/15 bg-white px-4 py-3"
                    />
                  </label>

                  <label className="text-sm font-bold">
                    Email
                    <input
                      required
                      type="email"
                      name="email"
                      className="mt-2 w-full rounded-xl border border-[#1E5631]/15 bg-white px-4 py-3"
                    />
                  </label>

                </div>

                <label className="block text-sm font-bold">
                  Subject
                  <input
                    required
                    name="subject"
                    className="mt-2 w-full rounded-xl border border-[#1E5631]/15 bg-white px-4 py-3"
                  />
                </label>

                <label className="block text-sm font-bold">
                  Message
                  <textarea
                    required
                    name="message"
                    rows={4}
                    className="mt-2 w-full resize-none rounded-xl border border-[#1E5631]/15 bg-white px-4 py-3"
                  />
                </label>

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#E69500] px-6 py-3.5 font-bold text-white transition hover:bg-[#c77f00]"
                >
                  Send message
                  <Send className="size-4" />
                </button>

              </form>
            </div>

          </div>
        </div>
      </Container>
    </section>
  );
}

