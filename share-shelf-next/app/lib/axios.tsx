import axios from "axios";
import { AuthContext } from "@/contexts";
import { type ReactNode, useContext, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SHARE_SHELF_URL ?? "https://localhost:3000",
  headers: { "Content-Type": "application/json" },
});

const getAuth = () => {
  if (typeof window === "undefined") return {};

  try {
    const item = localStorage.getItem("token");

    if (!item || item === "undefined" || item === "null") {
      localStorage.removeItem("token");
      return {};
    }

    return JSON.parse(item);
  } catch (error) {
    console.error("Error parsing auth token:", error);
    localStorage.removeItem("token");
    return {};
  }
};

instance.interceptors.request.use(
  (config) => {
    const { accessToken } = getAuth();

    if (config.headers && accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export const WithAxios = ({ children }: { children?: ReactNode }) => {
  const { setAuthData } = useContext(AuthContext);
  const router = useRouter();
  const interceptorId = useRef<number | null>(null);

  useEffect(() => {
    interceptorId.current = instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          setAuthData(null);
          router.push("/");
        } else if (error.response?.status === 403) {
          return Promise.reject(error);
        }

        return Promise.reject(error);
      }
    );

    return () => {
      if (interceptorId.current !== null) {
        instance.interceptors.response.eject(interceptorId.current);
      }
    };
  }, [setAuthData, router]);

  return <>{children}</>;
};
