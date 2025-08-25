import { useDispatch, useSelector } from "react-redux";
import { useCallback, useState } from "react";
import {
  setCurrentPage,
  setSearchQuery,
  selectSectionPagination,
  selectSectionQueryParams,
} from "@/lib/features/pagination/paginationSlice";
import { RootState } from "@/lib/store";

type PaginationSection = "locations" | "assets" | "users";

export const usePagination = (section: PaginationSection) => {
  const dispatch = useDispatch();
  const [searchInput, setSearchInput] = useState("");

  const paginationState = useSelector((state: RootState) =>
    selectSectionPagination(state, section),
  );

  const queryParams = useSelector((state: RootState) =>
    selectSectionQueryParams(state, section),
  );

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

  const clearSearch = useCallback(() => {
    setSearchInput("");
    dispatch(setSearchQuery({ section, query: "" }));
  }, [dispatch, section]);

  const handleSearchKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        search();
      }
    },
    [search],
  );

  return {
    // State
    paginationState,
    queryParams,
    searchInput,
    setSearchInput,

    // Actions
    setPage,
    search,
    clearSearch,
    handleSearchKeyPress,

    // Quick access
    currentPage: paginationState.currentPage,
    searchQuery: paginationState.searchQuery,
  };
};
