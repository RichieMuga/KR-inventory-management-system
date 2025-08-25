import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  searchQuery?: string;
  filters?: Record<string, any>;
}

interface PaginationSliceState {
  locations: PaginationState;
  assets: PaginationState;
  users: PaginationState;
}

const initialPaginationState: PaginationState = {
  currentPage: 1,
  itemsPerPage: 10,
  searchQuery: "",
  filters: {},
};

const initialState: PaginationSliceState = {
  locations: { ...initialPaginationState },
  assets: { ...initialPaginationState },
  users: { ...initialPaginationState },
};

interface SetPagePayload {
  section: keyof PaginationSliceState;
  page: number;
}

interface SetSearchQueryPayload {
  section: keyof PaginationSliceState;
  query: string;
}

const paginationSlice = createSlice({
  name: "pagination",
  initialState,
  reducers: {
    setCurrentPage: (state, action: PayloadAction<SetPagePayload>) => {
      const { section, page } = action.payload;
      if (state[section]) {
        state[section].currentPage = page;
      }
    },

    setSearchQuery: (state, action: PayloadAction<SetSearchQueryPayload>) => {
      const { section, query } = action.payload;
      if (state[section]) {
        state[section].searchQuery = query;
        state[section].currentPage = 1; // Reset to first page when searching
      }
    },

    resetSection: (
      state,
      action: PayloadAction<{ section: keyof PaginationSliceState }>,
    ) => {
      const { section } = action.payload;
      if (state[section]) {
        state[section] = { ...initialPaginationState };
      }
    },
  },
});

export const { setCurrentPage, setSearchQuery, resetSection } =
  paginationSlice.actions;

// Selectors
export const selectSectionPagination = (
  state: { pagination: PaginationSliceState },
  section: keyof PaginationSliceState,
) => state.pagination[section];

export const selectSectionQueryParams = (
  state: { pagination: PaginationSliceState },
  section: keyof PaginationSliceState,
) => {
  const sectionState = state.pagination[section];
  return {
    page: sectionState.currentPage,
    limit: sectionState.itemsPerPage,
    search: sectionState.searchQuery || undefined,
  };
};

export default paginationSlice.reducer;
