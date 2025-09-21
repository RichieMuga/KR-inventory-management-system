import { createSlice } from "@reduxjs/toolkit";

export interface BulkAssetsModalState {
  isViewModalOpen: boolean;
  isEditModalOpen: boolean;
  isDeleteModalOpen: boolean;
}

const initialState: BulkAssetsModalState = {
  isViewModalOpen: false,
  isEditModalOpen: false,
  isDeleteModalOpen: false,
};

const bulkAssetsModalSlice = createSlice({
  name: "bulkAssetsModal",
  initialState,
  reducers: {
    toggleViewModal: (state) => {
      state.isViewModalOpen = !state.isViewModalOpen;
    },
    toggleEditModal: (state) => {
      state.isEditModalOpen = !state.isEditModalOpen;
    },
    toggleDeleteModal: (state) => {
      state.isDeleteModalOpen = !state.isDeleteModalOpen;
    },
  },
});

export const {
  toggleViewModal,
  toggleEditModal,
  toggleDeleteModal,
} = bulkAssetsModalSlice.actions;

export default bulkAssetsModalSlice.reducer;