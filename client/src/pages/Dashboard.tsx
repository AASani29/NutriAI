import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import {
  Clock,
  Package,
  ChefHat,
  Lightbulb,
  ArrowRight,
  BookOpen,
  Info,
  Plus,
  X,
} from "lucide-react";
import { useProfile } from "../context/ProfileContext";
import { useInventory } from "../hooks/useInventory";
import { getPersonalizedRecommendations } from "../services/resources-service";
import { BASE_URL } from "../services/utils";
import { useAuth } from "@clerk/clerk-react";
import type { Article, Video } from "../types/resource-types";
import { PlayCircle } from "lucide-react";
import NutritionRadarChart from "../components/NutritionRadarChart";
import DirectConsumption from "../components/DirectConsumption";

// Analytics interfaces
interface ConsumptionPattern {
  byCategory: Array<{
    category: string;
    consumptionCount: number;
    quantityConsumed: number;
  }>;
  byTime: Array<{
    timePeriod: string;
    consumptionCount: number;
  }>;
  wasteReduction: {
    wastePrevented: number;
    wasteReductionPercentage: number;
  };
}

export default function Dashboard() {
  const { profile, loading: profileLoading } = useProfile();
  const { useGetInventories, useGetConsumptionLogs } = useInventory();
  const { getToken, isSignedIn } = useAuth();
  const navigate = useNavigate();
  const [showConsumptionModal, setShowConsumptionModal] = useState(false);

  // Date range for analytics (last 30 days) - Stable across renders
  const dateRange = useMemo(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    // Normalize to start/end of day for consistent caching
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    return { startDate, endDate };
  }, []); // Empty dependency array for stable dates

  // Fetch user data
  const { data: inventories = [], isLoading: inventoriesLoading } =
    useGetInventories();

  // Memoize consumption query params to prevent refetches
  const consumptionParams = useMemo(
    () => ({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    }),
    [dateRange.startDate, dateRange.endDate]
  );

  const { data: consumptionLogsData, isLoading: consumptionLoading } =
    useGetConsumptionLogs(consumptionParams);

  const consumptionLogs = consumptionLogsData?.consumptionLogs || [];

  // Fetch personalized AI recommendations
  const { data: recommendations, isLoading: recommendationsLoading } = useQuery(
    {
      queryKey: ["personalizedRecommendations"],
      queryFn: async () => {
        const token = await getToken();
        if (!token) throw new Error("Not authenticated");
        return getPersonalizedRecommendations(token);
      },
      staleTime: 10 * 60 * 1000, // Cache for 10 minutes
      gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
      enabled: isSignedIn && !profileLoading, // Only fetch when signed in and profile loaded
      retry: 1, // Only retry once on failure
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
    }
  );

  // Fetch analytics data with stable query key
  const { data: consumptionPatterns, isLoading: patternsLoading } = useQuery({
    queryKey: [
      "consumption-patterns",
      {
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
      },
    ],
    queryFn: async (): Promise<ConsumptionPattern> => {
      const params = new URLSearchParams({
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
      });
      const response = await fetch(
        `${BASE_URL}/inventories/analytics/consumption-patterns?${params}`,
        {
          headers: {
            Authorization: `Bearer ${await (
              window as any
            ).Clerk?.session?.getToken()}`,
          },
        }
      );
      if (!response.ok)
        return {
          byCategory: [],
          byTime: [],
          wasteReduction: { wastePrevented: 0, wasteReductionPercentage: 0 },
        };
      const data = await response.json();
      return data.patterns;
    },
    enabled: !profileLoading,
  });

  // Get all inventory items for comprehensive stats
  // Memoize inventory IDs to prevent unnecessary refetches
  const inventoryIds = useMemo(
    () => inventories.map((inv) => inv.id).sort(), // Sort for consistent ordering
    [inventories]
  );

  const { data: allInventoryItems = [], isLoading: itemsLoading } = useQuery({
    queryKey: ["all-inventory-items", inventoryIds],
    queryFn: async () => {
      if (!inventories.length) return [];

      const allItems = [];
      for (const inventory of inventories) {
        try {
          const response = await fetch(
            `${BASE_URL}/inventories/${inventory.id}/items`,
            {
              headers: {
                Authorization: `Bearer ${await (
                  window as any
                ).Clerk?.session?.getToken()}`,
              },
            }
          );
          if (response.ok) {
            const data = await response.json();
            allItems.push(...(data.items || []));
          }
        } catch (error) {
          console.error(
            `Error fetching items for inventory ${inventory.id}:`,
            error
          );
        }
      }
      return allItems;
    },
    enabled: inventories.length > 0 && !profileLoading,
  });

  // Calculate dashboard stats
  const dashboardStats = useMemo(() => {
    const today = new Date();
    const todayStr = today.toDateString();

    // Total items tracked
    const totalItems = allInventoryItems.length;

    // Items expiring soon (within 3 days)
    const expiringItems = allInventoryItems.filter((item) => {
      if (!item.expiryDate) return false;
      const expiryDate = new Date(item.expiryDate);
      const daysUntilExpiry = Math.ceil(
        (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysUntilExpiry <= 3 && daysUntilExpiry >= 0;
    }).length;

    // Today's consumption
    const todayConsumption = consumptionLogs.filter(
      (log) => new Date(log.consumedAt).toDateString() === todayStr
    );

    // Waste prevented (simplified calculation)
    const wastePreventedKg =
      consumptionPatterns?.wasteReduction?.wastePrevented || 0;

    // Most consumed category
    const categoryStats = consumptionPatterns?.byCategory || [];
    const topCategory = categoryStats.sort(
      (a, b) => b.quantityConsumed - a.quantityConsumed
    )[0];

    // Recent trend (comparing last 7 days vs previous 7 days)
    const last7Days = consumptionLogs.filter((log) => {
      const logDate = new Date(log.consumedAt);
      const daysDiff = Math.ceil(
        (today.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysDiff <= 7;
    });

    const previous7Days = consumptionLogs.filter((log) => {
      const logDate = new Date(log.consumedAt);
      const daysDiff = Math.ceil(
        (today.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysDiff > 7 && daysDiff <= 14;
    });

    const recentTrend = last7Days.length - previous7Days.length;

    return {
      totalItems,
      expiringItems,
      todayConsumption: todayConsumption.length,
      wastePreventedKg: Math.round(wastePreventedKg * 100) / 100,
      topCategory: topCategory?.category || "N/A",
      recentTrend,
      inventoryCount: inventories.length,
      totalConsumptionLogs:
        consumptionLogsData?.totalCount || consumptionLogs.length,
    };
  }, [
    allInventoryItems,
    consumptionLogsData,
    consumptionPatterns,
    inventories,
  ]);

  // Check if core data is loading
  const isInitialLoading = profileLoading || inventoriesLoading;
  const isDataLoading =
    consumptionLoading ||
    itemsLoading ||
    patternsLoading ||
    recommendationsLoading;

  // Get top 3 mixed recommendations for dashboard display
  const dashboardResources = useMemo(() => {
    if (!recommendations) return [];

    const articles = recommendations.articles || [];
    const videos = recommendations.videos || [];

    // Interleave articles and videos for variety
    const combined: (Article | Video)[] = [];
    const maxLength = Math.max(articles.length, videos.length);

    for (let i = 0; i < maxLength; i++) {
      if (i < articles.length)
        combined.push({ ...articles[i], type: "article" } as any);
      if (i < videos.length)
        combined.push({ ...videos[i], type: "video" } as any);
    }

    return combined.slice(0, 3);
  }, [recommendations]);

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-foreground/70">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Loading spinner component
  const LoadingSpinner = ({ size = "w-4 h-4" }: { size?: string }) => (
    <div
      className={`${size} border-2 border-current border-t-transparent rounded-full animate-spin opacity-70`}
    />
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        {/* Hero Header Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-secondary via-secondary/90 to-primary rounded-3xl p-8 md:p-12 shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
                Welcome back, {profile?.profile?.fullName || "User"}! 👋
              </h1>
              <p className="text-white/90 text-lg">
                Here's your food tracking summary and insights
              </p>
            </div>
            
            {/* Log Consumption Button */}
            <button
              onClick={() => setShowConsumptionModal(true)}
              className="flex items-center gap-3 px-8 py-4 bg-white text-secondary rounded-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95"
            >
              <Plus className="w-6 h-6" />
              Log Consumption
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Stats Cards */}
          <div className="xl:col-span-2 space-y-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Items */}
              <div className="group relative bg-white rounded-2xl border border-gray-100 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all"></div>
                
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg">
                      <Package className="w-7 h-7 text-white" />
                    </div>
                    <div title="Total items in your inventory">
                      <Info
                        height={18}
                        width={18}
                        className="text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                      />
                    </div>
                  </div>
                  
                  <p className="text-sm font-medium text-gray-600 mb-1">Items Tracked</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-bold text-gray-900">
                      {dashboardStats.totalItems}
                    </p>
                    {itemsLoading && <LoadingSpinner size="w-5 h-5" />}
                  </div>
                </div>
              </div>

              {/* Expiring Soon */}
              <div className="group relative bg-white rounded-2xl border border-gray-100 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl transition-all ${
                  dashboardStats.expiringItems > 0 ? 'bg-red-100/50 group-hover:bg-red-100' : 'bg-gray-50'
                }`}></div>
                
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg ${
                      dashboardStats.expiringItems > 0 
                        ? 'bg-gradient-to-br from-red-500 to-red-600' 
                        : 'bg-gradient-to-br from-gray-400 to-gray-500'
                    }`}>
                      <Clock className="w-7 h-7 text-white" />
                    </div>
                    <div title="Items expiring within 3 days">
                      <Info
                        height={18}
                        width={18}
                        className="text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                      />
                    </div>
                  </div>
                  
                  <p className="text-sm font-medium text-gray-600 mb-1">Expiring Soon</p>
                  <div className="flex items-baseline gap-2">
                    <p className={`text-4xl font-bold ${
                      dashboardStats.expiringItems > 0 ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {dashboardStats.expiringItems}
                    </p>
                    {itemsLoading && <LoadingSpinner size="w-5 h-5" />}
                  </div>
                  {dashboardStats.expiringItems > 0 && (
                    <button
                      onClick={() => navigate("/inventory")}
                      className="mt-3 text-xs font-semibold text-red-600 hover:text-red-700 underline underline-offset-2"
                    >
                      Check inventory →
                    </button>
                  )}
                </div>
              </div>

              {/* Today's Activity */}
              <div className="group relative bg-white rounded-2xl border border-gray-100 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-2xl group-hover:bg-secondary/10 transition-all"></div>
                
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-secondary to-secondary/80 rounded-xl flex items-center justify-center shadow-lg">
                      <ChefHat className="w-7 h-7 text-white" />
                    </div>
                    <div title="Items consumed today">
                      <Info
                        height={18}
                        width={18}
                        className="text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                      />
                    </div>
                  </div>
                  
                  <p className="text-sm font-medium text-gray-600 mb-1">Today's Activity</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-bold text-gray-900">
                      {dashboardStats.todayConsumption}
                    </p>
                    {consumptionLoading && <LoadingSpinner size="w-5 h-5" />}
                  </div>
                  {dashboardStats.todayConsumption === 0 && (
                    <button
                      onClick={() => navigate("/daily-log")}
                      className="mt-3 text-xs font-semibold text-secondary hover:text-secondary/80 underline underline-offset-2"
                    >
                      Log your first meal →
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Activity Overview Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    Activity Overview
                    {isDataLoading && <LoadingSpinner />}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">Your inventory and consumption summary</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="relative overflow-hidden bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-2xl p-6 border border-secondary/20">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/10 rounded-full blur-xl"></div>
                  <p className="text-sm font-semibold text-secondary/80 mb-2 relative z-10">Total Inventories</p>
                  <p className="text-4xl font-bold text-secondary relative z-10">
                    {dashboardStats.inventoryCount}
                  </p>
                </div>
                <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-xl"></div>
                  <p className="text-sm font-semibold text-gray-700 mb-2 relative z-10">Total Logs</p>
                  <p className="text-4xl font-bold text-gray-900 relative z-10">
                    {dashboardStats.totalConsumptionLogs}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  to="/inventory"
                  className="group flex items-center justify-center gap-2 px-6 py-4 bg-secondary hover:bg-secondary/90 text-white rounded-xl transition-all duration-300 font-bold shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <Package className="w-5 h-5" />
                  Manage Inventory
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/daily-log"
                  className="group flex items-center justify-center gap-2 px-6 py-4 bg-primary hover:bg-primary/90 text-gray-900 rounded-xl transition-all duration-300 font-semibold border-2 border-primary hover:scale-105"
                >
                  <ChefHat className="w-5 h-5" />
                  View Daily Log
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column - Nutrition Chart */}
          <div className="xl:col-span-1">
            <div className="sticky top-8">
              <NutritionRadarChart className="shadow-xl rounded-2xl" />
            </div>
          </div>
        </div>

        {/* Helpful Resources */}
        {dashboardResources.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              Recommended For You
            </h2>
            <Link
              to="/resources"
              className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
            >
              View all resources
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dashboardResources.map((item: any) => {
              const isVideo = item.videoId !== undefined;
              return (
                <div
                  key={item.id}
                  className="group border border-border rounded-lg hover:shadow-md transition-smooth overflow-hidden flex flex-col h-full bg-card"
                >
                  {/* Image/Thumbnail Section */}
                  <div className="relative h-32 w-full bg-muted overflow-hidden">
                    {(isVideo ? item.thumbnailUrl : item.imageUrl) ? (
                      <img
                        src={isVideo ? item.thumbnailUrl : item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-secondary/10">
                        {isVideo ? (
                          <PlayCircle className="w-10 h-10 text-primary/40" />
                        ) : (
                          <BookOpen className="w-10 h-10 text-primary/40" />
                        )}
                      </div>
                    )}

                    {/* Type Badge */}
                    <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs rounded-full flex items-center gap-1">
                      {isVideo ? (
                        <>
                          <PlayCircle className="w-3 h-3" /> Video
                        </>
                      ) : (
                        <>
                          <BookOpen className="w-3 h-3" /> Article
                        </>
                      )}
                    </div>
                  </div>

                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-foreground mb-1 line-clamp-2 leading-tight group-hover:text-primary-dark transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-1">
                      {item.description}
                    </p>

                    {/* {item.recommendationReason && (
                      <p className="text-xs text-primary-dark mb-3 font-bold italic flex items-start gap-1">
                        <span className="shrink-0">💡</span>
                        <span className="line-clamp-2">{item.recommendationReason}</span>
                      </p>
                    )} */}

                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50">
                      <span className="text-xs text-muted-foreground font-medium">
                        {isVideo ? item.channelTitle : item.source}
                      </span>
                      <a
                        href={
                          item.url ||
                          `https://www.youtube.com/watch?v=${item.videoId}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-black hover:text-primary-dark transition-colors flex items-center gap-1"
                      >
                        {isVideo ? "Watch" : "Read"}{" "}
                        <ArrowRight className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Welcome Section for New Users */}
      {dashboardStats.totalItems === 0 && (
        <div className="bg-gray-100 rounded-2xl border border-primary/30 p-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Welcome to NutriAI! 🌱
          </h2>
          <p className="text-muted-foreground mb-6">
            Start tracking your food consumption and reduce waste. Here are some
            quick actions to get you started:
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/inventory"
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition-smooth font-bold"
            >
              Add Your First Item
            </Link>
            <Link
              to="/resources"
              className="px-6 py-3 bg-white border border-gray-100 text-black rounded-lg hover:bg-gray-50 transition-smooth font-bold"
            >
              Learn Best Practices
            </Link>
          </div>
        </div>
      )}

      {/* Direct Consumption Modal */}
      {showConsumptionModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowConsumptionModal(false)}
        >
          <div 
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowConsumptionModal(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
            
            {/* DirectConsumption Component */}
            <div className="p-6">
              <DirectConsumption />
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
