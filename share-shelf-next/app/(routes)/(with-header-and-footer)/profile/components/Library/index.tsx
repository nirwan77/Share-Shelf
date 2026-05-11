"use client";

import BookCard from "@/components/manual/card";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import {
  useGetProfile,
  useGetReadingGoal,
  useSetReadingGoal,
  type ProfileData,
} from "../../action";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import { Target, Trophy } from "lucide-react";
import { toast } from "sonner";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const getErrorMessage = (error: unknown) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response &&
    typeof error.response.data === "object" &&
    error.response.data !== null &&
    "message" in error.response.data &&
    typeof error.response.data.message === "string"
  ) {
    return error.response.data.message;
  }

  return "Could not update reading challenge";
};

export const Library = ({ userProfile }: { userProfile?: ProfileData }) => {
  const { data: ownData, isLoading } = useGetProfile();
  const { data: readingGoal } = useGetReadingGoal();
  const setReadingGoal = useSetReadingGoal();
  const [targetBooks, setTargetBooks] = useState<string | null>(null);
  const data = userProfile || ownData;
  const isOwnProfile = !userProfile;

  if (isLoading && !userProfile) return <div className="py-4">Loading your library...</div>;

  const statuses = data?.userBookStatuses || [];
  const reading = statuses.filter((s) => s.status === "READING");
  const read = statuses.filter((s) => s.status === "READ");
  const toRead = statuses.filter((s) => s.status === "PLAN_TO_READ");

  const renderSwiper = (books: typeof statuses) => {
    if (books.length === 0) {
      return <p className="text-gray-400 text-sm mt-2 mb-6">No books in this category yet.</p>;
    }
    return (
      <Swiper
        modules={[Navigation]}
        spaceBetween={16}
        slidesPerView={1.2}
        breakpoints={{
          640: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 3.5 },
        }}
        navigation
        className="mb-10"
      >
        {books.map((item) => (
          <SwiperSlide key={item.book.id}>
            <Link href={`/book-detail/${item.book.id}`}>
              <BookCard
                img={item.book.image}
                tag={item.book.author}
                title={item.book.name}
              />
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    );
  };

  const handleSetGoal = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedTarget = Number(targetBooks ?? readingGoal?.targetBooks ?? "");

    if (!Number.isInteger(parsedTarget) || parsedTarget < 1) {
      toast.error("Enter a valid number of books");
      return;
    }

    setReadingGoal.mutate(parsedTarget, {
      onSuccess: () => toast.success("Reading challenge updated"),
      onError: (error: unknown) => toast.error(getErrorMessage(error)),
    });
  };

  return (
    <div className="mt-6">
      {isOwnProfile && (
        <section className="mb-10 grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-orange-500">
                  <Target className="h-4 w-4" />
                  {readingGoal?.year || new Date().getFullYear()} Challenge
                </div>
                <h3 className="mt-2 text-2xl font-bold text-white">
                  {readingGoal?.targetBooks
                    ? `${readingGoal.readCount} of ${readingGoal.targetBooks} books read`
                    : "Set your reading challenge"}
                </h3>
                <p className="mt-2 text-sm text-gray-400">
                  {readingGoal?.targetBooks
                    ? readingGoal.remainingBooks === 0
                      ? "Challenge completed."
                      : `${readingGoal.remainingBooks} books remaining.`
                    : "Choose how many books you want to finish this year."}
                </p>
              </div>

              <form
                onSubmit={handleSetGoal}
                className="flex w-full gap-2 md:w-auto"
              >
                <input
                  type="number"
                  min={1}
                  max={1000}
                  value={
                    targetBooks ??
                    (readingGoal?.targetBooks
                      ? String(readingGoal.targetBooks)
                      : "")
                  }
                  onChange={(event) => setTargetBooks(event.target.value)}
                  className="h-11 min-w-0 flex-1 rounded-lg border border-white/10 bg-black/30 px-3 text-sm font-semibold text-white outline-none transition focus:border-orange-500 md:w-28"
                  placeholder="Books"
                />
                <button
                  type="submit"
                  disabled={setReadingGoal.isPending}
                  className="h-11 rounded-lg bg-orange-500 px-4 text-sm font-bold text-black transition hover:bg-orange-400 disabled:opacity-60"
                >
                  {setReadingGoal.isPending ? "Saving" : "Set Goal"}
                </button>
              </form>
            </div>

            <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-orange-500 transition-all"
                style={{ width: `${readingGoal?.progressPercent || 0}%` }}
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-semibold text-gray-500">
              <span>{readingGoal?.progressPercent || 0}% complete</span>
              {readingGoal?.nextMilestone && (
                <span>Next achievement at {readingGoal.nextMilestone} books</span>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-orange-500">
              <Trophy className="h-4 w-4" />
              Reading Achievements
            </div>
            {readingGoal?.achievements?.length ? (
              <div className="space-y-3">
                {readingGoal.achievements.slice(0, 3).map((achievement) => (
                  <div
                    key={achievement.id}
                    className="rounded-lg border border-white/10 bg-black/20 p-3"
                  >
                    <p className="text-sm font-bold text-white">
                      {achievement.title}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-gray-400">
                      {achievement.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-6 text-gray-400">
                Mark books as read to unlock reading achievements.
              </p>
            )}
          </div>
        </section>
      )}

      <h2 className="text-2xl font-bold text-white mb-4">
        Reading <span className="text-gray-500 font-medium ml-2">- {reading.length} books</span>
      </h2>
      {renderSwiper(reading)}

      <h2 className="text-2xl font-bold text-white mb-4 mt-10">
        Read <span className="text-gray-500 font-medium ml-2">- {read.length} books</span>
      </h2>
      {renderSwiper(read)}

      <h2 className="text-2xl font-bold text-white mb-4 mt-10">
        To Read <span className="text-gray-500 font-medium ml-2">- {toRead.length} books</span>
      </h2>
      {renderSwiper(toRead)}
    </div>
  );
};
