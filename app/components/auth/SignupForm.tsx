'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signup, googleLogin } from '@/lib/auth';

export default function SignupForm() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);

      await signup(name, email, password);

      alert('Account Created Successfully 🎉');

      router.push('/');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    try {
      await googleLogin();

      router.push('/');
    } catch (err: any) {
      alert(err.message);
    }
  }

  return (
    <div className="max-w-md mx-auto rounded-2xl bg-white p-8 shadow-lg">

      <h1 className="text-3xl font-bold text-center mb-6">
        Create Account
      </h1>

      <form onSubmit={handleSignup} className="space-y-4">

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e)=>setName(e.target.value)}
          required
          className="w-full rounded-xl border p-3"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          required
          className="w-full rounded-xl border p-3"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          required
          className="w-full rounded-xl border p-3"
        />

        <button
          className="w-full rounded-xl bg-green-700 py-3 text-white font-bold"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Account"}
        </button>

      </form>

      <div className="my-5 text-center">
        OR
      </div>

      <button
        onClick={handleGoogle}
        className="w-full rounded-xl border py-3 font-bold"
      >
        Continue with Google
      </button>

    </div>
  );
}