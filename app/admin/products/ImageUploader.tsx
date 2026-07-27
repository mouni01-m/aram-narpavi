"use client";

import Image from "next/image";
import { Upload, X } from "lucide-react";
import { useRef } from "react";

interface Props {
  images: File[];
  setImages: (images: File[]) => void;
}

export default function ImageUploader({
  images,
  setImages,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    if (!files) return;

    const selected = Array.from(files);

    setImages([...images, ...selected]);
  }

  function removeImage(index: number) {
    const updated = [...images];
    updated.splice(index, 1);
    setImages(updated);
  }

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#1E5631] bg-[#F8FBF6] py-12 transition hover:bg-green-50"
      >
        <Upload size={40} className="text-[#1E5631]" />

        <p className="mt-3 text-lg font-semibold text-[#1E5631]">
          Upload Product Images
        </p>

        <p className="mt-1 text-sm text-gray-500">
          PNG, JPG or WEBP
        </p>
      </button>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />

      {images.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {images.map((file, index) => (
            <div
              key={index}
              className="relative overflow-hidden rounded-xl border bg-white"
            >
              <Image
                src={URL.createObjectURL(file)}
                alt="Preview"
                width={400}
                height={400}
                className="h-48 w-full object-cover"
              />

              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute right-2 top-2 rounded-full bg-red-600 p-1 text-white"
              >
                <X size={16} />
              </button>

              <div className="truncate px-3 py-2 text-xs text-gray-600">
                {file.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}