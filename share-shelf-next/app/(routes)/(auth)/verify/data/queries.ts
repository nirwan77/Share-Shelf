import { axios } from "@/app/lib";
import { useMutation } from "@tanstack/react-query";
import { CustomAxiosError } from "../../login/data";

interface SignUpResponse {
  access_token: String;
}

interface SignUpBody {
  email: string;
  value: string;
}

export const useVerifyOTP = () => {
  return useMutation<SignUpResponse, CustomAxiosError, SignUpBody>({
    mutationFn: async (val: SignUpBody) => {
      const { data } = await axios.post(
        `/auth/verify-otp?email=${val.email}&code=${val.value}`
      );
      return data;
    },
    retry: 0,
  });
};
