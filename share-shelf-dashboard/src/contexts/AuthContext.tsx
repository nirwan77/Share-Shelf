import { useDidUpdate, useLocalStorage } from "@mantine/hooks";
import { createContext, useContext, type ReactNode } from "react";

type Auth = {
  id: string;
  accessToken?: string;
  expiresIn?: string;
  onboardedAt: string | null;
};

interface AuthContextInterface {
  token?: Auth;
  setAuthData: (data: Auth | null) => void;
}

export const AuthContext = createContext<AuthContextInterface>(
  {} as AuthContextInterface
);

interface Props {
  children?: ReactNode;
}

export const AuthContextProvider = (props: Props) => {
  const [token, setToken, removeToken] = useLocalStorage<Auth | undefined>({
    key: "token",
  });

  const setAuthData = (data: Auth | null) =>
    data ? setToken(data) : removeToken();

  useDidUpdate(() => {
    if (
      !token?.accessToken &&
      window.location.pathname !== "/"
    ) {
      window.location.href = "/";
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, setAuthData }}>
      {props.children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
