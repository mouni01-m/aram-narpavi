type ToggleSwitchProps = {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function ToggleSwitch({ label, description, checked, onChange }: ToggleSwitchProps) {
  return (
    <label className="flex min-h-16 items-center justify-between gap-4 rounded-lg border border-[#e3e9e3] bg-[#fbfcfb] px-4 py-3">
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-[#26342b]">{label}</span>
        {description ? <span className="mt-0.5 block text-xs leading-5 text-[#68746c]">{description}</span> : null}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-[#1e5631]" : "bg-[#cbd5cc]"}`}
      >
        <span
          className={`absolute top-1 size-4 rounded-full bg-white shadow transition ${checked ? "left-6" : "left-1"}`}
        />
      </button>
    </label>
  );
}
