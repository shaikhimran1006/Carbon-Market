"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Users,
    Building2,
    ShoppingCart,
    TrendingUp,
    Activity,
    DollarSign,
    Leaf,
    Globe,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

interface AdminStats {
    totalUsers: number;
    totalProjects: number;
    totalOrders: number;
    totalRevenue: number;
    totalCreditsTraded: number;
    recentOrders: any[];
    topProjects: any[];
    usersByRole: { role: string; count: number }[];
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchAdminStats();
    }, []);

    const fetchAdminStats = async () => {
        try {
            const res = await fetch("/api/admin/stats");
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error("Error fetching admin stats:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="container mx-auto px-4 py-8">
                <p className="text-center text-gray-600">Failed to load admin dashboard</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
                <p className="text-gray-600">Monitor and manage the CarbonMarket platform</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Total Users
                        </CardTitle>
                        <Users className="w-4 h-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalUsers}</div>
                        <div className="mt-2 space-y-1">
                            {stats.usersByRole.map((role) => (
                                <div key={role.role} className="text-xs text-gray-500 flex justify-between">
                                    <span className="capitalize">{role.role.toLowerCase()}s:</span>
                                    <span className="font-medium">{role.count}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Total Projects
                        </CardTitle>
                        <Building2 className="w-4 h-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalProjects}</div>
                        <p className="text-xs text-gray-500 mt-2">Active carbon credit projects</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Total Orders
                        </CardTitle>
                        <ShoppingCart className="w-4 h-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalOrders}</div>
                        <p className="text-xs text-gray-500 mt-2">Completed transactions</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Total Revenue
                        </CardTitle>
                        <DollarSign className="w-4 h-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                        <p className="text-xs text-gray-500 mt-2">Platform transaction value</p>
                    </CardContent>
                </Card>
            </div>

            {/* Credits Traded Card */}
            <Card className="mb-8 bg-gradient-to-br from-primary-50 to-secondary-50">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-2">
                                Total Carbon Credits Traded
                            </p>
                            <p className="text-4xl font-bold text-primary">
                                {stats.totalCreditsTraded.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-600 mt-2">
                                Equivalent to offsetting significant CO₂ emissions
                            </p>
                        </div>
                        <Leaf className="w-16 h-16 text-primary opacity-20" />
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Orders */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5" />
                            Recent Orders
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stats.recentOrders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-medium">{order.userName}</TableCell>
                                        <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    order.status === "COMPLETED"
                                                        ? "default"
                                                        : order.status === "PENDING"
                                                            ? "secondary"
                                                            : "destructive"
                                                }
                                            >
                                                {order.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-500">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Top Projects */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            Top Projects
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.topProjects.map((project, index) => (
                                <div
                                    key={project.id}
                                    className="flex items-start gap-4 pb-4 border-b last:border-0"
                                >
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                        <span className="text-sm font-bold text-primary">#{index + 1}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Link
                                            href={`/projects/${project.id}`}
                                            className="font-medium text-sm hover:text-primary transition-colors truncate block"
                                        >
                                            {project.title}
                                        </Link>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {project.country} • {project.orderCount} orders
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Badge variant="outline" className="text-xs">
                                                {formatCurrency(project.pricePerCredit)}/credit
                                            </Badge>
                                            <span className="text-xs text-gray-600">
                                                {formatCurrency(project.revenue)} revenue
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card className="mt-8">
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link href="/projects">
                            <Button variant="outline" className="w-full">
                                <Globe className="w-4 h-4 mr-2" />
                                View All Projects
                            </Button>
                        </Link>
                        <Link href="/projects">
                            <Button variant="outline" className="w-full">
                                <Users className="w-4 h-4 mr-2" />
                                Manage Users
                            </Button>
                        </Link>
                        <Link href="/projects">
                            <Button variant="outline" className="w-full">
                                <Activity className="w-4 h-4 mr-2" />
                                View Analytics
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
