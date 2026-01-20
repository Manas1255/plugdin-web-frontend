import { apiClient } from './apiClient';
import type {
  CategoriesResponse,
  CitiesResponse,
  PackageSpecificationsResponse,
  SearchServicesResponse,
  CreateServiceResponse
} from '../types';

export interface SearchServicesPayload {
  category?: string | null;
  listingType?: string | null;
  page?: number;
  limit?: number;
}

export interface CreateServicePayload {
  listingType: string;
  category: string;
  listingTitle: string;
  listingDescription: string;
  packageSpecifications: string[];
  servicingArea: string[];
  pricePerHour?: number;
  bookingStartInterval?: string;
  pricingOptions?: any[];
  availability?: any;
  photos?: string[];
}

export const servicesService = {
  getAllCategories: async () => {
    const response = await apiClient.get<CategoriesResponse>('/api/services/categories/all');
    return response.data;
  },

  getCategorySpecifications: async (categorySlug: string) => {
    const response = await apiClient.get<PackageSpecificationsResponse>(
      `/api/services/categories/${categorySlug}/specifications`
    );
    return response.data;
  },

  getAllCities: async () => {
    const response = await apiClient.get<CitiesResponse>('/api/services/cities/all');
    return response.data;
  },

  searchServices: async (payload: SearchServicesPayload) => {
    const response = await apiClient.post<SearchServicesResponse>(
      '/api/services/search',
      payload
    );
    return response.data;
  },

  createService: async (payload: CreateServicePayload) => {
    const response = await apiClient.post<CreateServiceResponse>(
      '/api/services',
      payload
    );
    return response.data;
  },

  // For multipart upload if needed
  createServiceWithFiles: async (formData: FormData) => {
    const response = await apiClient.post<CreateServiceResponse>(
      '/api/services',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }
};
