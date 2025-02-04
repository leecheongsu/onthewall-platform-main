import { create } from 'zustand';

interface MobileViewStore {
  mobileView: boolean;
  setMobileView: () => void;
}

export const useMobileViewStore = create<MobileViewStore>((set) => ({
  mobileView: false,
  setMobileView: () => {
    set((state) => ({ mobileView: !state.mobileView }));
  },
}));
