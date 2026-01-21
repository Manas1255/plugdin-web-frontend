import { apiClient } from './apiClient';

export interface VendorApplicationPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  companyName: string;
  bio: string;
  serviceType: string;
  typicalResponseTimeToInquiries: string;
  bookingAdvanceAndComfortWithWindow: string;
  hasBackupEquipment: boolean;
  hasStandardServiceAgreement: boolean;
  instagramHandle?: string;
  websiteOrPortfolioLink?: string;
  additionalBusinessNotes?: string;
}

export interface VendorApplicationResponse {
  statusCode: number;
  data: {
    message: string;
    [key: string]: any;
  };
  error: null | {
    timestamp: string;
    message: string;
    stacktrace?: string;
  };
}

export const vendorApplicationsService = {
  applyAsVendor: async (payload: VendorApplicationPayload) => {
    const response = await apiClient.post<VendorApplicationResponse>(
      '/api/vendor-applications',
      payload
    );
    return response.data;
  },
};
