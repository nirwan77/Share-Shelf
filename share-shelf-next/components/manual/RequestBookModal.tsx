"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSubmitBookRequest } from "@/app/(routes)/(with-header-and-footer)/explore/action";
import { useAuth } from "@/contexts";
import { toast } from "sonner";

const getRequestErrorMessage = (error: unknown) => {
  if (typeof error !== "object" || error === null || !("response" in error)) {
    return "Failed to submit request";
  }

  const response = (error as { response?: { data?: { message?: unknown } } })
    .response;

  return typeof response?.data?.message === "string"
    ? response.data.message
    : "Failed to submit request";
};

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
  const { token } = useAuth();

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token?.accessToken) {
      toast.error("Please login first.");
      return;
    }

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
        onError: (err: unknown) => {
          toast.error(getRequestErrorMessage(err));
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

        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#111114] shadow-2xl shadow-black/60">
          {/* Header */}
          <div className="border-b border-white/10 px-6 pt-6 pb-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                {/* Icon */}
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff7a00]/10">
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
                <h2 className="text-lg font-semibold tracking-tight text-white">
                  Request a Book
                </h2>
                <p className="mt-0.5 text-sm text-zinc-400">
                  Can&apos;t find it? Ask the admin to add it.
                </p>
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                className="mt-0.5 rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-white/10 hover:text-white"
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
                className="text-sm font-medium text-zinc-300"
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
                className="h-10 text-sm"
              />
            </div>

            {/* Author */}
            <div className="space-y-1.5">
              <Label
                htmlFor="req-author"
                className="text-sm font-medium text-zinc-300"
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
                className="h-10 text-sm"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="req-desc"
                  className="text-sm font-medium text-zinc-300"
                >
                  Description
                </Label>
                <span className="text-xs text-zinc-500">Optional</span>
              </div>
              <textarea
                id="req-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[88px] w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 transition-colors focus:border-[#ff7a00]/60 focus:outline-none focus:ring-4 focus:ring-[#ff7a00]/15"
                placeholder="Any additional details about the book…"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2.5 pt-1">
              <Button
                type="button"
                variant="outline"
                className="h-10 flex-1 rounded-xl text-sm font-medium"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-10 flex-1 rounded-xl text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50"
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
