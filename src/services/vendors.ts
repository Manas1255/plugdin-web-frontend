import { apiClient } from './apiClient';
import type { VendorsResponse } from '../types';

export interface GetVendorsParams {
  page?: number;
  limit?: number;
}

export const vendorsService = {
  getVendors: async (params?: GetVendorsParams): Promise<VendorsResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.page != null) searchParams.set('page', params.page.toString());
    if (params?.limit != null) searchParams.set('limit', params.limit.toString());
    const query = searchParams.toString();
    const url = query ? `/api/vendors?${query}` : '/api/vendors';
    const response = await apiClient.get<VendorsResponse>(url);
    return response.data;
  },
};
