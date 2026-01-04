"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatDate, CATEGORY_LABELS } from "@/lib/utils";
import {
  User,
  ShoppingBag,
  Leaf,
  TrendingUp,
  Calendar,
  Package,
  ChevronRight,
  Award,
  Target,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalCredits: 0,
    totalSpent: 0,
    totalCO2: 0,
    projectCount: 0,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/login?redirect=/dashboard");
    }
  }, [status]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders");
        if (res.ok) {
          const data = await res.json();
          setOrders(data);

          // Calculate stats
          let totalCredits = 0;
          let totalSpent = 0;
          const projectIds = new Set();

          data.forEach((order: any) => {
            totalSpent += order.totalAmount;
            order.items?.forEach((item: any) => {
              totalCredits += item.quantity;
              projectIds.add(item.projectId);
            });
          });

          setStats({
            totalCredits,
            totalSpent,
            totalCO2: totalCredits,
            projectCount: projectIds.size,
          });
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      }
    };

    if (session) {
      fetchOrders();
    }
  }, [session]);

  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
      </div>
    );
  }

  // Generate chart data from orders
  const chartData = orders
    .slice()
    .reverse()
    .reduce((acc: any[], order) => {
      const totalCredits = order.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
      const prevTotal = acc.length > 0 ? acc[acc.length - 1].cumulative : 0;
      acc.push({
        date: formatDate(new Date(order.createdAt)),
        credits: totalCredits,
        cumulative: prevTotal + totalCredits,
      });
      return acc;
    }, []);

  const yearlyGoal = 20; // Example annual goal
  const progress = (stats.totalCO2 / yearlyGoal) * 100;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {session?.user?.name || "User"}!
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/calculator">
            <Button variant="outline">
              <Target className="w-4 h-4 mr-2" />
              Calculate Footprint
            </Button>
          </Link>
          <Link href="/projects">
            <Button>
              <Leaf className="w-4 h-4 mr-2" />
              Browse Projects
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Leaf className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500">CO₂ Offset</p>
                <p className="text-2xl font-bold">{stats.totalCO2} tons</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary/10 rounded-full">
                <ShoppingBag className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Spent</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalSpent)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent/10 rounded-full">
                <Award className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Credits Owned</p>
                <p className="text-2xl font-bold">{stats.totalCredits}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Projects Supported</p>
                <p className="text-2xl font-bold">{stats.projectCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Impact Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Your Impact Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorCredits" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        formatter={(value: number) => [`${value} tons`, "Cumulative CO₂ Offset"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="cumulative"
                        stroke="#10B981"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorCredits)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <p>No data yet. Make your first purchase to see your impact!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Recent Orders
              </CardTitle>
              <Link href="/portfolio">
                <Button variant="ghost" size="sm">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {order.items?.length || 0} project{order.items?.length !== 1 ? "s" : ""}
                          </p>
                          <p className="text-sm text-gray-500">{formatDate(new Date(order.createdAt))}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(order.totalAmount)}</p>
                        <Badge
                          variant={
                            order.status === "COMPLETED"
                              ? "success"
                              : order.status === "PENDING"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No orders yet</p>
                  <Link href="/projects">
                    <Button variant="link">Browse projects</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Annual Goal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Annual Offset Goal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <span className="text-4xl font-bold text-primary">{stats.totalCO2}</span>
                <span className="text-gray-500"> / {yearlyGoal} tons</span>
              </div>
              <Progress value={Math.min(progress, 100)} className="h-3 mb-4" />
              <p className="text-sm text-gray-600 text-center">
                {progress >= 100 ? (
                  <span className="text-green-600 font-medium">🎉 Goal achieved!</span>
                ) : (
                  <span>
                    {(yearlyGoal - stats.totalCO2).toFixed(1)} tons remaining to reach your goal
                  </span>
                )}
              </p>
            </CardContent>
          </Card>

          {/* Impact Equivalents */}
          <Card>
            <CardHeader>
              <CardTitle>Your Impact Equals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">🌳 Trees planted</span>
                <span className="font-semibold">{stats.totalCO2 * 45}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">🚗 Miles not driven</span>
                <span className="font-semibold">{(stats.totalCO2 * 2600).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">💡 Light bulbs for a year</span>
                <span className="font-semibold">{(stats.totalCO2 * 111).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">🏠 Homes powered</span>
                <span className="font-semibold">{(stats.totalCO2 / 7.5).toFixed(1)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/calculator" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Target className="w-4 h-4 mr-2" />
                  Calculate My Footprint
                </Button>
              </Link>
              <Link href="/portfolio" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Award className="w-4 h-4 mr-2" />
                  View Portfolio
                </Button>
              </Link>
              <Link href="/projects" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Leaf className="w-4 h-4 mr-2" />
                  Browse Projects
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
