import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  Package,
  ChefHat,
  Lightbulb,
  ArrowRight,
  Target,
  Leaf,
  BookOpen,
  BarChart
} from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { useInventory } from '../hooks/useInventory';
import { getPersonalizedRecommendations } from '../services/resources-service';
import { BASE_URL } from '../services/utils';
import { useAuth } from '@clerk/clerk-react';
import type { Article, Video } from '../types/resource-types';
import { PlayCircle } from 'lucide-react';

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
  const { data: inventories = [], isLoading: inventoriesLoading } = useGetInventories();

  // Memoize consumption query params to prevent refetches
  const consumptionParams = useMemo(() => ({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  }), [dateRange.startDate, dateRange.endDate]);

  const { data: consumptionLogsData, isLoading: consumptionLoading } = useGetConsumptionLogs(consumptionParams);

  const consumptionLogs = consumptionLogsData?.consumptionLogs || [];

  // Fetch personalized AI recommendations
  const { data: recommendations, isLoading: recommendationsLoading } = useQuery({
    queryKey: ['personalizedRecommendations'],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return getPersonalizedRecommendations(token);
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    enabled: isSignedIn && !profileLoading, // Only fetch when signed in and profile loaded
    retry: 1, // Only retry once on failure
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
  });

  // Fetch analytics data with stable query key
  const { data: consumptionPatterns, isLoading: patternsLoading } = useQuery({
    queryKey: [
      'consumption-patterns',
      {
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
      }
    ],
    queryFn: async (): Promise<ConsumptionPattern> => {
      const params = new URLSearchParams({
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
      });
      const response = await fetch(`${BASE_URL}/inventories/analytics/consumption-patterns?${params}`, {
        headers: {
          'Authorization': `Bearer ${await (window as any).Clerk?.session?.getToken()}`,
        },
      });
      if (!response.ok) return { byCategory: [], byTime: [], wasteReduction: { wastePrevented: 0, wasteReductionPercentage: 0 } };
      const data = await response.json();
      return data.patterns;
    },
    enabled: !profileLoading,
  });

  // Get all inventory items for comprehensive stats
  // Memoize inventory IDs to prevent unnecessary refetches
  const inventoryIds = useMemo(() =>
    inventories.map(inv => inv.id).sort(), // Sort for consistent ordering
    [inventories]
  );

  const { data: allInventoryItems = [], isLoading: itemsLoading } = useQuery({
    queryKey: ['all-inventory-items', inventoryIds],
    queryFn: async () => {
      if (!inventories.length) return [];

      const allItems = [];
      for (const inventory of inventories) {
        try {
          const response = await fetch(`${BASE_URL}/inventories/${inventory.id}/items`, {
            headers: {
              'Authorization': `Bearer ${await (window as any).Clerk?.session?.getToken()}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            allItems.push(...(data.items || []));
          }
        } catch (error) {
          console.error(`Error fetching items for inventory ${inventory.id}:`, error);
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
    const expiringItems = allInventoryItems.filter(item => {
      if (!item.expiryDate) return false;
      const expiryDate = new Date(item.expiryDate);
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 3 && daysUntilExpiry >= 0;
    }).length;

    // Today's consumption
    const todayConsumption = consumptionLogs.filter(log =>
      new Date(log.consumedAt).toDateString() === todayStr
    );

    // Waste prevented (simplified calculation)
    const wastePreventedKg = consumptionPatterns?.wasteReduction?.wastePrevented || 0;

    // Most consumed category
    const categoryStats = consumptionPatterns?.byCategory || [];
    const topCategory = categoryStats.sort((a, b) => b.quantityConsumed - a.quantityConsumed)[0];

    // Recent trend (comparing last 7 days vs previous 7 days)
    const last7Days = consumptionLogs.filter(log => {
      const logDate = new Date(log.consumedAt);
      const daysDiff = Math.ceil((today.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff <= 7;
    });

    const previous7Days = consumptionLogs.filter(log => {
      const logDate = new Date(log.consumedAt);
      const daysDiff = Math.ceil((today.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff > 7 && daysDiff <= 14;
    });

    const recentTrend = last7Days.length - previous7Days.length;

    return {
      totalItems,
      expiringItems,
      todayConsumption: todayConsumption.length,
      wastePreventedKg: Math.round(wastePreventedKg * 100) / 100,
      topCategory: topCategory?.category || 'N/A',
      recentTrend,
      inventoryCount: inventories.length,
      totalConsumptionLogs: consumptionLogsData?.totalCount || consumptionLogs.length,
    };
  }, [allInventoryItems, consumptionLogsData, consumptionPatterns, inventories]);

  // Check if core data is loading
  const isInitialLoading = profileLoading || inventoriesLoading;
  const isDataLoading = consumptionLoading || itemsLoading || patternsLoading || recommendationsLoading;

  // Get top 3 mixed recommendations for dashboard display
  const dashboardResources = useMemo(() => {
    if (!recommendations) return [];

    const articles = recommendations.articles || [];
    const videos = recommendations.videos || [];

    // Interleave articles and videos for variety
    const combined: (Article | Video)[] = [];
    const maxLength = Math.max(articles.length, videos.length);

    for (let i = 0; i < maxLength; i++) {
      if (i < articles.length) combined.push({ ...articles[i], type: 'article' } as any);
      if (i < videos.length) combined.push({ ...videos[i], type: 'video' } as any);
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
    <div className={`${size} border-2 border-current border-t-transparent rounded-full animate-spin opacity-70`} />
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome back, {profile?.profile?.fullName || 'User'}! 👋
        </h1>
        <p className="text-muted-foreground">
          Here's your food tracking summary and insights
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Items */}
        <div className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-smooth">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-black" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Items Tracked</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-foreground">{dashboardStats.totalItems}</p>
                {itemsLoading && <LoadingSpinner />}
              </div>
            </div>
          </div>
        </div>

        {/* Expiring Soon */}
        <div className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-smooth">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${dashboardStats.expiringItems > 0 ? 'bg-red-50' : 'bg-primary/20'
              }`}>
              <Clock className={`w-6 h-6 ${dashboardStats.expiringItems > 0 ? 'text-red-600' : 'text-black'
                }`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Expiring Soon</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-foreground">{dashboardStats.expiringItems}</p>
                {itemsLoading && <LoadingSpinner />}
              </div>
            </div>
          </div>
        </div>

        {/* Today's Activity */}
        <div className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-smooth">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-black" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Today's Activity</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-foreground">{dashboardStats.todayConsumption}</p>
                {consumptionLoading && <LoadingSpinner />}
              </div>
            </div>
          </div>
        </div>

        {/* Waste Prevented */}
        <div className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-smooth">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
              <Leaf className="w-6 h-6 text-black" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Waste Prevented</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-foreground">{dashboardStats.wastePreventedKg} kg</p>
                {patternsLoading && <LoadingSpinner />}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Overview & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Summary */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <BarChart className="w-5 h-5" />
              Activity Overview
              {isDataLoading && <LoadingSpinner />}
            </h2>
            <div className="flex items-center gap-2">
              {!consumptionLoading && (
                dashboardStats.recentTrend > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : dashboardStats.recentTrend < 0 ? (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                ) : null
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-background rounded-lg">
              <p className="text-2xl font-bold text-primary-dark">{dashboardStats.inventoryCount}</p>
              <p className="text-sm text-muted-foreground">Inventories</p>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <p className="text-2xl font-bold text-black">{dashboardStats.totalConsumptionLogs}</p>
              <p className="text-sm text-muted-foreground">Total Logs</p>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <p className="text-2xl font-bold text-black">{dashboardStats.topCategory}</p>
              <p className="text-sm text-muted-foreground">Top Category</p>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <p className="text-2xl font-bold text-black">
                {consumptionPatterns?.wasteReduction?.wasteReductionPercentage || 0}%
              </p>
              <p className="text-sm text-muted-foreground">Waste Reduced</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex flex-wrap gap-2">
              <Link
                to="/inventory"
                className="px-4 py-2 bg-primary text-black rounded-lg hover:bg-primary-dark transition-smooth font-bold text-sm"
              >
                Manage Inventory
              </Link>
              <Link
                to="/daily-log"
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-smooth font-medium text-sm"
              >
                View Daily Log
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-linear-to-br from-primary/10 to-secondary/10 rounded-xl border border-border p-6">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Quick Actions
          </h2>
          <div className="space-y-3">
            {dashboardStats.expiringItems > 0 && (
              <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">
                    {dashboardStats.expiringItems} items expiring soon!
                  </p>
                  <Link
                    to="/inventory"
                    className="text-xs text-red-600 hover:text-red-800 underline font-bold"
                  >
                    Check inventory →
                  </Link>
                </div>
              </div>
            )}

            {dashboardStats.todayConsumption === 0 && (
              <div className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                <ChefHat className="w-5 h-5 text-black shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-black/80">
                    No activity logged today
                  </p>
                  <Link
                    to="/daily-log"
                    className="text-xs text-black hover:text-primary-dark underline font-bold"
                  >
                    Log consumption →
                  </Link>
                </div>
              </div>
            )}

            {dashboardStats.totalItems === 0 && (
              <div className="flex items-center gap-3 p-3 bg-primary/20 border border-primary/30 rounded-lg">
                <Package className="w-5 h-5 text-black shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    Start tracking your food
                  </p>
                  <Link
                    to="/inventory"
                    className="text-xs text-black hover:text-primary-dark underline font-bold"
                  >
                    Add your first item →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Helpful Resources */}
      {dashboardResources.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-6">
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
                    {((isVideo ? item.thumbnailUrl : item.imageUrl)) ? (
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
                        <><PlayCircle className="w-3 h-3" /> Video</>
                      ) : (
                        <><BookOpen className="w-3 h-3" /> Article</>
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

                    {item.recommendationReason && (
                      <p className="text-xs text-primary-dark mb-3 font-bold italic flex items-start gap-1">
                        <span className="shrink-0">💡</span>
                        <span className="line-clamp-2">{item.recommendationReason}</span>
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50">
                      <span className="text-xs text-muted-foreground font-medium">
                        {isVideo ? item.channelTitle : item.source}
                      </span>
                      <a
                        href={item.url || `https://www.youtube.com/watch?v=${item.videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-black hover:text-primary-dark transition-colors flex items-center gap-1"
                      >
                        {isVideo ? 'Watch' : 'Read'} <ArrowRight className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Welcome Section for New Users */}
      {dashboardStats.totalItems === 0 && (
        <div className="bg-primary/20 rounded-2xl border border-primary/30 p-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Welcome to NutriAI! 🌱
          </h2>
          <p className="text-muted-foreground mb-6">
            Start tracking your food consumption and reduce waste. Here are some quick actions to get you started:
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
    </div>
  );
}