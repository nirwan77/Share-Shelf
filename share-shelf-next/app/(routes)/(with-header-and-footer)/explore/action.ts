import { axios } from "@/app/lib";
import { useQuery } from "@tanstack/react-query";

export type GetBooksResponse = {
  data: Array<{
    id: string;
    author: string;
    bookGenres: Array<{
      genre: {
        name: string;
      };
    }>;
    name: string;
    image: string;
    price: number;
  }>;
  total: number;
};

export const useGetBooks = (page: number, limit: number = 12) => {
  const skip = page * limit;
  return useQuery({
    queryKey: ["get-books", page],
    queryFn: async () => {
      const { data } = await axios.get<GetBooksResponse>("/explore", {
        params: { limit, skip },
      });
      return data;
    },
  });
};
