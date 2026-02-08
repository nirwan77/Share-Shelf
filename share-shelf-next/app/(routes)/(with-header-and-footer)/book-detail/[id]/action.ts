import { axios } from "@/app/lib";
import { useQuery } from "@tanstack/react-query";

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
  userBookReviews: Array<any>;
  userBookStatuses: Array<any>;
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
