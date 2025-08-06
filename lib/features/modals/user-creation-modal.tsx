import { createSlice } from "@reduxjs/toolkit";

export interface UserModalState {
  isUserModalOpen: boolean;
}

const initialState: UserModalState = {
  isUserModalOpen: false,
};

const userModalSlice = createSlice({
  name: "userModal",
  initialState,
  reducers: {
    toggleUserModal: (state) => {
      state.isUserModalOpen = !state.isUserModalOpen;
    },
  },
});

export const { toggleUserModal } = userModalSlice.actions;
export default userModalSlice.reducer;
