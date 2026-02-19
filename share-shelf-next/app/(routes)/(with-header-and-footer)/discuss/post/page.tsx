"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { useSearchParams } from "next/navigation";
import { useCreatePost } from "./action";

export default function CreatePost() {
  const searchParams = useSearchParams();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState(
    searchParams.get("content") ?? "",
  );
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const { mutate: createPost, isPending } = useCreatePost();

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    createPost(
      { title, description, image },
      {
        onSuccess: (data) => {
          console.log("Post created:", data);
        },
        onError: (error) => {
          console.error("Failed to create post:", error);
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] flex items-center justify-center px-4 py-10 font-sans">
      <div className="w-full max-w-xl flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-white text-sm font-medium tracking-wide">
            Title
          </label>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl bg-white text-gray-900 placeholder-gray-400 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-400 transition"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-white text-sm font-medium tracking-wide">
            Description
          </label>
          <textarea
            placeholder="Description.."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={7}
            className="w-full rounded-xl bg-white text-gray-900 placeholder-gray-400 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400 transition resize-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-white text-sm font-medium tracking-wide">
            Image
          </label>
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            className={`
              relative w-full h-40 rounded-xl border-2 border-dashed cursor-pointer
              flex items-center justify-center overflow-hidden transition-all
              ${
                isDragging
                  ? "border-orange-400 bg-[#2a2a2a]"
                  : "border-gray-500 bg-[#2a2a2a] hover:border-gray-400"
              }
            `}
          >
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="absolute inset-0 w-full h-full object-cover rounded-xl"
              />
            ) : (
              <span className="text-gray-400 text-sm select-none">
                Drag and Drop Image
              </span>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileChange}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="bg-orange-500 hover:bg-orange-400 active:scale-95 transition-all text-white font-semibold text-sm px-6 py-2.5 rounded-lg disabled:opacity-50"
        >
          {isPending ? "Posting..." : "Post"}
        </button>
      </div>
    </div>
  );
}
