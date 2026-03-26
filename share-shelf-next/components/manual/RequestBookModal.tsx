"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSubmitBookRequest } from "@/app/(routes)/(with-header-and-footer)/explore/action";

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
          onClose();
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4">
        <h2 className="heading-4 mb-1">Request a Book</h2>
        <p className="text-sm text-gray-500 mb-6">
          Can&apos;t find a book? Ask the admin to add it.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="req-title">Book Title *</Label>
            <Input
              id="req-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. The Great Gatsby"
              required
            />
          </div>
          <div>
            <Label htmlFor="req-author">Author *</Label>
            <Input
              id="req-author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g. F. Scott Fitzgerald"
              required
            />
          </div>
          <div>
            <Label htmlFor="req-desc">Description (optional)</Label>
            <textarea
              id="req-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[80px] resize-none"
              placeholder="Any additional details..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#FF8D28] hover:bg-[#e67d1f]"
              disabled={isPending || !title || !author}
            >
              {isPending ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
