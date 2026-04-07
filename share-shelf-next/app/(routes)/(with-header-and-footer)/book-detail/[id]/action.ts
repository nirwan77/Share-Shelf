import { axios } from "@/app/lib";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type BookOffer = {
  id: string;
  price: number;
  condition: string | null;
  type: "SELL" | "TRADE";
  note: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
};

export type BookReview = {
  id: string;
  rating: number;
  comment: string;
  upvotes: number;
  downvotes: number;
  myVote: "UPVOTE" | "DOWNVOTE" | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
};

export type BookDetailResponse = {
  author: string;
  description: string;
  bookGenres: Array<{
    genre: {
      name: string;
    };
  }>;
  name: string;
  image: string;
  price: number;
  userBookReviews: BookReview[];
  userBookStatuses: Array<{
    status: "READING" | "PLAN_TO_READ" | "READ";
    userId: string;
  }>;
  bookOffers: BookOffer[];
  _count: {
    userBookReviews: number;
  };
};

export const useGetBookDetail = (id: string) => {
  return useQuery({
    queryKey: ["book-detail", id],
    queryFn: async () => {
      const { data } = await axios.get<BookDetailResponse>(`/explore/${id}`);
      return data;
    },
  });
};

export const useCreateOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: {
      bookId: string;
      price: number;
      condition?: string;
      type: "SELL" | "TRADE";
      note?: string;
    }) => {
      const { data } = await axios.post("/book-offers", body);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["book-detail", variables.bookId],
      });
      queryClient.invalidateQueries({ queryKey: ["get-books"] });
    },
  });
};

export const useToggleBookStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: { bookId: string; status: "READING" | "PLAN_TO_READ" | "READ" }) => {
      const { data } = await axios.post("/book-status", body);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["book-detail", variables.bookId],
      });
    },
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: {
      bookId: string;
      rating: number;
      comment: string;
    }) => {
      const { data } = await axios.post("/book-reviews", body);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["book-detail", variables.bookId],
      });
    },
  });
};

export const useVoteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: {
      reviewId: string;
      bookId: string;
      voteType: "UPVOTE" | "DOWNVOTE";
    }) => {
      const { data } = await axios.patch(
        `/book-reviews/${body.reviewId}/vote`,
        { voteType: body.voteType },
      );
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["book-detail", variables.bookId],
      });
    },
  });
};

export const useInitiatePurchase = () => {
  return useMutation({
    mutationFn: async (payload: { offerId: string; location?: string }) => {
      const { data } = await axios.post<{
        purchaseId: string;
        price: number;
        bookName: string;
      }>("/book-purchases/initiate", payload);
      return data;
    },
  });
};
