import { useMutation } from '@tanstack/react-query'
import { axios } from "@/lib";

export const useLogin = () => {
  return useMutation({
    mutationFn: async (data: Record<string, string>) => {
      const response = await axios.post('/dashboard-auth/login', data)
      return response.data
    },
  })
}
