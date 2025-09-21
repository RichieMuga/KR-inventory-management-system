// store/slices/uniqueAssetsModalSlice.ts

import { createSlice } from "@reduxjs/toolkit";

export interface UniqueAssetsModalState {
  isViewModalOpen: boolean;
  isEditModalOpen: boolean;
  isMoveModalOpen: boolean;
  isAssignModalOpen: boolean;
  isDeleteModalOpen: boolean;
}

const initialState: UniqueAssetsModalState = {
  isViewModalOpen: false,
  isEditModalOpen: false,
  isMoveModalOpen: false,
  isAssignModalOpen: false,
  isDeleteModalOpen: false,
};

const uniqueAssetsModalSlice = createSlice({
  name: "uniqueAssetsModal",
  initialState,
  reducers: {
    toggleViewModal: (state) => {
      state.isViewModalOpen = !state.isViewModalOpen;
    },
    toggleEditModal: (state) => {
      state.isEditModalOpen = !state.isEditModalOpen;
    },
    toggleMoveModal: (state) => {
      state.isMoveModalOpen = !state.isMoveModalOpen;
    },
    toggleAssignModal: (state) => {
      state.isAssignModalOpen = !state.isAssignModalOpen;
    },
    toggleDeleteModal: (state) => {
      state.isDeleteModalOpen = !state.isDeleteModalOpen;
    },
  },
});

export const {
  toggleViewModal,
  toggleEditModal,
  toggleMoveModal,
  toggleAssignModal,
  toggleDeleteModal,
} = uniqueAssetsModalSlice.actions;

export default uniqueAssetsModalSlice.reducer;