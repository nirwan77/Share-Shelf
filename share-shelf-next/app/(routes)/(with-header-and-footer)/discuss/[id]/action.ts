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
  title: string;
  image: string | null;
  createdAt: string;
  createdById: string;
  createdByUser: PostUser;
  reactions: Reaction[];
  mentions: { id: string; userId: string }[];
  _count: { comments: number; reactions: number };
  isLikedByMe: boolean;
  viewsCount: number;
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

export const useUpdatePost = (postId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title?: string;
      content?: string;
      image?: File | string | null;
    }) => {
      let imageUrl = data.image;

      if (data.image instanceof File) {
        const formData = new FormData();
        formData.append("file", data.image);
        const { data: uploadData } = await axios.post("/upload/image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        imageUrl = uploadData.url;
      }

      const { data: updatedPost } = await axios.post(`/discuss/${postId}/update`, {
        ...data,
        image: imageUrl,
      });
      return updatedPost;
    },
    onSuccess: () => {
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
