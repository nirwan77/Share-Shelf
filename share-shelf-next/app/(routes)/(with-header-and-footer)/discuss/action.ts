import { axios } from "@/app/lib";
import { useQuery } from "@tanstack/react-query";

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
