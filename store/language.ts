import { create } from 'zustand';

interface LanguageStore {
  language: string;
  setLanguage: (newLanguage?: string) => void; // 선택적 인자 추가
}

export const useLanguageStore = create<LanguageStore>((set, get) => ({
  language: 'kr',
  setLanguage: (newLanguage?: string) => {
    const currentLanguage = get().language;

    set({
      language: newLanguage ? newLanguage : currentLanguage === 'en' ? 'kr' : 'en',
    });
  },
}));
