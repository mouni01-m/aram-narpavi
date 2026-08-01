import type { AnalyticsMetric } from "@/types/analytics";

import AnalyticsCard from "./AnalyticsCard";

export default function SummaryCards({ metrics }: { metrics: AnalyticsMetric[] }) {
  return (
    <section aria-label="Analytics summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
      {metrics.map((metric) => (
        <AnalyticsCard key={metric.label} metric={metric} />
      ))}
    </section>
  );
}
