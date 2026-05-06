import { axios } from "@/app/lib";
import { useMutation } from "@tanstack/react-query";
import { CustomAxiosError } from "../../login/data";

interface ForgotPasswordBody {
  email: string;
}

interface ForgotPasswordResponse {
  message: string;
}

export const useForgotPassword = () => {
  return useMutation<
    ForgotPasswordResponse,
    CustomAxiosError,
    ForgotPasswordBody
  >({
    mutationFn: async (val: ForgotPasswordBody) => {
      const { data } = await axios.post("/auth/forgot-password", val);
      return data;
    },
    retry: 0,
  });
};
