"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { formatCurrency, CATEGORY_LABELS, CATEGORY_ICONS } from "@/lib/utils";
import Link from "next/link";

// Fix for default markers not showing
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

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

interface LeafletMapProps {
  projects: Project[];
  onSelectProject: (project: Project | null) => void;
}

export default function LeafletMap({ projects, onSelectProject }: LeafletMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {projects.map((project) => (
        <Marker
          key={project.id}
          position={[project.latitude, project.longitude]}
          eventHandlers={{
            click: () => onSelectProject(project),
          }}
        >
          <Popup>
            <div className="w-64">
              <img
                src={project.imageUrl}
                alt={project.title}
                className="w-full h-32 object-cover rounded-t"
              />
              <div className="p-3">
                <Badge variant="outline" className="mb-2">
                  {CATEGORY_ICONS[project.category]}{" "}
                  {CATEGORY_LABELS[project.category]}
                </Badge>
                <h3 className="font-semibold text-sm mb-1">
                  {project.title}
                </h3>
                <p className="text-xs text-gray-500 mb-2">
                  {project.location}, {project.country}
                </p>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-primary font-semibold">
                    {formatCurrency(project.pricePerCredit)}/credit
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    {project.rating.toFixed(1)}
                  </span>
                </div>
                <Link href={`/projects/${project.id}`}>
                  <Button size="sm" className="w-full">
                    View Project
                  </Button>
                </Link>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
