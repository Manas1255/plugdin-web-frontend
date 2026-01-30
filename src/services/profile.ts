import { apiClient } from './apiClient';
import type { User } from '../types';

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  bio?: string;
  profilePicture?: File | null;
}

export interface UpdateProfileResponse {
  statusCode: number;
  data: User;
  error: null | { timestamp: string; message: string; stacktrace: string | null };
}

const PROFILE_PICTURE_MAX_SIZE_MB = 20;
const PROFILE_PICTURE_ACCEPT = '.jpg,.jpeg,.png,.webp';

export const profileService = {
  updateProfile: async (payload: UpdateProfilePayload): Promise<User> => {
    const formData = new FormData();
    if (payload.firstName !== undefined) formData.append('firstName', payload.firstName);
    if (payload.lastName !== undefined) formData.append('lastName', payload.lastName);
    if (payload.bio !== undefined) formData.append('bio', payload.bio);
    if (payload.profilePicture instanceof File) {
      formData.append('profilePicture', payload.profilePicture);
    }

    const response = await apiClient.put<UpdateProfileResponse>('/api/profile', formData);
    return response.data.data;
  },

  profilePictureAccept: PROFILE_PICTURE_ACCEPT,
  profilePictureMaxSizeBytes: PROFILE_PICTURE_MAX_SIZE_MB * 1024 * 1024,
};
