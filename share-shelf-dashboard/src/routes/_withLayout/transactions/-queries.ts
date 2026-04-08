import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axios } from '@/lib';

export interface PurchaseTransaction {
  id: string;
  price: number;
  status: 'PENDING' | 'PAID' | 'COMPLETED' | 'FAILED';
  location?: string;
  commissionAmount: number;
  sellerAmount: number;
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

export interface TopupTransaction {
  id: string;
  transaction_uuid: string;
  product_code: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AllTransactions {
  purchases: PurchaseTransaction[];
  topups: TopupTransaction[];
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

export const useGetAllTransactions = () => {
  return useQuery<AllTransactions>({
    queryKey: ['all-transactions'],
    queryFn: async () => {
      const [purchasesResponse, topupsResponse] = await Promise.all([
        axios.get('/dashboard-purchases'),
        axios.get('/topup/dashboard/all')
      ]);
      return {
        purchases: purchasesResponse.data,
        topups: topupsResponse.data
      };
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
      queryClient.invalidateQueries({ queryKey: ['all-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
};
