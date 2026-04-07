import { axios } from "@/app/lib";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts";

export interface ProfileData {
  id: string;
  avatar: string;
  email: string;
  isVerified: string;
  name: string;
  money: true;
  _count: {
    followers: number;
    following: number;
  };
  isFollowing?: boolean;
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
  const { token } = useAuth();
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data } = await axios.get<ProfileData>("/profile");
      return data;
    },
    enabled: !!token,
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
  const { token } = useAuth();
  return useQuery({
    queryKey: ["my-offers"],
    queryFn: async () => {
      const { data } = await axios.get<MyOffer[]>("/book-offers/my");
      return data;
    },
    enabled: !!token,
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
  const { token } = useAuth();
  return useQuery({
    queryKey: ["my-requests"],
    queryFn: async () => {
      const { data } = await axios.get<MyBookRequest[]>("/book-requests/my");
      return data;
    },
    enabled: !!token,
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

export const useGetUserProfile = (id: string) => {
  return useQuery({
    queryKey: ["profile", id],
    queryFn: async () => {
      const { data } = await axios.get<ProfileData>(`/profile/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useFollowUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axios.post(`/profile/follow/${id}`);
      return data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["profile", id] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};

export const useUnfollowUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axios.delete(`/profile/follow/${id}`);
      return data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["profile", id] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};

export interface FollowData {
  follower?: { id: string; name: string; avatar: string };
  following?: { id: string; name: string; avatar: string };
}

export const useGetFollowers = (id: string) => {
  return useQuery({
    queryKey: ["followers", id],
    queryFn: async () => {
      const { data } = await axios.get<FollowData[]>(`/profile/${id}/followers`);
      return data;
    },
    enabled: !!id,
  });
};

export const useGetFollowing = (id: string) => {
  return useQuery({
    queryKey: ["following", id],
    queryFn: async () => {
      const { data } = await axios.get<FollowData[]>(`/profile/${id}/following`);
      return data;
    },
    enabled: !!id,
  });
};

export interface SearchUserData {
  id: string;
  name: string;
  avatar: string;
  _count: {
    followers: number;
    following: number;
  };
}

export const useSearchUsers = (query: string) => {
  return useQuery({
    queryKey: ["search-users", query],
    queryFn: async () => {
      const { data } = await axios.get<SearchUserData[]>(`/profile/search/users`, {
        params: { q: query },
      });
      return data;
    },
    enabled: !!query,
  });
};
