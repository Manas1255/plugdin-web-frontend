import { apiClient } from './apiClient';
import type {
  CategoriesResponse,
  CitiesResponse,
  PackageSpecificationsResponse,
  SearchServicesResponse,
  CreateServiceResponse,
  GetServiceByIdResponse,
} from '../types';

export interface SearchServicesPayload {
  category?: string | null;
  listingType?: string | null;
  page?: number;
  limit?: number;
}

/** API availability format: dayOfWeek, isAvailable, timeSlots with startTime/endTime */
export interface CreateServiceAvailability {
  timezone: string;
  weeklySchedule: Array<{
    dayOfWeek: string;
    isAvailable: boolean;
    timeSlots: Array<{ startTime: string; endTime: string }>;
  }>;
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
  availability?: CreateServiceAvailability;
  photos?: string[];
}

export const servicesService = {
  getAllCategories: async (): Promise<CategoriesResponse> => {
    const response = await apiClient.get<CategoriesResponse>('/api/services/categories/all');
    return response.data;
  },

  getCategorySpecifications: async (categorySlug: string): Promise<PackageSpecificationsResponse> => {
    const response = await apiClient.get<PackageSpecificationsResponse>(
      `/api/services/categories/${categorySlug}/specifications`
    );
    return response.data;
  },

  getAllCities: async (): Promise<CitiesResponse> => {
    const response = await apiClient.get<CitiesResponse>('/api/services/cities/all');
    return response.data;
  },

  searchServices: async (payload: SearchServicesPayload): Promise<SearchServicesResponse> => {
    const params = new URLSearchParams();
    if (payload.category) params.append('category', payload.category);
    if (payload.listingType) params.append('listingType', payload.listingType);
    if (payload.page) params.append('page', payload.page.toString());
    if (payload.limit) params.append('limit', payload.limit.toString());

    const response = await apiClient.get<SearchServicesResponse>(
      `/api/services/search?${params.toString()}`
    );
    return response.data;
  },

  createService: async (payload: CreateServicePayload): Promise<CreateServiceResponse> => {
    const response = await apiClient.post<CreateServiceResponse>('/api/services', payload);
    return response.data;
  },

  createServiceWithFiles: async (formData: FormData): Promise<CreateServiceResponse> => {
    const response = await apiClient.post<CreateServiceResponse>('/api/services', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getServiceById: async (serviceId: string): Promise<GetServiceByIdResponse> => {
    const response = await apiClient.get<GetServiceByIdResponse>(`/api/services/${serviceId}`);
    return response.data;
  }
};
