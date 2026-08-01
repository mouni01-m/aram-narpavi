import { Camera } from "lucide-react";

type AvatarUploaderProps = {
  name: string;
  imageUrl: string;
  onChange: (value: string) => void;
};

export function AvatarUploader({ name, imageUrl, onChange }: AvatarUploaderProps) {
  const initial = name.trim().slice(0, 1).toUpperCase() || "A";
  const avatarStyle = imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined;

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-[#e3e9e3] bg-[#fbfcfb] p-4 sm:flex-row sm:items-center">
      <div
        className="relative grid size-20 place-items-center overflow-hidden rounded-full bg-[#1e5631] bg-cover bg-center text-2xl font-bold text-white"
        style={avatarStyle}
        aria-label={`${name} profile photo`}
      >
        {imageUrl ? null : initial}
      </div>
      <div className="min-w-0 flex-1">
        <label className="block text-sm font-semibold text-[#344238]">
          Profile Photo URL
          <span className="relative mt-2 block">
            <Camera className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#66736b]" aria-hidden="true" />
            <input
              value={imageUrl}
              onChange={(event) => onChange(event.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg border border-[#dbe3db] bg-white py-2.5 pl-10 pr-3.5 text-sm font-medium text-[#1f2d24] shadow-sm outline-none transition placeholder:text-[#9aa59d] focus:border-[#1e5631] focus:ring-4 focus:ring-[#1e5631]/10"
            />
          </span>
        </label>
      </div>
    </div>
  );
}
