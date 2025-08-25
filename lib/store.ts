import { configureStore } from "@reduxjs/toolkit";

import assetModalSlice from "@/lib/features/modals/asset-modal-buttons";
import userModalSlice from "@/lib/features/modals/user-creation-modal";
import locationModalSlice from "@/lib/features/modals/location-modal";
import paginationSlice from "@/lib/features/pagination/paginationSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      // modals
      assetModal: assetModalSlice,
      userModal: userModalSlice,
      locationModal: locationModalSlice,
      // pagination
      pagination: paginationSlice,
    },
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
