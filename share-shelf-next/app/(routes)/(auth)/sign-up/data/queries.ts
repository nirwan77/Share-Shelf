import { axios } from "@/app/lib";
import { useMutation } from "@tanstack/react-query";
import { CustomAxiosError } from "../../login/data";

interface SignUpResponse {
  access_token: String;
}

interface SignUpBody {
  email: string;
  password: string;
  name: string;
}

export const useSignUp = () => {
  return useMutation<SignUpResponse, CustomAxiosError, SignUpBody>({
    mutationFn: async (val: SignUpBody) => {
      const { data } = await axios.post("/auth/register", val);
      return data;
    },
    retry: 0,
  });
};
