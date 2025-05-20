'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '@/types';
import { authApi } from '@/api/auth.api';
import { hasAuthCookie } from '@/utils/cookie.utils';

// Interface untuk error Axios
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

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        // Log status cookie untuk debugging
        console.log("Is logged in cookie exists:", hasAuthCookie());
        
        if (hasAuthCookie()) {
          const authData = await authApi.getAuthStatus();
          if (authData && authData.user) {
            setUser(authData.user);
          } else {
            // Jika response sukses tapi tidak ada user
            setUser(null);
            // Force hard refresh halaman untuk membersihkan state jika ada inkonsistensi
            window.location.reload();
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
      setUser(authData.user);
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
        // Register berhasil tapi tidak langsung login
        // Login dilakukan di halaman login
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
      
      // Force hard refresh halaman untuk membersihkan state
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('Logout error:', error);
      // Tetap set user ke null bahkan jika terjadi error
      setUser(null);
      // Force hard refresh halaman untuk membersihkan state
      window.location.href = '/auth/login';
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