import { axios } from "@/app/lib";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
  releaseDate: string;
  lowestPrice: number | null;
  sellCount: number;
  tradeCount: number;
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
  sortBy?: string;
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

export const useSubmitBookRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: {
      title: string;
      author: string;
      description?: string;
      image?: string;
    }) => {
      const { data } = await axios.post("/book-requests", body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-requests"] });
    },
  });
};
export const useGetMyBookRequests = () => {
  return useQuery<BookRequest[]>({
    queryKey: ["my-requests"],
    queryFn: async () => {
      const { data } = await axios.get("/book-requests/my");
      return data;
    },
  });
};

export interface BookRequest {
  id: string;
  title: string;
  author: string;
  description: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}
