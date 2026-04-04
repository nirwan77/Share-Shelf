import { axios } from "@/app/lib";
import { useMutation } from "@tanstack/react-query";

export const useVerifyPayment = () => {
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await axios.post("topup", payload);
      return data;
    },
  });
};

export const useCompletePurchase = () => {
  return useMutation({
    mutationFn: async ({
      purchaseId,
      payload,
    }: {
      purchaseId: string;
      payload: any;
    }) => {
      const { data } = await axios.post(
        `/book-purchases/${purchaseId}/complete`,
        payload,
      );
      return data;
    },
  });
};
