import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axios } from '@/lib';

export interface PurchaseTransaction {
  id: string;
  price: number;
  status: 'PENDING' | 'PAID' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  updatedAt: string;
  book: {
    name: string;
    author: string;
    image: string;
    price: number;
  };
  buyer: {
    name: string;
    email: string;
  };
  seller: {
    name: string;
    email: string;
  };
}

export const useGetPendingTransactions = () => {
  return useQuery<PurchaseTransaction[]>({
    queryKey: ['pending-transactions'],
    queryFn: async () => {
      const response = await axios.get('/dashboard-purchases');
      return response.data;
    },
  });
};

export const useCompleteTransfer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (purchaseId: string) => {
      const response = await axios.post(`/dashboard-purchases/${purchaseId}/transfer`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
};
