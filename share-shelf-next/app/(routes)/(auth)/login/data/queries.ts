import { axios } from "@/app/lib";
import { useMutation } from "@tanstack/react-query";

interface SignUpResponse {
  access_token: string;
}

interface SignUpBody {
  email: string;
  password: string;
}

interface BanAppealBody {
  email: string;
  message: string;
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

export const useSubmitBanAppeal = () => {
  return useMutation<{ message: string; appealId: string }, CustomAxiosError, BanAppealBody>({
    mutationFn: async (val: BanAppealBody) => {
      const { data } = await axios.post("/auth/ban-appeal", val);
      return data;
    },
    retry: 0,
  });
};
