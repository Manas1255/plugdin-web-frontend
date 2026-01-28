import { apiClient } from './apiClient';
import type {
  BookingRequestPayload,
  BookingRequestResponse,
  CompletePaymentMethodPayload,
  CompletePaymentMethodResponse,
} from '../types';

export const bookingRequestsService = {
  createBookingRequest: async (
    payload: BookingRequestPayload
  ): Promise<BookingRequestResponse> => {
    const response = await apiClient.post<BookingRequestResponse>(
      '/api/booking-requests',
      payload
    );
    return response.data;
  },

  completePaymentMethod: async (
    bookingRequestId: string,
    payload: CompletePaymentMethodPayload
  ): Promise<CompletePaymentMethodResponse> => {
    const response = await apiClient.post<CompletePaymentMethodResponse>(
      `/api/booking-requests/${bookingRequestId}/complete-payment-method`,
      payload
    );
    return response.data;
  },
};
