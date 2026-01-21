// User & Auth Types
export type UserRole = 'client' | 'vendor';

export interface User {
  role: UserRole;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture: string | null;
  bio: string | null;
}

export interface AuthResponse {
  statusCode: number;
  data: User & { token?: string };
  error: {
    timestamp: string;
    message: string;
    stacktrace: string | null;
  } | null;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  packageSpecifications: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoriesResponse {
  statusCode: number;
  data: {
    count: number;
    categories: Category[];
  };
  error: null | { timestamp: string; message: string; stacktrace: string | null };
}

// City Types
export interface City {
  id: string;
  name: string;
  province: string;
  country: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CitiesResponse {
  statusCode: number;
  data: {
    count: number;
    cities: City[];
  };
  error: null | { timestamp: string; message: string; stacktrace: string | null };
}

// Package Specifications
export interface PackageSpecificationsResponse {
  statusCode: number;
  data: {
    category: string;
    slug: string;
    packageSpecifications: string[];
  };
  error: null | { timestamp: string; message: string; stacktrace: string | null };
}

// Service Types
export type ListingType = 'hourly' | 'fixed';

export interface PricingOption {
  name: string;
  pricePerSession: number;
  sessionLength: {
    hours: number;
    minutes: number;
  };
}

export interface TimeSlot {
  start: string; // HH:mm format
  end: string;
}

export interface DaySchedule {
  day: 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
  slots: TimeSlot[];
}

export interface Availability {
  timezone: string;
  weeklySchedule: DaySchedule[];
}

export interface PhotoFile {
  file: File;
  previewUrl: string;
}

export interface Service {
  id: string;
  listingType: ListingType;
  category: string;
  listingTitle: string;
  listingDescription: string;
  packageSpecifications: string[];
  servicingArea: string[];
  pricePerHour?: number;
  bookingStartInterval?: string;
  pricingOptions?: PricingOption[];
  availability?: Availability;
  photos: string[];
  vendor: {
    firstName: string;
    lastName: string;
    email: string;
    profilePicture: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SearchServicesResponse {
  statusCode: number;
  data: {
    services: Service[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
  error: null | { timestamp: string; message: string; stacktrace: string | null };
}

export interface CreateServiceResponse {
  statusCode: number;
  data: Service;
  error: null | { timestamp: string; message: string; stacktrace: string | null };
}

// Draft Types for Add Service Flow
export interface AddServiceDraft {
  // Details Step
  listingType: ListingType | null;
  categoryId: string | null;
  categorySlug: string | null;
  categoryName: string | null;
  title: string;
  description: string;
  selectedSpecifications: string[];
  selectedCityIds: string[];
  
  // Pricing Step
  pricePerHour: number | null;
  bookingStartInterval: 'every_hour' | 'every_30_minutes' | 'every_15_minutes';
  pricingOptions: PricingOption[];
  
  // Availability Step
  availability: Availability | null;
  
  // Photos Step
  photos: PhotoFile[];
  uploadedPhotoUrls: string[];
}
