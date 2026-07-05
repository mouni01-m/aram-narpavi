export default function SignupPage() {
  return (
    <main className="min-h-screen bg-[#F8F7F2] flex items-center justify-center p-8">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl border border-[#1E5631]/10">

        <h1 className="text-4xl font-bold text-[#1E5631] mb-2">
          Create Account
        </h1>

        <p className="text-gray-500 mb-8">
          Join Aram Narpavi Herbals
        </p>

        <form className="space-y-5">

          <input
            type="text"
            placeholder="Full Name"
            className="w-full rounded-xl border p-4"
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-xl border p-4"
          />

          <input
            type="tel"
            placeholder="Phone Number"
            className="w-full rounded-xl border p-4"
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-xl border p-4"
          />

          <button
            className="w-full rounded-xl bg-[#1E5631] py-4 text-white font-bold"
          >
            Create Account
          </button>

        </form>

      </div>
    </main>
  );
}