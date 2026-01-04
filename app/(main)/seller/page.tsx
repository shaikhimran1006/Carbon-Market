"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatDate, CATEGORY_LABELS } from "@/lib/utils";
import {
  Plus,
  DollarSign,
  Package,
  TrendingUp,
  Users,
  Star,
  Eye,
  Edit,
  BarChart3,
  Calendar,
  MapPin,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

export default function SellerDashboardPage() {
  const { data: session, status } = useSession();
  const [projects, setProjects] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalCreditsSold: 0,
    activeProjects: 0,
    avgRating: 0,
    totalReviews: 0,
  });
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [projectPerformance, setProjectPerformance] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/login?redirect=/seller");
    }
    if (session?.user?.role !== "SELLER" && session?.user?.role !== "ADMIN") {
      redirect("/dashboard");
    }
  }, [status, session]);

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        const res = await fetch("/api/seller/stats");
        if (res.ok) {
          const data = await res.json();
          setProjects(data.projects || []);
          setStats(data.stats || {
            totalRevenue: 0,
            totalCreditsSold: 0,
            activeProjects: 0,
            avgRating: 0,
            totalReviews: 0,
          });
          setRevenueData(data.revenueData || []);
          setProjectPerformance(data.projectPerformance || []);
          setRecentOrders(data.recentOrders || []);
        }
      } catch (error) {
        console.error("Failed to fetch seller data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchSellerData();
    }
  }, [session]);

  if (status === "loading" || isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="text-gray-600">Manage your carbon credit projects</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Add a new carbon credit project to the marketplace
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Project Title</Label>
                  <Input id="title" placeholder="Amazon Rainforest Conservation" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="REFORESTATION">Reforestation</SelectItem>
                      <SelectItem value="RENEWABLE_ENERGY">Renewable Energy</SelectItem>
                      <SelectItem value="OCEAN_CONSERVATION">Ocean Conservation</SelectItem>
                      <SelectItem value="INDUSTRIAL">Industrial</SelectItem>
                      <SelectItem value="AGRICULTURE">Agriculture</SelectItem>
                      <SelectItem value="COMMUNITY">Community</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your project..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price per Credit ($)</Label>
                  <Input id="price" type="number" placeholder="15.00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="credits">Available Credits</Label>
                  <Input id="credits" type="number" placeholder="10000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="standard">Standard</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VCS">VCS</SelectItem>
                      <SelectItem value="Gold Standard">Gold Standard</SelectItem>
                      <SelectItem value="ACR">ACR</SelectItem>
                      <SelectItem value="CAR">CAR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" placeholder="Amazon Basin" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" placeholder="Brazil" />
                </div>
              </div>
              <Button className="w-full">Create Project</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Credits Sold</p>
                <p className="text-xl font-bold">{stats.totalCreditsSold.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Projects</p>
                <p className="text-xl font-bold">{stats.activeProjects}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Star className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg Rating</p>
                <p className="text-xl font-bold">{stats.avgRating.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Users className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Reviews</p>
                <p className="text-xl font-bold">{stats.totalReviews}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10B981"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sold" fill="#10B981" name="Sold" />
                  <Bar dataKey="available" fill="#0EA5E9" name="Available" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects Table */}
      <Card>
        <CardHeader>
          <CardTitle>My Projects</CardTitle>
          <CardDescription>Manage and monitor your carbon credit projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 border rounded-lg"
              >
                <div className="relative w-full md:w-24 h-32 md:h-16 rounded overflow-hidden flex-shrink-0">
                  <Image
                    src={project.imageUrl}
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 96px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Link
                        href={`/projects/${project.id}`}
                        className="font-semibold hover:text-primary transition-colors"
                      >
                        {project.title}
                      </Link>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {project.location}, {project.country}
                      </p>
                    </div>
                    <Badge 
                      variant={project.availableCredits > 1000 ? "default" : "secondary"}
                      className={project.availableCredits > 1000 ? "bg-green-500" : ""}
                    >
                      {project.availableCredits > 1000 ? "Active" : "Low Stock"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-3 text-sm">
                    <span className="text-gray-500">
                      Price: <span className="font-medium text-gray-900">{formatCurrency(project.pricePerCredit)}</span>
                    </span>
                    <span className="text-gray-500">
                      Available: <span className="font-medium text-gray-900">{project.availableCredits.toLocaleString()}</span>
                    </span>
                    <span className="text-gray-500">
                      Rating: <span className="font-medium text-gray-900">{project.rating.toFixed(1)} ⭐</span>
                    </span>
                    <span className="text-gray-500">
                      Reviews: <span className="font-medium text-gray-900">{project.reviewCount}</span>
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <Link href={`/projects/${project.id}`} className="flex-1 md:flex-none">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" className="flex-1 md:flex-none">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
