"use client";

import { FormEvent, useState } from "react";
import { Flag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const reportReasons = [
  "Spam or misleading",
  "Harassment or bullying",
  "Hate or abuse",
  "Scam or fraud",
  "Other",
];

type ReportModalProps = {
  open: boolean;
  targetLabel: string;
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (reason: string, details?: string) => Promise<void>;
};

export function ReportModal({
  open,
  targetLabel,
  isSubmitting = false,
  onOpenChange,
  onSubmit,
}: ReportModalProps) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [error, setError] = useState("");

  const resetForm = () => {
    setReason("");
    setDetails("");
    setError("");
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) resetForm();
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedReason = reason.trim();
    const trimmedDetails = details.trim();

    if (trimmedReason.length < 3) {
      setError("Choose a reason or enter at least 3 characters.");
      return;
    }

    if (trimmedReason.length > 120) {
      setError("Reason must be 120 characters or fewer.");
      return;
    }

    setError("");
    await onSubmit(trimmedReason, trimmedDetails || undefined);
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="rounded-2xl border-white/10 bg-[#111114] p-6 text-white sm:max-w-md">
        <form onSubmit={handleSubmit} className="space-y-5">
          <DialogHeader className="gap-2 pr-6 text-left">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
              <Flag size={18} />
            </div>
            <DialogTitle className="text-xl font-bold">Report {targetLabel}</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-zinc-400">
              Send this to moderation for review.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Label className="text-sm font-semibold text-zinc-200">Reason</Label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {reportReasons.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setReason(option)}
                  className={`rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                    reason === option
                      ? "border-amber-500/70 bg-amber-500/15 text-amber-200"
                      : "border-white/10 bg-white/[0.03] text-zinc-300 hover:border-amber-500/50 hover:text-amber-200"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-details" className="text-sm font-semibold text-zinc-200">
              Details
            </Label>
            <textarea
              id="report-details"
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              maxLength={1000}
              rows={4}
              placeholder="Add context for moderators"
              className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-relaxed text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-amber-500/70 focus:bg-white/[0.06] focus:ring-3 focus:ring-amber-500/20"
            />
            <div className="text-right text-xs text-zinc-500">{details.length}/1000</div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
