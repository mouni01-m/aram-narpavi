export default function LoadingSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading analytics">
      <div className="h-36 animate-pulse rounded-2xl bg-[#dfe9df]" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
        {Array.from({ length: 20 }, (_, index) => (
          <div key={index} className="h-36 animate-pulse rounded-2xl bg-white shadow-sm" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-96 animate-pulse rounded-2xl bg-white" />
        <div className="h-96 animate-pulse rounded-2xl bg-white" />
      </div>
    </div>
  );
}
