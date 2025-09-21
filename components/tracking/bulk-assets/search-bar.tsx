"use client";
import { useForm } from "react-hook-form";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";
interface SearchForm {
  searchTerm: string;
}
interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onSearch?: (term: string) => void;
  placeholder?: string;
}
export default function SearchBar({
  searchTerm,
  setSearchTerm,
  onSearch,
  placeholder = "Search assets by name, model, or keeper..."
}: SearchBarProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { isSubmitting }
  } = useForm<SearchForm>({
    defaultValues: {
      searchTerm: searchTerm || ""
    }
  });
  const watchedSearchTerm = watch("searchTerm");
  // Only update parent state when the watched term changes
  useEffect(() => {
    if (watchedSearchTerm !== searchTerm) {
      setSearchTerm(watchedSearchTerm);
    }
  }, [watchedSearchTerm]); // Remove setSearchTerm and searchTerm from dependencies
  // Separate effect for search debouncing
  useEffect(() => {
    if (!onSearch) return;
   
    const timeoutId = setTimeout(() => {
      onSearch(watchedSearchTerm);
    }, 500);
   
    return () => clearTimeout(timeoutId);
  }, [watchedSearchTerm]); // Remove onSearch from dependencies
  // Sync form with external changes
  useEffect(() => {
    if (searchTerm !== watchedSearchTerm) {
      setValue("searchTerm", searchTerm);
    }
  }, [searchTerm, setValue]);
  const onSubmit = (data: SearchForm) => {
    if (onSearch) {
      onSearch(data.searchTerm);
    }
  };
  const handleClear = () => {
    reset({ searchTerm: "" });
    setSearchTerm("");
    if (onSearch) {
      onSearch("");
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="relative flex w-full max-w-sm md:max-w-md">
      <div className="relative flex-1">
        <Input
          {...register("searchTerm")}
          type="search"
          placeholder={placeholder}
          className="pr-12"
        />
       
        {watchedSearchTerm && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-12 top-1/2 h-6 w-6 -translate-y-1/2 p-0 hover:bg-gray-100"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      <Button
        type="submit"
        size="icon"
        className="rounded-l-none bg-kr-orange hover:bg-kr-orange-dark"
        disabled={isSubmitting}
        aria-label="Search"
      >
        <Search className="h-4 w-4" />
      </Button>
    </form>
  );
}