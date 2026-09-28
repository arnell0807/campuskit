import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type EquipmentFilterPayload = {
  key: "search" | "category" | "status";
  value: string;
};

type ToastPayload = {
  message: string;
};

type UIState = {
  equipmentFilters: {
    search: string;
    category: string;
    status: string;
  };
  studentSearch: string;
  checkoutView: "active" | "history";
  toast: {
    id: number;
    message: string;
  } | null;
};

const initialState: UIState = {
  equipmentFilters: {
    search: "",
    category: "all",
    status: "all",
  },
  studentSearch: "",
  checkoutView: "active",
  toast: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setEquipmentFilter(state, action: PayloadAction<EquipmentFilterPayload>) {
      const { key, value } = action.payload;
      state.equipmentFilters[key] = value;
    },

    clearEquipmentFilters(state) {
      state.equipmentFilters = initialState.equipmentFilters;
    },

    setStudentSearch(state, action: PayloadAction<string>) {
      state.studentSearch = action.payload;
    },

    setCheckoutView(state, action: PayloadAction<"active" | "history">) {
      state.checkoutView = action.payload;
    },

    showToast(state, action: PayloadAction<ToastPayload>) {
      state.toast = {
        id: Date.now(),
        message: action.payload.message,
      };
    },

    clearToast(state) {
      state.toast = null;
    },
  },
});

export const {
  setEquipmentFilter,
  clearEquipmentFilters,
  setStudentSearch,
  setCheckoutView,
  showToast,
  clearToast,
} = uiSlice.actions;

export default uiSlice.reducer;
