import { axios } from "@/app/lib";
import { useMutation } from "@tanstack/react-query";
import { CustomAxiosError } from "../../login/data";

interface ResetPasswordBody {
  email: string;
  code: string;
  newPassword: string;
}

interface ResetPasswordResponse {
  message: string;
}

export const useResetPassword = () => {
  return useMutation<
    ResetPasswordResponse,
    CustomAxiosError,
    ResetPasswordBody
  >({
    mutationFn: async (val: ResetPasswordBody) => {
      const { data } = await axios.post("/auth/reset-password", val);
      return data;
    },
    retry: 0,
  });
};
