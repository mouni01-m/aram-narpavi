"use client";
type Props = { onClick: () => Promise<void>; loading?: boolean };
export function GoogleButton({ onClick, loading }: Props) {
  return <button type="button" onClick={() => void onClick()} disabled={loading} className="flex w-full items-center justify-center gap-3 rounded-lg border border-[#1E5631]/20 bg-white px-4 py-3 text-sm font-semibold text-[#1E5631] transition hover:border-[#1E5631]/45 hover:bg-[#F8F7F2] disabled:cursor-not-allowed disabled:opacity-60"><span className="grid size-5 place-items-center rounded-full bg-white text-base font-bold text-[#4285F4]">G</span>Continue with Google</button>;
}
