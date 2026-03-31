import { axios } from "@/app/lib";
import { useQuery } from "@tanstack/react-query";

export interface Genre {
  name: string;
}

export interface BookGenre {
  genre: Genre;
}

export interface BookChoice {
  id: string;
  name: string;
  author: string;
  image: string;
  bookGenres: BookGenre[];
}

export const useGetChoices = () => {
  return useQuery({
    queryKey: ["home-choices"],
    queryFn: async () => {
      const { data } = await axios.get<BookChoice[]>("/home/choices");
      return data;
    },
  });
};

export const useGetFeatured = () => {
  return useQuery({
    queryKey: ["home-featured-books"],
    queryFn: async () => {
      const { data } = await axios.get<BookChoice[]>("/home/featured");
      return data;
    },
  });
};

export const useGetPopular = () => {
  return useQuery({
    queryKey: ["home-popular"],
    queryFn: async () => {
      const { data } = await axios.get<BookChoice[]>("/home/popular");
      return data;
    },
  });
};
