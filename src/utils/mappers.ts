import type { AddServiceDraft, City, Service, GetServiceByIdResponse, DaySchedule } from '../types';
import type { CreateServicePayload, CreateServiceAvailability } from '../services/services';

export const mapDraftToCreateServicePayload = (
  draft: AddServiceDraft,
  cities: City[]
): CreateServicePayload => {
  // Convert city IDs to city names
  const cityNames = draft.selectedCityIds.map(cityId => {
    const city = cities.find(c => c.id === cityId);
    return city ? city.name : '';
  }).filter(name => name !== '');

  // Build API-style weekly schedule: { dayOfWeek, isAvailable, timeSlots: [{ startTime, endTime }] }
  let weeklyScheduleApi: CreateServiceAvailability['weeklySchedule'] | undefined;
  if (draft.availability && draft.availability.weeklySchedule) {
    weeklyScheduleApi = draft.availability.weeklySchedule
      .filter(daySchedule => daySchedule.slots.length > 0)
      .map(daySchedule => ({
        dayOfWeek: daySchedule.day,
        isAvailable: true,
        timeSlots: daySchedule.slots.map(slot => ({
          startTime: slot.start,
          endTime: slot.end,
        })),
      }));
  }

  const payload: CreateServicePayload = {
    listingType: draft.listingType!,
    category: draft.categoryName!,
    listingTitle: draft.title,
    listingDescription: draft.description,
    packageSpecifications: draft.selectedSpecifications,
    servicingArea: cityNames,
  };

  // Add pricing fields
  if (draft.listingType === 'hourly') {
    payload.pricePerHour = draft.pricePerHour!;
    payload.bookingStartInterval = draft.bookingStartInterval;
  }
  
  if (draft.pricingOptions.length > 0) {
    payload.pricingOptions = draft.pricingOptions;
  }

  // Add availability
  if (draft.availability && weeklyScheduleApi && weeklyScheduleApi.length > 0) {
    payload.availability = {
      timezone: draft.availability.timezone,
      weeklySchedule: weeklyScheduleApi,
    };
  }

  // Add photos
  if (draft.uploadedPhotoUrls.length > 0) {
    payload.photos = draft.uploadedPhotoUrls;
  }

  return payload;
};

/**
 * Converts draft data to FormData for multipart/form-data request
 * Complex fields (availability, pricingOptions, servicingArea, packageSpecifications) are sent as JSON strings
 * Photos are sent as File objects under the field name 'photos'
 */
export const mapDraftToFormData = (
  draft: AddServiceDraft,
  cities: City[]
): FormData => {
  const formData = new FormData();

  // Simple string fields
  formData.append('listingType', draft.listingType!);
  formData.append('category', draft.categoryName!);
  formData.append('listingTitle', draft.title);
  formData.append('listingDescription', draft.description);

  // Convert city IDs to city names
  const cityNames = draft.selectedCityIds.map(cityId => {
    const city = cities.find(c => c.id === cityId);
    return city ? city.name : '';
  }).filter(name => name !== '');

  // Complex fields as JSON strings
  formData.append('servicingArea', JSON.stringify(cityNames));
  formData.append('packageSpecifications', JSON.stringify(draft.selectedSpecifications));

  // Pricing fields
  if (draft.listingType === 'hourly') {
    if (draft.pricePerHour !== null) {
      formData.append('pricePerHour', draft.pricePerHour.toString());
    }
    if (draft.bookingStartInterval) {
      formData.append('bookingStartInterval', draft.bookingStartInterval);
    }
  }

  if (draft.pricingOptions.length > 0) {
    formData.append('pricingOptions', JSON.stringify(draft.pricingOptions));
  }

  // Availability as JSON string
  if (draft.availability && draft.availability.weeklySchedule) {
    const weeklyScheduleApi = draft.availability.weeklySchedule
      .filter(daySchedule => daySchedule.slots.length > 0)
      .map(daySchedule => ({
        dayOfWeek: daySchedule.day,
        isAvailable: true,
        timeSlots: daySchedule.slots.map(slot => ({
          startTime: slot.start,
          endTime: slot.end,
        })),
      }));

    if (weeklyScheduleApi.length > 0) {
      const availabilityData = {
        timezone: draft.availability.timezone,
        weeklySchedule: weeklyScheduleApi,
      };
      formData.append('availability', JSON.stringify(availabilityData));
    }
  }

  // Photos as File objects - required field
  if (draft.photos && draft.photos.length > 0) {
    draft.photos.forEach((photo) => {
      formData.append('photos', photo.file);
    });
  }

  return formData;
};

/**
 * Maps API response from getServiceById to frontend Service type
 * Transforms availability format from API (dayOfWeek, timeSlots) to frontend format (day, slots)
 */
export const mapApiServiceToService = (apiResponse: GetServiceByIdResponse): Service => {
  const apiService = apiResponse.data.service;
  
  // Transform availability if present
  let availability: Service['availability'] | undefined;
  if (apiService.availability) {
    availability = {
      timezone: apiService.availability.timezone,
      weeklySchedule: apiService.availability.weeklySchedule
        .filter(day => day.isAvailable && day.timeSlots.length > 0)
        .map(day => ({
          day: day.dayOfWeek as DaySchedule['day'],
          slots: day.timeSlots.map(slot => ({
            start: slot.startTime,
            end: slot.endTime,
          })),
        })),
    };
  }

  return {
    id: apiService.id,
    listingType: apiService.listingType,
    category: apiService.category,
    listingTitle: apiService.listingTitle,
    listingDescription: apiService.listingDescription,
    packageSpecifications: apiService.packageSpecifications,
    servicingArea: apiService.servicingArea,
    pricePerHour: apiService.pricePerHour,
    bookingStartInterval: apiService.bookingStartInterval,
    pricingOptions: apiService.pricingOptions,
    availability,
    photos: apiService.photos || [],
    vendor: {
      id: apiService.vendor.id,
      firstName: apiService.vendor.firstName,
      lastName: apiService.vendor.lastName,
      email: apiService.vendor.email,
      profilePicture: apiService.vendor.profilePicture,
    },
    status: apiService.status,
    isDeleted: apiService.isDeleted,
    createdAt: apiService.createdAt,
    updatedAt: apiService.updatedAt,
  };
};
