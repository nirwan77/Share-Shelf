import { useQuery } from '@tanstack/react-query'
import { axios } from "@/lib";

export interface DashboardStats {
  overview: {
    totalUsers: number;
    totalBooks: number;
    totalGenres: number;
    totalPosts: number;
    totalRevenue: number;
  };
  booksByStatus: {
    status: string;
    _count: {
      status: number;
    };
  }[];
  recent: {
    users: {
      id: string;
      name: string;
      email: string;
      avatar: string | null;
      createdAt: string;
      isVerified: boolean;
    }[];
    books: {
      id: string;
      name: string;
      author: string;
      image: string;
      price: number;
      releaseDate: string;
    }[];
    payments: {
      id: string;
      transaction_uuid: string;
      total_amount: number;
      status: string;
      createdAt: string;
      user: {
        name: string;
        email: string;
      } | null;
    }[];
  };
}

export const useGetDashboardStats = () => {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await axios.get('/dashboard-stats')
      return response.data
    },
  })
}
