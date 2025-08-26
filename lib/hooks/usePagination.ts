import { useDispatch, useSelector } from "react-redux";
import { useCallback, useState, useEffect } from "react";
import {
  setCurrentPage,
  setSearchQuery,
  clearSearch,
  selectSectionPagination,
  selectSectionQueryParams,
  selectHasActiveSearch,
} from "@/lib/features/pagination/paginationSlice";
import { RootState } from "@/lib/store";

type PaginationSection = "locations" | "assets" | "users";

export const usePagination = (section: PaginationSection) => {
  const dispatch = useDispatch();

  const paginationState = useSelector((state: RootState) =>
    selectSectionPagination(state, section),
  );

  const queryParams = useSelector((state: RootState) =>
    selectSectionQueryParams(state, section),
  );

  const hasActiveSearch = useSelector((state: RootState) =>
    selectHasActiveSearch(state, section),
  );

  // Initialize searchInput with the current searchQuery from Redux
  const [searchInput, setSearchInput] = useState(
    paginationState.searchQuery || "",
  );

  // Sync searchInput with Redux state when searchQuery changes
  // This handles cases like clearing search from other components
  useEffect(() => {
    setSearchInput(paginationState.searchQuery || "");
  }, [paginationState.searchQuery]);

  const setPage = useCallback(
    (page: number) => {
      dispatch(setCurrentPage({ section, page }));
    },
    [dispatch, section],
  );

  const search = useCallback(
    (query?: string) => {
      const searchQuery = query !== undefined ? query : searchInput.trim();
      dispatch(setSearchQuery({ section, query: searchQuery }));
    },
    [dispatch, section, searchInput],
  );

  const clearSearchAction = useCallback(() => {
    setSearchInput("");
    dispatch(clearSearch({ section }));
  }, [dispatch, section]);

  const handleSearchKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault(); // Prevent form submission if inside a form
        search();
      }
    },
    [search],
  );

  // Enhanced setSearchInput that provides immediate UI feedback
  const handleSetSearchInput = useCallback((value: string) => {
    setSearchInput(value);
  }, []);

  return {
    // State
    paginationState,
    queryParams,
    searchInput,
    setSearchInput: handleSetSearchInput,
    hasActiveSearch,

    // Actions
    setPage,
    search,
    clearSearch: clearSearchAction,
    handleSearchKeyPress,

    // Quick access (for backward compatibility)
    currentPage: paginationState.currentPage,
    searchQuery: paginationState.searchQuery,
    itemsPerPage: paginationState.itemsPerPage,
  };
};
