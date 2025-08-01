import { createSlice } from "@reduxjs/toolkit";

export interface AssetModalState {
  isBulkAssetModalOpen: boolean;
  isUniqueAssetModalOpen: boolean;
}

const initialState: AssetModalState = {
  isBulkAssetModalOpen: false,
  isUniqueAssetModalOpen: false,
};

const assetModalSlice = createSlice({
  name: "assetModal",
  initialState,
  reducers: {
    toggleBulkModal: (state) => {
      state.isBulkAssetModalOpen = !state.isBulkAssetModalOpen;
    },
    toggleUniqueModal: (state) => {
      state.isUniqueAssetModalOpen = !state.isUniqueAssetModalOpen;
    },
  },
});

export const { toggleBulkModal, toggleUniqueModal } = assetModalSlice.actions;
export default assetModalSlice.reducer;
