import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { SectionHeader } from "@/app/admin/settings/components/SectionHeader";

type SettingsCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  children: ReactNode;
  action?: ReactNode;
};

export function SettingsCard({ title, description, icon, children, action }: SettingsCardProps) {
  return (
    <section className="rounded-lg border border-[#dfe7df] bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-[#edf1ed] px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <SectionHeader title={title} description={description} icon={icon} />
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}
