import { axios } from "@/app/lib";
import { useMutation, useQuery } from "@tanstack/react-query";

export type DiscussData = Array<{
  _count: {
    comments: number;
    reactions: number;
  };
  content: any;
  image: any;
  createdByUser: {
    id: string;
    avatar: any;
    name: string;
  };
  createdAt: string;
  id: string;
  isLikedByMe: boolean;
}>;

export const useGetPostData = () => {
  return useQuery({
    queryKey: ["post"],
    queryFn: async () => {
      const { data } = await axios.get<DiscussData>("/discuss");
      return data;
    },
  });
};

export const useLikePost = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axios.post<DiscussData>(`/discuss/${id}/like`);
      return data;
    },
  });
};
