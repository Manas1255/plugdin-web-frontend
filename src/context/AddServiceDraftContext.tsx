import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AddServiceDraft } from '../types';

interface AddServiceDraftContextType {
  draft: AddServiceDraft;
  updateDraft: (updates: Partial<AddServiceDraft>) => void;
  clearDraft: () => void;
  isDetailsComplete: () => boolean;
  isPricingComplete: () => boolean;
  isAvailabilityComplete: () => boolean;
}

const initialDraft: AddServiceDraft = {
  listingType: null,
  categoryId: null,
  categorySlug: null,
  categoryName: null,
  title: '',
  description: '',
  selectedSpecifications: [],
  selectedCityIds: [],
  pricePerHour: null,
  bookingStartInterval: 'every_hour',
  pricingOptions: [],
  availability: null,
  photos: [],
  uploadedPhotoUrls: [],
};

const STORAGE_KEY = 'addServiceDraft';

const AddServiceDraftContext = createContext<AddServiceDraftContextType | undefined>(undefined);

export const AddServiceDraftProvider = ({ children }: { children: ReactNode }) => {
  const [draft, setDraft] = useState<AddServiceDraft>(() => {
    // Load from localStorage on mount
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Don't restore File objects, only the metadata
        return { ...parsed, photos: [] };
      } catch {
        return initialDraft;
      }
    }
    return initialDraft;
  });

  useEffect(() => {
    // Save to localStorage whenever draft changes
    // Exclude File objects from storage
    const { photos, ...storableData } = draft;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storableData));
  }, [draft]);

  const updateDraft = (updates: Partial<AddServiceDraft>) => {
    setDraft((prev) => ({ ...prev, ...updates }));
  };

  const clearDraft = () => {
    setDraft(initialDraft);
    localStorage.removeItem(STORAGE_KEY);
  };

  const isDetailsComplete = () => {
    return !!(
      draft.listingType &&
      draft.categoryId &&
      draft.title.trim() &&
      draft.description.trim() &&
      draft.selectedCityIds.length > 0
    );
  };

  const isPricingComplete = () => {
    if (draft.listingType === 'hourly') {
      return draft.pricePerHour !== null && draft.pricePerHour > 0;
    } else if (draft.listingType === 'fixed') {
      return draft.pricingOptions.length > 0 && 
             draft.pricingOptions.every(opt => 
               opt.name.trim() && 
               opt.pricePerSession > 0 && 
               (opt.sessionLength.hours > 0 || opt.sessionLength.minutes > 0)
             );
    }
    return false;
  };

  const isAvailabilityComplete = () => {
    // Availability is optional, so we return true if it's set OR if user wants to skip
    // For now, we'll consider it complete if there's at least some schedule
    if (!draft.availability) return false;
    return draft.availability.weeklySchedule.some(day => day.slots.length > 0);
  };

  return (
    <AddServiceDraftContext.Provider
      value={{
        draft,
        updateDraft,
        clearDraft,
        isDetailsComplete,
        isPricingComplete,
        isAvailabilityComplete,
      }}
    >
      {children}
    </AddServiceDraftContext.Provider>
  );
};

export const useAddServiceDraft = () => {
  const context = useContext(AddServiceDraftContext);
  if (!context) {
    throw new Error('useAddServiceDraft must be used within AddServiceDraftProvider');
  }
  return context;
};
