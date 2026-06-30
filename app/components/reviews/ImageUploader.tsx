'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { ImagePlus, Trash2 } from 'lucide-react';

interface ImageUploaderProps {
  onImagesChange: (files: File[]) => void;
}

export default function ImageUploader({
  onImagesChange,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    const updated = [...images, ...files].slice(0, 5);

    setImages(updated);

    const previews = updated.map((file) => URL.createObjectURL(file));

    setPreviewUrls(previews);

    onImagesChange(updated);
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);

    const updatedPreviews = previewUrls.filter((_, i) => i !== index);

    setImages(updatedImages);

    setPreviewUrls(updatedPreviews);

    onImagesChange(updatedImages);
  };

  return (
    <div className="space-y-4">

      <label className="block text-sm font-semibold text-[#1E5631]">
        Upload Images
      </label>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex h-32 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#1E5631]/20 bg-[#F8F7F2] transition hover:border-[#1E5631]"
      >
        <ImagePlus className="mb-2 h-8 w-8 text-[#1E5631]" />

        <span className="text-sm font-medium text-[#1E5631]">
          Click to upload images
        </span>

        <span className="mt-1 text-xs text-gray-500">
          Maximum 5 Images
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={handleSelect}
      />

      {previewUrls.length > 0 && (
        <div className="grid grid-cols-3 gap-3 md:grid-cols-5">

          {previewUrls.map((url, index) => (
            <div
              key={index}
              className="relative aspect-square overflow-hidden rounded-xl border"
            >
              <Image
                src={url}
                alt={`Preview ${index + 1}`}
                fill
                className="object-cover"
              />

              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute right-2 top-2 rounded-full bg-red-600 p-1 text-white shadow hover:bg-red-700"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}

        </div>
      )}

    </div>
  );
}