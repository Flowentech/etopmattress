"use client";

import { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Filter } from "lucide-react";
import ShopFilters from "./ShopFilters";
import { CategoryWithCount, PriceRange, FilterStats } from "@/lib/filterService";

interface MobileFilterButtonProps {
  categories: CategoryWithCount[];
  priceRanges: PriceRange[];
  filterStats: FilterStats;
  currentFilters: {
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    search?: string;
    availability?: string[];
    rating?: string;
  };
}

export default function MobileFilterButton({
  categories,
  priceRanges,
  filterStats,
  currentFilters,
}: MobileFilterButtonProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Close sheet when search params change (filter applied)
  useEffect(() => {
    setOpen(false);
  }, [searchParams]);

  return (
    <div className="lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[350px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>
              Filter products by category, price, and more
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4">
            <ShopFilters
              categories={categories}
              priceRanges={priceRanges}
              filterStats={filterStats}
              currentFilters={currentFilters}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
