import type { LucideIcon } from "lucide-react";

type SectionHeaderProps = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export function SectionHeader({ title, description, icon: Icon }: SectionHeaderProps) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-[#dbe5db] bg-[#f7faf5] text-[#1e5631]">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <h2 className="text-base font-bold tracking-normal text-[#17251d]">{title}</h2>
        <p className="mt-1 text-sm leading-5 text-[#647067]">{description}</p>
      </div>
    </div>
  );
}
