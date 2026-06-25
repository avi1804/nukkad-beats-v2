import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Studio {
  id: string;
  name: string;
  price: number;
}

export interface BookingData {
  date: string;
  duration: number;
  guests: string;
  name: string;
  phone: string;
  slot: string | null;
  notes: string;
}

interface BookingState {
  isBookingModalOpen: boolean;
  selectedStudio: Studio | null;
  bookingData: BookingData;
  activeBookingId: string | null;
  openBookingModal: (studio?: Studio) => void;
  closeBookingModal: () => void;
  setBookingData: (data: Partial<BookingData>) => void;
  resetBookingData: () => void;
  setActiveBookingId: (id: string | null) => void;
}

const defaultBookingData: BookingData = {
  date: new Date().toISOString().split('T')[0],
  duration: 1,
  guests: "5 - 10 Guests",
  name: "",
  phone: "",
  slot: null,
  notes: "",
};

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      isBookingModalOpen: false,
      selectedStudio: null,
      activeBookingId: null,
      bookingData: { ...defaultBookingData },

      openBookingModal: (studio) => set({ 
        isBookingModalOpen: true, 
        selectedStudio: studio || null 
      }),
      
      closeBookingModal: () => set({ 
        isBookingModalOpen: false 
      }),
      
      setBookingData: (data) => set((state) => ({ 
        bookingData: { ...state.bookingData, ...data } 
      })),

      resetBookingData: () => set({ 
        bookingData: { ...defaultBookingData },
        activeBookingId: null
      }),

      setActiveBookingId: (id) => set({
        activeBookingId: id
      })
    }),
    {
      name: "nukkad-booking-storage",
      partialize: (state) => ({ activeBookingId: state.activeBookingId }),
    }
  )
);
