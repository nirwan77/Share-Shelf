import { axios } from "@/app/lib";
import { useMutation } from "@tanstack/react-query";

interface CreatePostBody {
  title: string;
  description?: string;
  image?: File | null;
}

interface CreatePostResponse {
  id: string;
  title: string;
  content?: string;
  image?: string;
}

export const useCreatePost = () => {
  return useMutation<CreatePostResponse, Error, CreatePostBody>({
    mutationFn: async ({ title, description, image }) => {
      let imageUrl: string | undefined;

      if (image) {
        const formData = new FormData();
        formData.append("file", image);

        const { data: uploadData } = await axios.post(
          "/upload/image",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );

        imageUrl = uploadData.url;
      }

      const { data } = await axios.post("/discuss", {
        title,
        content: description,
        image: imageUrl,
      });

      return data;
    },
    retry: 0,
  });
};
