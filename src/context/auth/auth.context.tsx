'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '@/types';
import { authApi } from '@/api/auth.api';
import { hasAuthCookie, setIsLoggedInCookie } from '@/utils/cookie.utils';
import { useRouter } from 'next/navigation';
import { createAxiosResponseInterceptor } from '@/config/axios.config';

interface AxiosErrorResponse {
  response?: {
    status?: number;
  };
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string, role?: Role) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateUserProfile: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    createAxiosResponseInterceptor(router);
  }, [router]);

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        console.log("logged? :", hasAuthCookie());
        
        if (hasAuthCookie()) {
          try {
            const authData = await authApi.getAuthStatus();
            if (authData && authData.user) {
              setUser(authData.user);
              setIsLoggedInCookie();
            } else {
              setUser(null);
            }
          } catch (error) {
            console.error('Error fetching auth status:', error);
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        const axiosError = error as AxiosErrorResponse;
        if (axiosError.response?.status !== 401) {
          console.error('Error initializing auth:', error);
        }
        // Reset user ke null untuk memastikan keadaan tidak terautentikasi
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (identifier: string, password: string) => {
    setIsLoading(true);
    try {
      const authData = await authApi.login({ identifier, password });
      if (authData && authData.user) {
        console.log("Login berhasil:", authData.user);
        setUser(authData.user);
        setIsLoggedInCookie();
      } else {
        console.error("Login gagal: Tidak ada data user");
        setUser(null);
      }
    } catch (error) {
      console.error("Login error:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string, role?: Role) => {
    setIsLoading(true);
    try {
      const userData = { name, email, password, phone, role };
      const response = await authApi.register(userData);
      if (response && response.user) {
        router.push('/auth/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
      // Set user ke null untuk memastikan keadaan tidak terautentikasi
      setUser(null);
      
      console.log("Logout berhasil, mengarahkan ke halaman login");
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      router.push('/auth/login');
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateUserProfile = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};