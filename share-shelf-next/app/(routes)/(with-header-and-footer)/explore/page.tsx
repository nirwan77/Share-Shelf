"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ExploreCard } from "@/components/manual/ExploreBooksCard";
import { useGetBooks, type BookFilters } from "./action";
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

  const [page, setPage] = useState(0);
  const [publishedDate, setPublishedDate] = useState<string | undefined>();
  const [priceRange, setPriceRange] = useState<string | undefined>();
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const pageParam = searchParams.get("page");
    setPage(pageParam !== null ? Number(pageParam) : 0);

    const pubDate = searchParams.get("publishedDate");
    setPublishedDate(pubDate || undefined);

    const price = searchParams.get("priceRange");
    setPriceRange(price || undefined);

    const cats = searchParams.get("categories");
    setCategories(cats ? cats.split(",") : []);
  }, [searchParams]);

  const limit = 12;

  const filters: BookFilters = useMemo(() => {
    const result: BookFilters = {};

    if (priceRange) {
      const priceMap: Record<string, { minPrice?: number; maxPrice?: number }> =
        {
          "below-1000": { maxPrice: 999 },
          "1000-1500": { minPrice: 1000, maxPrice: 1499 },
          "1500-2000": { minPrice: 1500, maxPrice: 1999 },
          "2000-2500": { minPrice: 2000, maxPrice: 2499 },
          "2500-3000": { minPrice: 2500, maxPrice: 2999 },
        };
      Object.assign(result, priceMap[priceRange]);
    }

    if (publishedDate) {
      result.publishedDate = publishedDate;
    }

    if (categories.length > 0) {
      result.categories = categories;
    }

    return result;
  }, [priceRange, publishedDate, categories]);

  const { data, isFetching } = useGetBooks(page, limit, filters);
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

    if (
      Object.keys(updates).some((key) =>
        ["publishedDate", "priceRange", "categories"].includes(key),
      )
    ) {
      params.delete("page");
      setPage(0);
    }

    router.replace(`${pathname}?${params.toString()}`);
  };

  const updatePage = (newPage: number) => {
    setPage(newPage);
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="pt-[138px] pb-20 container mx-auto grid grid-cols-12 gap-4">
      <div className="col-span-3">
        <h2 className="heading-4 mb-6">Filters</h2>

        <div className="border-t border-[#dbdcd2]">
          <div className="flex items-center">
            <h2 className="body-lg py-5 grow">Category</h2>
            <button
              className="text-sm"
              onClick={() => {
                setCategories([]);
                updateParams({ categories: null });
              }}
            >
              Clear
            </button>
          </div>
          <div className="space-y-4 mb-6">
            {["fiction", "historical", "romance", "classics", "adventure"].map(
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

        <div className="border-t border-[#dbdcd2]">
          <div className="flex items-center">
            <h2 className="body-lg py-5 grow">Published Date</h2>
            <button
              className="text-sm"
              onClick={() => {
                setPublishedDate(undefined);
                updateParams({ publishedDate: null });
              }}
            >
              Clear
            </button>
          </div>
          <RadioGroup
            key={publishedDate ?? "none"}
            value={publishedDate || ""}
            onValueChange={(value) => {
              setPublishedDate(value || undefined);
              updateParams({ publishedDate: value || null });
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

        <div className="border-y pb-6 border-[#dbdcd2]">
          <div className="flex items-center">
            <h2 className="body-lg py-5 grow">Price</h2>
            <button
              className="text-sm"
              onClick={() => {
                setPriceRange(undefined);
                updateParams({ priceRange: null });
              }}
            >
              Clear
            </button>
          </div>
          <RadioGroup
            key={priceRange ?? "none"}
            value={priceRange || ""}
            onValueChange={(value) => {
              setPriceRange(value || undefined);
              updateParams({ priceRange: value || null });
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

      <div className="col-start-4 col-span-9">
        <div className="grid grid-cols-3 gap-4">
          {(data?.data ?? []).map((book) => (
            <ExploreCard
              link={`book-detail/${book.id}`}
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
                <PaginationItem>
                  <PaginationLink
                    isActive={page === 0}
                    onClick={() => updatePage(0)}
                    className="font-semibold"
                  >
                    1
                  </PaginationLink>
                </PaginationItem>

                {page > 3 && (
                  <PaginationItem>
                    <span className="px-2 py-1 text-muted-foreground">...</span>
                  </PaginationItem>
                )}

                {Array.from({ length: 5 }, (_, i) => {
                  const pageNum = page - 2 + i;
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

                {page < totalPages - 4 && totalPages > 6 && (
                  <PaginationItem>
                    <span className="px-2 py-1 text-muted-foreground">...</span>
                  </PaginationItem>
                )}

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
