import type { AddServiceDraft } from '../types';
import type { CreateServicePayload } from '../services/services';
import type { City } from '../types';

export const mapDraftToCreateServicePayload = (
  draft: AddServiceDraft,
  cities: City[]
): CreateServicePayload => {
  // Convert city IDs to city names
  const cityNames = draft.selectedCityIds.map(cityId => {
    const city = cities.find(c => c.id === cityId);
    return city ? city.name : '';
  }).filter(name => name !== '');

  // Serialize weekly schedule if exists
  let weeklyScheduleSerialized: string[] | undefined;
  if (draft.availability && draft.availability.weeklySchedule) {
    weeklyScheduleSerialized = draft.availability.weeklySchedule.map(daySchedule => {
      const slotsStr = daySchedule.slots
        .map(slot => `${slot.start}-${slot.end}`)
        .join(',');
      return `${daySchedule.day}:${slotsStr}`;
    }).filter(str => str.includes(':') && str.split(':')[1]); // Only include days with slots
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
  if (draft.availability && weeklyScheduleSerialized && weeklyScheduleSerialized.length > 0) {
    payload.availability = {
      timezone: draft.availability.timezone,
      weeklySchedule: weeklyScheduleSerialized,
    };
  }

  // Add photos
  if (draft.uploadedPhotoUrls.length > 0) {
    payload.photos = draft.uploadedPhotoUrls;
  }

  return payload;
};
