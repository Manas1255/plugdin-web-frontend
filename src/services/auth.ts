import { apiClient } from './apiClient';
import type { AuthResponse } from '../types';

export interface SignupClientPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authService = {
  signupClient: async (payload: SignupClientPayload) => {
    const response = await apiClient.post<AuthResponse>('/api/auth/signup/client', payload);
    
    // Handle token from response or headers
    const token = response.data.data.token || 
                  response.headers['authorization']?.replace('Bearer ', '') ||
                  response.headers['x-access-token'];
    
    if (token) {
      localStorage.setItem('token', token);
    }
    
    // Store user data
    const userData = {
      role: response.data.data.role,
      firstName: response.data.data.firstName,
      lastName: response.data.data.lastName,
      email: response.data.data.email,
      profilePicture: response.data.data.profilePicture,
      bio: response.data.data.bio,
    };
    localStorage.setItem('user', JSON.stringify(userData));
    
    return response.data;
  },

  login: async (payload: LoginPayload) => {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', payload);
    
    // Handle token from response or headers
    const token = response.data.data.token || 
                  response.headers['authorization']?.replace('Bearer ', '') ||
                  response.headers['x-access-token'];
    
    if (token) {
      localStorage.setItem('token', token);
    }
    
    // Store user data
    const userData = {
      role: response.data.data.role,
      firstName: response.data.data.firstName,
      lastName: response.data.data.lastName,
      email: response.data.data.email,
      profilePicture: response.data.data.profilePicture,
      bio: response.data.data.bio,
    };
    localStorage.setItem('user', JSON.stringify(userData));
    
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('addServiceDraft');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};
