"use client";

import { ReactNode, createContext, useContext } from "react";
import { useLocalStorage } from "usehooks-ts";

type Auth = {
  accessToken: string;
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

export const AuthContextProvider = ({ children }: Props) => {
  const [token, setToken] = useLocalStorage<Auth | undefined>(
    "token",
    undefined
  );

  const setAuthData = (data: Auth | null) => {
    setToken(data || undefined);
  };

  return (
    <AuthContext.Provider value={{ token, setAuthData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) throw new Error("useAuth must be used within an AuthProvider");

  return context;
};
