import type { AnalyticsMetric } from "@/types/analytics";

export default function AnalyticsCard({ metric }: { metric: AnalyticsMetric }) {
  const Icon = metric.icon;

  return (
    <article className="group rounded-2xl border border-[#1e5631]/10 bg-white p-4 shadow-[0_10px_30px_rgba(23,53,34,0.05)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_35px_rgba(23,53,34,0.1)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${metric.tone}`}>
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <span className="rounded-full bg-[#eaf5e4] px-2 py-1 text-[10px] font-bold uppercase text-[#1e5631] opacity-0 transition group-hover:opacity-100">
          Live
        </span>
      </div>
      <p className="mt-5 truncate text-2xl font-extrabold tracking-normal text-[#173d24]">{metric.value}</p>
      <h3 className="mt-1 text-sm font-bold text-[#173d24]">{metric.label}</h3>
      <p className="mt-1 text-xs font-medium leading-5 text-[#607065]">{metric.detail}</p>
    </article>
  );
}
