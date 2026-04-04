"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSubmitBookRequest } from "@/app/(routes)/(with-header-and-footer)/explore/action";
import { toast } from "sonner";

export default function RequestBookModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");

  const { mutate, isPending } = useSubmitBookRequest();

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate(
      { title, author, description: description || undefined },
      {
        onSuccess: () => {
          setTitle("");
          setAuthor("");
          setDescription("");
          toast.success("Request submitted successfully!");
          onClose();
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Failed to submit request");
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        {/* Decorative top accent */}
        <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#FF8D28] to-transparent" />

        <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-6 pt-6 pb-5 border-b border-gray-100">
            <div className="flex items-start justify-between gap-4">
              <div>
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mb-3">
                  <svg
                    className="w-5 h-5 text-[#FF8D28]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-900 tracking-tight">
                  Request a Book
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Can&apos;t find it? Ask the admin to add it.
                </p>
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                className="mt-0.5 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <Label
                htmlFor="req-title"
                className="text-sm font-medium text-gray-700"
              >
                Book Title
                <span className="text-[#FF8D28] ml-0.5">*</span>
              </Label>
              <Input
                id="req-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. The Great Gatsby"
                required
                className="h-10 border-gray-200 focus:border-[#FF8D28] focus:ring-[#FF8D28]/20 placeholder:text-gray-300 text-sm text-black"
              />
            </div>

            {/* Author */}
            <div className="space-y-1.5">
              <Label
                htmlFor="req-author"
                className="text-sm font-medium text-gray-700"
              >
                Author
                <span className="text-[#FF8D28] ml-0.5">*</span>
              </Label>
              <Input
                id="req-author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. F. Scott Fitzgerald"
                required
                className="h-10 border-gray-200 focus:border-[#FF8D28] focus:ring-[#FF8D28]/20 placeholder:text-gray-300 text-sm text-black"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="req-desc"
                  className="text-sm font-medium text-gray-700"
                >
                  Description
                </Label>
                <span className="text-xs text-gray-400">Optional</span>
              </div>
              <textarea
                id="req-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-black placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF8D28]/20 focus:border-[#FF8D28] min-h-[88px] resize-none transition-colors"
                placeholder="Any additional details about the book…"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2.5 pt-1">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-10 text-sm font-medium border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-800 rounded-lg"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 h-10 text-sm font-medium bg-[#FF8D28] hover:bg-[#f07d18] text-white rounded-lg shadow-sm shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                disabled={isPending || !title || !author}
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="w-3.5 h-3.5 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Submitting…
                  </span>
                ) : (
                  "Submit Request"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
