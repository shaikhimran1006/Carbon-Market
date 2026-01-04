"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { CATEGORY_LABELS, SDG_NAMES } from "@/lib/utils";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

interface ProjectFiltersProps {
  onFilterChange: (filters: any) => void;
  countries: string[];
}

export function ProjectFilters({ onFilterChange, countries }: ProjectFiltersProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("");
  const [priceRange, setPriceRange] = useState([0, 50]);
  const [certified, setCertified] = useState(false);
  const [country, setCountry] = useState<string>("");
  const [selectedSdgs, setSelectedSdgs] = useState<number[]>([]);
  const [sort, setSort] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  const handleApplyFilters = () => {
    onFilterChange({
      search,
      category: category || undefined,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      certified: certified || undefined,
      country: country || undefined,
      sdgGoals: selectedSdgs.length > 0 ? selectedSdgs : undefined,
      sort,
    });
  };

  const handleReset = () => {
    setSearch("");
    setCategory("");
    setPriceRange([0, 50]);
    setCertified(false);
    setCountry("");
    setSelectedSdgs([]);
    setSort("newest");
    onFilterChange({});
  };

  const toggleSdg = (sdg: number) => {
    setSelectedSdgs((prev) =>
      prev.includes(sdg) ? prev.filter((s) => s !== sdg) : [...prev, sdg]
    );
  };

  return (
    <div className="space-y-4">
      {/* Search and Sort Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
          />
        </div>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="credits">Most Credits</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          className="sm:hidden"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Filters Panel */}
      <div className={`grid grid-cols-1 lg:grid-cols-4 gap-4 ${showFilters ? "block" : "hidden sm:grid"}`}>
        {/* Category */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Category</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={category || "all"} onValueChange={(v) => setCategory(v === "all" ? "" : v)}>
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Price Range */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Price Range: ${priceRange[0]} - ${priceRange[1]}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              max={50}
              step={1}
              className="mt-2"
            />
          </CardContent>
        </Card>

        {/* Country */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Country</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={country || "all"} onValueChange={(v) => setCountry(v === "all" ? "" : v)}>
              <SelectTrigger>
                <SelectValue placeholder="All countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All countries</SelectItem>
                {countries.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Certification */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Certification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="certified"
                checked={certified}
                onCheckedChange={(checked) => setCertified(checked as boolean)}
              />
              <Label htmlFor="certified" className="text-sm">
                VERRA Certified Only
              </Label>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SDG Goals */}
      <Card className={`${showFilters ? "block" : "hidden sm:block"}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">SDG Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(SDG_NAMES).map(([num, name]) => (
              <button
                key={num}
                onClick={() => toggleSdg(parseInt(num))}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${selectedSdgs.includes(parseInt(num))
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {num}. {name}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button onClick={handleApplyFilters} className="flex-1 sm:flex-none">
          Apply Filters
        </Button>
        <Button variant="outline" onClick={handleReset}>
          <X className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>
    </div>
  );
}
