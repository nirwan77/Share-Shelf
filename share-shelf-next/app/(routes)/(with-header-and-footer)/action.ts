import { axios } from "@/app/lib";
import { useQuery } from "@tanstack/react-query";

export interface BookChoice {
  id: string;
  name: string;
  image: string;
  genre: string;
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
