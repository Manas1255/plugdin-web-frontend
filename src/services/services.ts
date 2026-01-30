import { apiClient } from './apiClient';
import type {
  CategoriesResponse,
  CitiesResponse,
  PackageSpecificationsResponse,
  SearchServicesResponse,
  CreateServiceResponse,
  GetServiceByIdResponse,
  VendorServicesResponse,
} from '../types';

export interface SearchServicesPayload {
  category?: string | null;
  listingType?: string | null;
  minPrice?: number;
  maxPrice?: number;
  startDate?: string; // ISO date YYYY-MM-DD
  endDate?: string;   // ISO date YYYY-MM-DD
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
    if (payload.minPrice != null && !Number.isNaN(payload.minPrice))
      params.append('minPrice', payload.minPrice.toString());
    if (payload.maxPrice != null && !Number.isNaN(payload.maxPrice))
      params.append('maxPrice', payload.maxPrice.toString());
    if (payload.startDate) params.append('startDate', payload.startDate);
    if (payload.endDate) params.append('endDate', payload.endDate);
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
    // When sending FormData, axios will automatically set Content-Type with boundary
    // The apiClient interceptor handles removing the default Content-Type header
    const response = await apiClient.post<CreateServiceResponse>('/api/services', formData);
    return response.data;
  },

  getServiceById: async (serviceId: string): Promise<GetServiceByIdResponse> => {
    const response = await apiClient.get<GetServiceByIdResponse>(`/api/services/${serviceId}`);
    return response.data;
  },

  /** Get all services for a vendor by ID (paginated). Do not pass status. */
  getServicesByVendorId: async (
    vendorId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<VendorServicesResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    const response = await apiClient.post<VendorServicesResponse>(
      `/api/services/vendor/services?${params.toString()}`,
      { vendorId }
    );
    return response.data;
  },
};
