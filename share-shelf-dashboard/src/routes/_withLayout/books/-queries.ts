import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { instance } from "@/lib/axios";

export interface Book {
  id: string;
  name: string;
  author: string;
  description: string;
  image: string;
  price: number;
  releaseDate: string;
  isPopular: boolean;
  isFeatured: boolean;
  bookGenres: {
    genre: {
      id: string;
      name: string;
    };
  }[];
  lowestPrice: number | null;
  sellCount: number;
  tradeCount: number;
}

export interface BooksResponse {
  data: Book[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface BooksFilters {
  page?: number;
  limit?: number;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  genre?: string;
}

export const useGetBooks = (filters: BooksFilters = {}) => {
  const { page = 1, limit = 10, search, dateFrom, dateTo, genre } = filters;
  return useQuery<BooksResponse>({
    queryKey: ["dashboard-books", page, limit, search, dateFrom, dateTo, genre],
    queryFn: async () => {
      const { data } = await instance.get("/dashboard-books", {
        params: { page, limit, search, dateFrom, dateTo, genre },
      });
      return data;
    },
  });
};

export const useGetGenres = () => {
  return useQuery<{ id: string; name: string }[]>({
    queryKey: ["dashboard-genres"],
    queryFn: async () => {
      const { data } = await instance.get("/dashboard-books/genres");
      return data;
    },
  });
};

export const useGetBookDetails = (id: string | null) => {
  return useQuery<Book>({
    queryKey: ["dashboard-books", id],
    queryFn: async () => {
      const { data } = await instance.get(`/dashboard-books/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const { data: response } = await instance.post("/dashboard-books", data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-books"] });
    },
  });
};

export const useUpdateBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const { data: response } = await instance.patch(`/dashboard-books/${id}`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-books"] });
    },
  });
};

export const useDeleteBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: response } = await instance.delete(`/dashboard-books/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-books"] });
    },
  });
};
