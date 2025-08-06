import { createSlice } from "@reduxjs/toolkit";

export interface LocationModalState {
  isLocationModalOpen: boolean;
}

const initialState: LocationModalState = {
  isLocationModalOpen: false,
};

const locationModalSlice = createSlice({
  name: "locationModal",
  initialState,
  reducers: {
    toggleLocationModal: (state) => {
      state.isLocationModalOpen = !state.isLocationModalOpen;
    },
  },
});

export const { toggleLocationModal } = locationModalSlice.actions;
export default locationModalSlice.reducer;
