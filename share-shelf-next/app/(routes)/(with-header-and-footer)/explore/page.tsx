"use client";

import { useState, useEffect } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ExploreCard } from "@/components/manual/ExploreBooksCard";
import { useGetBooks } from "./action";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";

export default function Explore() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Sync state with search params
  const [page, setPage] = useState(0);
  const [publishedDate, setPublishedDate] = useState<string | undefined>();
  const [priceRange, setPriceRange] = useState<string | undefined>();
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    // Sync page
    const pageParam = searchParams.get("page");
    if (pageParam !== null) setPage(Number(pageParam));

    // Sync published date
    const pubDate = searchParams.get("published");
    if (pubDate) setPublishedDate(pubDate);
    else setPublishedDate(undefined);

    // Sync price
    const price = searchParams.get("price");
    if (price) setPriceRange(price);
    else setPriceRange(undefined);

    // Sync categories
    const cats = searchParams.get("categories");
    if (cats) setCategories(cats.split(","));
    else setCategories([]);
  }, [searchParams]);

  const limit = 12;
  const { data, isLoading, isFetching } = useGetBooks(page, limit);
  const totalPages = Math.ceil((data?.total ?? 0) / limit);

  const updateParams = (updates: Record<string, string | string[] | null>) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") {
        params.delete(key);
      } else if (Array.isArray(value)) {
        params.set(key, value.join(","));
      } else {
        params.set(key, value);
      }
    });

    if (updates.publishedDate || updates.priceRange || updates.categories) {
      params.delete("page");
    }

    router.replace(`${pathname}?${params.toString()}`);
  };

  const updatePage = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.replace(`${pathname}?${params.toString()}`);
  };

  console.log(data);

  return (
    <div className="pt-[138px] container mx-auto grid grid-cols-12 gap-4">
      {/* Filters */}
      <div className="col-span-3">
        <h2 className="heading-4 mb-6">Filters</h2>

        {/* Category filter */}
        <div className="border-t border-[#dbdcd2]">
          <div className="flex items-center">
            <h2 className="body-lg py-5 grow">Category</h2>
            <button
              className="text-sm"
              onClick={() => updateParams({ categories: null })}
            >
              Clear
            </button>
          </div>
          <div className="space-y-4 mb-6">
            {["fiction", "non-fiction", "history", "science", "biography"].map(
              (item) => (
                <div key={item} className="flex items-center gap-2">
                  <Checkbox
                    id={item}
                    checked={categories.includes(item)}
                    onCheckedChange={(checked) => {
                      const newCats = checked
                        ? [...categories, item]
                        : categories.filter((c) => c !== item);
                      setCategories(newCats);
                      updateParams({ categories: newCats });
                    }}
                  />
                  <Label htmlFor={item}>
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </Label>
                </div>
              ),
            )}
          </div>
        </div>

        {/* Published Date filter */}
        <div className="border-t border-[#dbdcd2]">
          <div className="flex items-center">
            <h2 className="body-lg py-5 grow">Published Date</h2>
            <button
              className="text-sm"
              onClick={() => updateParams({ publishedDate: null })}
            >
              Clear
            </button>
          </div>
          <RadioGroup
            value={publishedDate}
            onValueChange={(value) => {
              setPublishedDate(value);
              updateParams({ publishedDate: value });
            }}
            className="space-y-2 mb-6"
          >
            {[
              ["before-1990", "Before 1990"],
              ["1990-2000", "1990 - 2000"],
              ["2000-2005", "2000 - 2005"],
              ["2005-2010", "2005 - 2010"],
              ["2010-2015", "2010 - 2015"],
              ["2015-present", "2015 - present"],
            ].map(([value, label]) => (
              <div key={value} className="flex items-center gap-2">
                <RadioGroupItem value={value} id={value} />
                <Label className="cursor-pointer" htmlFor={value}>
                  {label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Price Filter */}
        <div className="border-y pb-6 border-[#dbdcd2]">
          <div className="flex items-center">
            <h2 className="body-lg py-5 grow">Price</h2>
            <button
              className="text-sm"
              onClick={() => updateParams({ priceRange: null })}
            >
              Clear
            </button>
          </div>
          <RadioGroup
            value={priceRange}
            onValueChange={(value) => {
              setPriceRange(value);
              updateParams({ priceRange: value });
            }}
            className="space-y-2"
          >
            {[
              ["below-1000", "Below Rs.1000"],
              ["1000-1500", "Rs.1000 - Rs.1500"],
              ["1500-2000", "Rs.1500 - Rs.2000"],
              ["2000-2500", "Rs.2000 - Rs.2500"],
              ["2500-3000", "Rs.2500 - Rs.3000"],
            ].map(([value, label]) => (
              <div key={value} className="flex items-center gap-2">
                <RadioGroupItem value={value} id={value} />
                <Label className="cursor-pointer" htmlFor={value}>
                  {label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>

      {/* Books Grid + Pagination */}
      <div className="col-start-4 col-span-9">
        <div className="grid grid-cols-3 gap-4">
          {(data?.data ?? []).map((book) => (
            <ExploreCard
              key={book.id}
              aurthur={book.author}
              name={book.name}
              price={book.price}
              src={book.image}
            />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <Pagination>
              <PaginationContent className="flex gap-1">
                {/* First page */}
                <PaginationItem>
                  <PaginationLink
                    isActive={page === 0}
                    onClick={() => updatePage(0)}
                    className="font-semibold"
                  >
                    1
                  </PaginationLink>
                </PaginationItem>

                {/* Ellipsis after first */}
                {page > 3 && (
                  <PaginationItem>
                    <span className="px-2 py-1 text-muted-foreground">...</span>
                  </PaginationItem>
                )}

                {/* Current page ±2 (5 pages total max) */}
                {Array.from({ length: 5 }, (_, i) => {
                  const pageNum = page - 2 + i; // ±2 range: page-2, page-1, page, page+1, page+2
                  if (pageNum >= 1 && pageNum <= totalPages - 2) {
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          isActive={pageNum === page}
                          onClick={() => updatePage(pageNum)}
                        >
                          {pageNum + 1}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                  return null;
                }).filter(Boolean)}

                {/* Ellipsis before last */}
                {page < totalPages - 4 && totalPages > 6 && (
                  <PaginationItem>
                    <span className="px-2 py-1 text-muted-foreground">...</span>
                  </PaginationItem>
                )}

                {/* Last page */}
                <PaginationItem>
                  <PaginationLink
                    isActive={page === totalPages - 1}
                    onClick={() => updatePage(totalPages - 1)}
                    className="font-semibold"
                  >
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {isFetching && (
          <div className="text-center text-sm text-muted-foreground mt-4">
            Loading...
          </div>
        )}
      </div>
    </div>
  );
}
