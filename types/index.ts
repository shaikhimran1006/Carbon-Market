export type Category = "REFORESTATION" | "RENEWABLE_ENERGY" | "OCEAN_CONSERVATION" | "INDUSTRIAL" | "AGRICULTURE" | "COMMUNITY";

export interface ProjectCardProps {
  id: string;
  title: string;
  category: string;
  pricePerCredit: number;
  location: string;
  country: string;
  isVerraCertified: boolean;
  sdgGoals: number[];
  imageUrl: string;
  rating: number;
  reviewCount: number;
  availableCredits: number;
}

export interface CartItem {
  id: string;
  projectId: string;
  quantity: number;
  project: {
    id: string;
    title: string;
    pricePerCredit: number;
    imageUrl: string;
    availableCredits: number;
  };
}

export interface FilterState {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sdgGoals?: number[];
  certified?: boolean;
  country?: string;
  search?: string;
  sort?: "price-asc" | "price-desc" | "rating" | "newest" | "credits";
}
