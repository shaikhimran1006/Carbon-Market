"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { SDGBadges } from "@/components/projects/SDGBadges";
import { StarRating, InteractiveStarRating } from "@/components/projects/StarRating";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";
import {
  formatCurrency,
  formatNumber,
  formatDate,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
} from "@/lib/utils";
import {
  MapPin,
  ShoppingCart,
  CheckCircle,
  Minus,
  Plus,
  ThumbsUp,
  Calendar,
  User,
  TrendingUp,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// Dynamic import for map to avoid SSR issues
const ProjectMap = dynamic(() => import("@/components/projects/ProjectMap"), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />,
});

interface Project {
  id: string;
  title: string;
  description: string;
  methodology: string;
  category: string;
  pricePerCredit: number;
  totalCredits: number;
  availableCredits: number;
  location: string;
  country: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  images: string[];
  isVerraCertified: boolean;
  sdgGoals: number[];
  rating: number;
  reviewCount: number;
  seller: {
    id: string;
    name: string;
  };
  reviews: {
    id: string;
    rating: number;
    title: string;
    comment: string;
    helpfulCount: number;
    createdAt: string;
    user: {
      id: string;
      name: string;
    };
  }[];
  priceHistory: {
    date: string;
    price: number;
  }[];
}

export default function ProjectDetailPage() {
  const params = useParams();
  const { data: session } = useSession();
  const { addItem, isLoading: cartLoading } = useCart();
  const { toast } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviewSort, setReviewSort] = useState("newest");

  // Review form state
  const [reviewRating, setReviewRating] = useState(7);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`/api/projects/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setProject(data);
        }
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchProject();
    }
  }, [params.id]);

  const handleAddToCart = async () => {
    if (!project) return;
    try {
      await addItem(project.id, quantity);
      toast({
        title: "Added to cart",
        description: `${quantity} credit${quantity > 1 ? "s" : ""} from ${project.title} added to your cart.`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to leave a review.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await fetch(`/api/reviews/${params.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: reviewRating,
          title: reviewTitle,
          comment: reviewComment,
        }),
      });

      if (res.ok) {
        const newReview = await res.json();
        setProject((prev) =>
          prev ? { ...prev, reviews: [newReview, ...prev.reviews] } : null
        );
        setReviewTitle("");
        setReviewComment("");
        setReviewRating(7);
        toast({
          title: "Review submitted",
          description: "Thank you for your feedback!",
          variant: "success",
        });
      } else {
        const error = await res.json();
        toast({
          title: "Error",
          description: error.message || "Failed to submit review.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      await fetch(`/api/reviews/helpful/${reviewId}`, { method: "POST" });
      setProject((prev) =>
        prev
          ? {
            ...prev,
            reviews: prev.reviews.map((r) =>
              r.id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r
            ),
          }
          : null
      );
    } catch (error) {
      console.error("Error marking review as helpful:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <Skeleton className="h-96 rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-24" />
            <Skeleton className="h-12 w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold">Project not found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative h-96 rounded-lg overflow-hidden">
            <Image
              src={project.images[selectedImage] || project.imageUrl}
              alt={project.title}
              fill
              sizes="(max-width: 768px) 100vw, 60vw"
              className="object-cover"
            />
            {project.isVerraCertified && (
              <Badge className="absolute top-4 right-4 bg-primary text-white">
                <CheckCircle className="w-4 h-4 mr-1" />
                VERRA Certified
              </Badge>
            )}
          </div>
          {project.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {project.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0 border-2 transition-colors ${selectedImage === index ? "border-primary" : "border-transparent"
                    }`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Project Info */}
        <div className="space-y-6">
          <div>
            <Badge variant="secondary" className="mb-2">
              {CATEGORY_ICONS[project.category]} {CATEGORY_LABELS[project.category]}
            </Badge>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.title}</h1>
            <div className="flex items-center text-gray-600 mb-4">
              <MapPin className="w-4 h-4 mr-1" />
              {project.location}, {project.country}
            </div>
            <div className="flex items-center gap-4">
              <StarRating rating={project.rating} showValue />
              <span className="text-gray-500">({project.reviewCount} reviews)</span>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-700 mb-2">SDG Goals</h3>
            <SDGBadges goals={project.sdgGoals} size="md" showLabel />
          </div>

          <Separator />

          <div>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-bold text-primary">
                {formatCurrency(project.pricePerCredit)}
              </span>
              <span className="text-gray-500">per credit</span>
            </div>
            <p className="text-gray-600 mb-4">
              {formatNumber(project.availableCredits)} of {formatNumber(project.totalCredits)} credits
              available
            </p>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-4">
              <Label>Quantity:</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.min(project.availableCredits, Math.max(1, parseInt(e.target.value) || 1)))
                  }
                  className="w-20 text-center"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.min(project.availableCredits, quantity + 1))}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Total */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total:</span>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(project.pricePerCredit * quantity)}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {quantity} credit{quantity > 1 ? "s" : ""} = {quantity} ton{quantity > 1 ? "s" : ""} CO₂
                offset
              </p>
            </div>

            <Button
              size="lg"
              className="w-full"
              onClick={handleAddToCart}
              disabled={cartLoading}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Add to Cart
            </Button>
          </div>

          <div className="text-sm text-gray-500">
            <p>Sold by: {project.seller.name}</p>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="about" className="mb-12">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
          <TabsTrigger value="price">Price History</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-700 whitespace-pre-line">{project.description}</p>
              <Separator />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Methodology</h4>
                <p className="text-gray-700">{project.methodology}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="location" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 rounded-lg overflow-hidden">
                <ProjectMap
                  latitude={project.latitude}
                  longitude={project.longitude}
                  title={project.title}
                />
              </div>
              <p className="mt-4 text-gray-600">
                <MapPin className="w-4 h-4 inline mr-1" />
                {project.location}, {project.country}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="price" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Price History (Last 6 Months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={project.priceHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={["auto", "auto"]} />
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), "Price"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={{ fill: "#10B981" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Reviews List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">
                  Reviews ({project.reviews.length})
                </h3>
                <select
                  value={reviewSort}
                  onChange={(e) => setReviewSort(e.target.value)}
                  className="border rounded-md px-3 py-1 text-sm"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="highest">Highest Rated</option>
                  <option value="lowest">Lowest Rated</option>
                  <option value="helpful">Most Helpful</option>
                </select>
              </div>

              {project.reviews.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-gray-500">
                    No reviews yet. Be the first to review!
                  </CardContent>
                </Card>
              ) : (
                project.reviews
                  .sort((a, b) => {
                    switch (reviewSort) {
                      case "oldest":
                        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                      case "highest":
                        return b.rating - a.rating;
                      case "lowest":
                        return a.rating - b.rating;
                      case "helpful":
                        return b.helpfulCount - a.helpfulCount;
                      default:
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                    }
                  })
                  .map((review) => (
                    <Card key={review.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">{review.user.name}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <StarRating rating={review.rating} size="sm" />
                              <span className="text-sm text-gray-500">
                                {review.rating}/10
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(review.createdAt)}
                          </div>
                        </div>
                        {review.title && (
                          <h4 className="font-semibold text-gray-900 mt-3">{review.title}</h4>
                        )}
                        <p className="text-gray-700 mt-2">{review.comment}</p>
                        <div className="flex items-center mt-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkHelpful(review.id)}
                          >
                            <ThumbsUp className="w-4 h-4 mr-1" />
                            Helpful ({review.helpfulCount})
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              )}
            </div>

            {/* Write Review Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Write a Review</CardTitle>
                </CardHeader>
                <CardContent>
                  {session ? (
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      <div>
                        <Label>Rating</Label>
                        <InteractiveStarRating
                          value={reviewRating}
                          onChange={setReviewRating}
                          size="md"
                        />
                      </div>
                      <div>
                        <Label htmlFor="reviewTitle">Title</Label>
                        <Input
                          id="reviewTitle"
                          value={reviewTitle}
                          onChange={(e) => setReviewTitle(e.target.value)}
                          placeholder="Summarize your experience"
                        />
                      </div>
                      <div>
                        <Label htmlFor="reviewComment">Review</Label>
                        <Textarea
                          id="reviewComment"
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Share your experience with this project"
                          rows={4}
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={isSubmittingReview}>
                        {isSubmittingReview ? "Submitting..." : "Submit Review"}
                      </Button>
                    </form>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-600 mb-4">Please log in to write a review</p>
                      <Button variant="outline" asChild>
                        <a href="/auth/login">Log In</a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
