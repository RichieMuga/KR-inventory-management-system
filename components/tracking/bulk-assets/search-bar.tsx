// components/tracking/BulkSearchBar.tsx

"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface BulkSearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export default function BulkSearchBar({ searchTerm, setSearchTerm }: BulkSearchBarProps) {
  const handleSearch = () => {
    // Search functionality can be implemented here
    console.log("Searching for:", searchTerm);
  };

  return (
    <div className="relative flex w-full max-w-sm md:max-w-xs">
      <Input
        type="search"
        placeholder="Search assets by name or serial..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Button
        type="button"
        size="icon"
        className="rounded-l-none bg-kr-orange hover:bg-kr-orange-dark"
        onClick={handleSearch}
        aria-label="Search"
      >
        <Search className="h-4 w-4" />
      </Button>
    </div>
  );
}