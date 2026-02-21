import { axios } from "@/app/lib";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface PostUser {
  id: string;
  name: string;
  avatar: string | null;
}

export interface Comment {
  id: string;
  comment: string;
  user: PostUser;
  createdAt: string;
  _count: { reactions: number };
  isLikedByMe: boolean;
}

export interface Reaction {
  id: string;
  reaction: string;
  userId: string;
}

export interface Post {
  content: string;
  image: string | null;
  createdAt: string;
  createdByUser: PostUser;
  reactions: Reaction[];
  mentions: { id: string; userId: string }[];
  _count: { comments: number; reactions: number };
  isLikedByMe: boolean;
}

export const fetchPost = async (id: string): Promise<Post> => {
  const { data } = await axios.get<Post>(`/discuss/${id}`);
  return data;
};

export const usePost = (id: string) =>
  useQuery({
    queryKey: ["post", id],
    queryFn: () => fetchPost(id),
    enabled: !!id,
  });

export const fetchComments = async (postId: string): Promise<Comment[]> => {
  const { data } = await axios.get<Comment[]>(`/discuss/${postId}/comments`);
  return data;
};

export const useComments = (postId: string) =>
  useQuery({
    queryKey: ["comments", postId],
    queryFn: () => fetchComments(postId),
    enabled: !!postId,
  });

export const useAddComment = (postId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (comment: string) => {
      const { data } = await axios.post(`/discuss/${postId}/comment`, {
        comment,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });
};

export const useLikeComment = (postId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (commentId: string) => {
      const { data } = await axios.post(`/discuss/comment/${commentId}/react`, {
        reaction: "like",
      });
      return data as Comment;
    },
    onSuccess: (updatedComment) => {
      if (!updatedComment?.id) return;
      queryClient.setQueryData(
        ["comments", postId],
        (old: Comment[] | undefined) => {
          if (!old) return old;
          return old.map((c) =>
            c.id === updatedComment.id ? { ...c, ...updatedComment } : c,
          );
        },
      );
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });
};
