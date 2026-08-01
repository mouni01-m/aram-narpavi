import type { ChangeEventHandler, HTMLInputTypeAttribute } from "react";

type SettingsInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: HTMLInputTypeAttribute;
  placeholder?: string;
  multiline?: boolean;
  disabled?: boolean;
};

export function SettingsInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  multiline = false,
  disabled = false,
}: SettingsInputProps) {
  const commonClassName =
    "mt-2 w-full rounded-lg border border-[#dbe3db] bg-white px-3.5 py-2.5 text-sm font-medium text-[#1f2d24] shadow-sm outline-none transition placeholder:text-[#9aa59d] focus:border-[#1e5631] focus:ring-4 focus:ring-[#1e5631]/10 disabled:cursor-not-allowed disabled:bg-[#f5f7f5] disabled:text-[#7b867e]";

  const handleChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (event) => {
    onChange(event.target.value);
  };

  return (
    <label className="block text-sm font-semibold text-[#344238]">
      {label}
      {multiline ? (
        <textarea
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          rows={4}
          className={`${commonClassName} resize-none`}
        />
      ) : (
        <input
          value={value}
          onChange={handleChange}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          className={commonClassName}
        />
      )}
    </label>
  );
}
