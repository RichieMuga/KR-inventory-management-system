import { createSlice } from "@reduxjs/toolkit";

export interface AssignmentModalState {
  isUniqueAssignmentModalOpen: boolean;
  isBulkAssignmentModalOpen: boolean;
}

const initialState: AssignmentModalState = {
  isUniqueAssignmentModalOpen: false,
  isBulkAssignmentModalOpen: false
};

const assignmentModalSlice = createSlice({
  name: "assignmentModal",
  initialState,
  reducers: {
    toggleUniqueAssignmentModal: (state) => {
      state.isUniqueAssignmentModalOpen = !state.isUniqueAssignmentModalOpen;
    },
    toggleBulkAssignmentModal: (state) => {
      state.isBulkAssignmentModalOpen = !state.isBulkAssignmentModalOpen;
    },
  },
});

export const { toggleUniqueAssignmentModal, toggleBulkAssignmentModal } = assignmentModalSlice.actions;
export default assignmentModalSlice.reducer;