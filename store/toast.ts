import { create } from "zustand";

interface ToastStore {
	isToastVisible: boolean;
	showToast: () => void;
}

export const useToastStore = create<ToastStore>(set => ({
	isToastVisible: false,
	showToast: () => {
		set({ isToastVisible: true });
		setTimeout(() => set({ isToastVisible: false }), 2000);
	},
}));
