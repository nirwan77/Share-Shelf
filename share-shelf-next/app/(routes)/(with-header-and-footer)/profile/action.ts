import { axios } from "@/app/lib";
import { useQuery } from "@tanstack/react-query";

export interface ProfileData {
  avatar: string;
  email: string;
  isVerified: string;
  name: string;
  money: true;
}

export const useGetProfile = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data } = await axios.get<ProfileData>("/profile");
      return data;
    },
  });
};
