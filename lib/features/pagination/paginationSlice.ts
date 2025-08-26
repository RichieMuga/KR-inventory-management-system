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

interface SetItemsPerPagePayload {
  section: keyof PaginationSliceState;
  itemsPerPage: number;
}

interface SetFiltersPayload {
  section: keyof PaginationSliceState;
  filters: Record<string, any>;
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
        // Only reset to page 1 if we're not already on page 1
        // This prevents unnecessary re-renders
        if (state[section].currentPage !== 1) {
          state[section].currentPage = 1;
        }
      }
    },

    setItemsPerPage: (state, action: PayloadAction<SetItemsPerPagePayload>) => {
      const { section, itemsPerPage } = action.payload;
      if (state[section]) {
        state[section].itemsPerPage = itemsPerPage;
        // Reset to page 1 when changing items per page
        state[section].currentPage = 1;
      }
    },

    setFilters: (state, action: PayloadAction<SetFiltersPayload>) => {
      const { section, filters } = action.payload;
      if (state[section]) {
        state[section].filters = filters;
        // Reset to page 1 when filters change
        state[section].currentPage = 1;
      }
    },

    clearSearch: (
      state,
      action: PayloadAction<{ section: keyof PaginationSliceState }>,
    ) => {
      const { section } = action.payload;
      if (state[section]) {
        state[section].searchQuery = "";
        state[section].currentPage = 1;
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

    resetAllSections: (state) => {
      Object.keys(state).forEach((section) => {
        state[section as keyof PaginationSliceState] = {
          ...initialPaginationState,
        };
      });
    },
  },
});

export const {
  setCurrentPage,
  setSearchQuery,
  setItemsPerPage,
  setFilters,
  clearSearch,
  resetSection,
  resetAllSections,
} = paginationSlice.actions;

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
  const params: Record<string, any> = {
    page: sectionState.currentPage,
    limit: sectionState.itemsPerPage,
  };

  // Only include search parameter if it has a value and is not empty
  if (sectionState.searchQuery && sectionState.searchQuery.trim() !== "") {
    params.search = sectionState.searchQuery.trim();
  }

  // Include filters if they exist and are not empty
  if (sectionState.filters && Object.keys(sectionState.filters).length > 0) {
    // Flatten filters into query params or keep as nested object based on your API needs
    Object.entries(sectionState.filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params[key] = value;
      }
    });
  }

  return params;
};

// Additional useful selectors
export const selectHasActiveSearch = (
  state: { pagination: PaginationSliceState },
  section: keyof PaginationSliceState,
): boolean => {
  const sectionState = state.pagination[section];
  return !!(
    sectionState.searchQuery && sectionState.searchQuery.trim().length > 0
  );
};

export const selectHasActiveFilters = (
  state: { pagination: PaginationSliceState },
  section: keyof PaginationSliceState,
): boolean => {
  const sectionState = state.pagination[section];
  return !!(
    sectionState.filters && Object.keys(sectionState.filters).length > 0
  );
};

export const selectTotalActiveFilters = (
  state: { pagination: PaginationSliceState },
  section: keyof PaginationSliceState,
): number => {
  const sectionState = state.pagination[section];
  let count = 0;

  if (sectionState.searchQuery && sectionState.searchQuery.trim()) {
    count++;
  }

  if (sectionState.filters) {
    count += Object.keys(sectionState.filters).filter((key) => {
      const value = sectionState.filters![key];
      return value !== undefined && value !== null && value !== "";
    }).length;
  }

  return count;
};

export default paginationSlice.reducer;
