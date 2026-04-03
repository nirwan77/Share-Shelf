import { axios } from "@/app/lib";
import { useQuery } from "@tanstack/react-query";

export interface ProfileData {
  id: string;
  avatar: string;
  email: string;
  isVerified: string;
  name: string;
  money: true;
  userBookStatuses: Array<{
    status: "READING" | "PLAN_TO_READ" | "READ";
    book: {
      id: string;
      name: string;
      author: string;
      image: string;
    }
  }>;
  userBookReviews: Array<{
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    book: {
      id: string;
      name: string;
      image: string;
    };
  }>;
}

export const useGetProfile = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data } = await axios.get<ProfileData>("/profile");
      return data;
    },
  });
};

export type MyOffer = {
  id: string;
  price: number;
  condition: string | null;
  type: "SELL" | "TRADE";
  note: string | null;
  isActive: boolean;
  createdAt: string;
  book: {
    id: string;
    name: string;
    author: string;
    image: string;
  };
};

export const useGetMyOffers = () => {
  return useQuery({
    queryKey: ["my-offers"],
    queryFn: async () => {
      const { data } = await axios.get<MyOffer[]>("/book-offers/my");
      return data;
    },
  });
};

export type MyBookRequest = {
  id: string;
  title: string;
  author: string;
  description: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
};

export const useGetMyRequests = () => {
  return useQuery({
    queryKey: ["my-requests"],
    queryFn: async () => {
      const { data } = await axios.get<MyBookRequest[]>("/book-requests/my");
      return data;
    },
  });
};

import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useDeleteOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/book-offers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-offers"] });
    },
  });
};

export const useUploadImage = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await axios.post<{ url: string; public_id: string }>(
        "/upload/image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return data;
    },
  });
};

export const useUpdateAvatar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (avatarUrl: string) => {
      const { data } = await axios.patch("/profile/avatar", { avatarUrl });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};
