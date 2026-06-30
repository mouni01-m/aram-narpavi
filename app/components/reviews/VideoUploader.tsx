'use client';

import { useRef } from 'react';
import { Video, Trash2 } from 'lucide-react';

interface VideoUploaderProps {
  video: File | null;
  setVideo: (video: File | null) => void;
}

export default function VideoUploader({
  video,
  setVideo,
}: VideoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const selectVideo = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Maximum 20MB
    if (file.size > 20 * 1024 * 1024) {
      alert('Video size must be less than 20MB');
      return;
    }

    setVideo(file);
  };

  return (
    <div className="space-y-4">

      <label className="block text-sm font-semibold text-[#1E5631]">
        Upload Video (Optional)
      </label>

      {!video ? (
        <>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-32 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#1E5631]/20 bg-[#F8F7F2] transition hover:border-[#1E5631]"
          >
            <Video className="mb-2 h-8 w-8 text-[#1E5631]" />

            <span className="font-medium text-[#1E5631]">
              Click to Upload Video
            </span>

            <span className="mt-1 text-xs text-gray-500">
              MP4, MOV (Max 20MB)
            </span>
          </button>

          <input
            ref={inputRef}
            type="file"
            accept="video/*"
            hidden
            onChange={selectVideo}
          />
        </>
      ) : (
        <div className="rounded-xl border bg-white p-4">

          <video
            controls
            className="w-full rounded-lg"
          >
            <source src={URL.createObjectURL(video)} />
          </video>

          <button
            type="button"
            onClick={() => setVideo(null)}
            className="mt-4 flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-white transition hover:bg-red-600"
          >
            <Trash2 size={18} />
            Remove Video
          </button>

        </div>
      )}

    </div>
  );
}