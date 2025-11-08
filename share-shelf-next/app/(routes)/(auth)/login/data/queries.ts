import { axios } from "@/app/lib";
import { useMutation } from "@tanstack/react-query";

interface SignUpResponse {
  access_token: String;
}

interface SignUpBody {
  email: string;
  password: string;
}

export interface CustomAxiosError {
  code: string;
  config: string;
  request: string;
  response: {
    status: number;
    data: { message: string };
  };
}

export const useLogin = () => {
  return useMutation<SignUpResponse, CustomAxiosError, SignUpBody>({
    mutationFn: async (val: SignUpBody) => {
      const { data } = await axios.post("/auth/login", val);
      return data;
    },
    retry: 0,
  });
};
