"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { formatCurrency, CATEGORY_LABELS, CATEGORY_ICONS } from "@/lib/utils";
import { MapPin, Filter, List, Star, Globe, X, Leaf } from "lucide-react";

// Dynamic import for Leaflet Map component to avoid SSR issues
const LeafletMap = dynamic(
  () => import("@/components/map/LeafletMap"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }
);

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  pricePerCredit: number;
  availableCredits: number;
  rating: number;
  reviewCount: number;
  location: string;
  country: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  sdgGoals: number[];
}

const CATEGORY_MARKER_COLORS: Record<string, string> = {
  REFORESTATION: "#10B981",
  RENEWABLE_ENERGY: "#F59E0B",
  OCEAN_CONSERVATION: "#0EA5E9",
  INDUSTRIAL: "#6B7280",
  AGRICULTURE: "#84CC16",
  COMMUNITY: "#8B5CF6",
};

export default function MapPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/projects?limit=100");
        if (res.ok) {
          const data = await res.json();
          setProjects(data.projects || []);
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    if (selectedCategories.length === 0) return projects;
    return projects.filter((p) => selectedCategories.includes(p.category));
  }, [projects, selectedCategories]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const stats = useMemo(() => {
    const totalCredits = filteredProjects.reduce((sum, p) => sum + p.availableCredits, 0);
    const countries = new Set(filteredProjects.map((p) => p.country)).size;
    return { totalCredits, countries, projects: filteredProjects.length };
  }, [filteredProjects]);

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Globe className="w-6 h-6 text-primary" />
              Project Map
            </h1>
            <p className="text-gray-600 text-sm">
              Explore carbon credit projects around the world
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full" />
              <span>{stats.projects} Projects</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span>{stats.countries} Countries</span>
            </div>
            <div className="flex items-center gap-2">
              <Leaf className="w-4 h-4 text-primary" />
              <span>{stats.totalCredits.toLocaleString()} Credits</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-1" />
              Filter
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Filters Sidebar */}
        {showFilters && (
          <div className="w-64 bg-white border-r p-4 overflow-y-auto">
            <h3 className="font-semibold mb-4">Filter by Category</h3>
            <div className="space-y-3">
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <div key={key} className="flex items-center gap-2">
                  <Checkbox
                    id={key}
                    checked={selectedCategories.includes(key)}
                    onCheckedChange={() => toggleCategory(key)}
                  />
                  <Label
                    htmlFor={key}
                    className="text-sm cursor-pointer flex items-center gap-1"
                  >
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: CATEGORY_MARKER_COLORS[key] }}
                    />
                    {CATEGORY_ICONS[key]} {label}
                  </Label>
                </div>
              ))}
            </div>
            {selectedCategories.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-4 w-full"
                onClick={() => setSelectedCategories([])}
              >
                Clear Filters
              </Button>
            )}

            {/* Legend */}
            <div className="mt-8">
              <h3 className="font-semibold mb-4">Legend</h3>
              <div className="space-y-2 text-sm">
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: CATEGORY_MARKER_COLORS[key] }}
                    />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Map */}
        <div className="flex-1 relative">
          {/* Mobile Controls */}
          <div className="absolute top-4 left-4 z-[1000] flex gap-2 md:hidden">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowFilters(true)}
            >
              <Filter className="w-4 h-4 mr-1" />
              Filters
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowList(!showList)}
            >
              <List className="w-4 h-4 mr-1" />
              List
            </Button>
          </div>

          {isLoading ? (
            <div className="h-full w-full flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                <p className="text-gray-600">Loading map...</p>
              </div>
            </div>
          ) : (
            <LeafletMap
              projects={filteredProjects}
              onSelectProject={setSelectedProject}
            />
          )}

          {/* Selected Project Card */}
          {selectedProject && (
            <Card className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[1000] shadow-lg">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant="outline">
                    {CATEGORY_ICONS[selectedProject.category]}{" "}
                    {CATEGORY_LABELS[selectedProject.category]}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedProject(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <CardTitle className="text-lg">{selectedProject.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-4">
                  <img
                    src={selectedProject.imageUrl}
                    alt={selectedProject.title}
                    className="w-24 h-24 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 flex items-center gap-1 mb-2">
                      <MapPin className="w-3 h-3" />
                      {selectedProject.location}, {selectedProject.country}
                    </p>
                    <p className="text-lg font-semibold text-primary">
                      {formatCurrency(selectedProject.pricePerCredit)}/credit
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedProject.availableCredits.toLocaleString()} credits available
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="text-sm font-medium">
                        {selectedProject.rating.toFixed(1)}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({selectedProject.reviewCount} reviews)
                      </span>
                    </div>
                  </div>
                </div>
                <Link href={`/projects/${selectedProject.id}`}>
                  <Button className="w-full">View Project Details</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Project List (Mobile) */}
          {showList && (
            <div className="absolute inset-0 bg-white z-[999] overflow-y-auto p-4 md:hidden">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Projects ({filteredProjects.length})</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowList(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-4">
                {filteredProjects.map((project) => (
                  <Card
                    key={project.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => {
                      setSelectedProject(project);
                      setShowList(false);
                    }}
                  >
                    <CardContent className="p-4 flex gap-4">
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <Badge variant="outline" className="mb-1">
                          {CATEGORY_LABELS[project.category]}
                        </Badge>
                        <h3 className="font-medium text-sm">{project.title}</h3>
                        <p className="text-xs text-gray-500">
                          {project.location}, {project.country}
                        </p>
                        <p className="text-sm font-semibold text-primary mt-1">
                          {formatCurrency(project.pricePerCredit)}/credit
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
