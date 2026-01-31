import { axios } from "@/app/lib";
import { useQuery } from "@tanstack/react-query";

export type Book = {
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
  releaseDate: string; // Added ✅
};

export type GetBooksResponse = {
  data: Book[];
  total: number;
};

export type BookFilters = {
  minPrice?: number;
  maxPrice?: number;
  categories?: string[];
  publishedDate?: string;
};

export const useGetBooks = (
  page: number,
  limit: number = 12,
  filters: BookFilters = {},
) => {
  const skip = page * limit;

  return useQuery({
    queryKey: ["get-books", page, limit, filters],
    queryFn: async () => {
      const params = {
        limit,
        skip,
        ...filters,
        ...(filters.categories && { categories: filters.categories.join(",") }),
      };

      const { data } = await axios.get<GetBooksResponse>("/explore", {
        params,
      });
      return data;
    },
  });
};
