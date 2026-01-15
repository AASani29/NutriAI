import { useState } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useNutritionStats } from "../hooks/useNutritionStats";
import { ChevronDown } from "lucide-react";

interface NutritionRadarChartProps {
  className?: string;
}

export default function NutritionRadarChart({
  className = "",
}: NutritionRadarChartProps) {
  const [period, setPeriod] = useState<"daily" | "monthly">("daily");
  const [isOpen, setIsOpen] = useState(false);

  const { data: stats, isLoading, error } = useNutritionStats(period);

  if (error) {
    return (
      <div
        className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}
      >
        <p className="text-red-800 text-sm">Failed to load nutrition data</p>
      </div>
    );
  }

  // Prepare data for radar chart
  const chartData = stats
    ? [
        {
          name: "Protein (g)",
          actual: stats.totals.protein,
          recommended: stats.recommended.protein,
          fullMark:
            Math.max(stats.totals.protein, stats.recommended.protein) * 1.2,
        },
        {
          name: "Carbs (g)",
          actual: stats.totals.carbohydrates,
          recommended: stats.recommended.carbohydrates,
          fullMark:
            Math.max(
              stats.totals.carbohydrates,
              stats.recommended.carbohydrates
            ) * 1.2,
        },
        {
          name: "Fat (g)",
          actual: stats.totals.fat,
          recommended: stats.recommended.fat,
          fullMark: Math.max(stats.totals.fat, stats.recommended.fat) * 1.2,
        },
      ]
    : [];

  return (
    <div className={`bg-card rounded-2xl border border-border p-6 ${className} `}>
      {/* Header with toggle */}
      <div className="flex justify-between items-center mb-6 ">
        <h2 className="text-xl font-bold text-foreground">Nutrition Intake</h2>

        {/* Period Toggle Dropdown */}
        <div className="relative inline-block ">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-xl hover:bg-secondary/90 transition-all shadow-md group"
          >
            <span className="text-sm font-bold capitalize">{period}</span>
            <ChevronDown
              size={16}
              className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-xl shadow-xl z-10 animate-in fade-in zoom-in-95 duration-200">
              {["daily", "monthly"].map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setPeriod(p as "daily" | "monthly");
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-sm capitalize transition-colors first:rounded-t-xl last:rounded-b-xl ${
                    period === p
                      ? "bg-primary/20 text-secondary font-bold"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chart Container */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48 bg-gray-50/50 rounded-2xl">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-secondary rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-600 text-sm font-medium">Loading nutrition data...</p>
          </div>
        </div>
      ) : stats ? (
        <>
          <ResponsiveContainer width="100%" height={210}>
            <RadarChart
                data={chartData}
                margin={{ top: 0, right: 80, bottom: 20, left: 80 }}
                >
              <PolarGrid strokeDasharray="10 10" stroke="#F4DCC8" />
              <PolarAngleAxis
                dataKey="name"
                tick={{ fill: "#3E2723", fontSize: 13, fontWeight: 600 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, "auto"]}
                tick={{ fill: "#8B6F47", fontSize: 12, dx: 36, dy:10 }}
                tickSize={10}
              />

              {/* Actual intake - Terracotta Triangle */}
              <Radar
                name="Actual"
                dataKey="actual"
                stroke="#D2691E"
                fill="#D2691E"
                fillOpacity={0.5}
                strokeWidth={3}
              />

              {/* Recommended intake - Peach Triangle */}
              <Radar
                name="Goal"
                dataKey="recommended"
                stroke="#FFB88C"
                fill="#FFB88C"
                fillOpacity={0.2}
                strokeWidth={3}
              />

              <Legend wrapperStyle={{ paddingTop: "20px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #F4DCC8",
                  borderRadius: "12px",
                  padding: "10px 14px",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                }}
                formatter={(value: any) => (typeof value === 'number' ? value.toFixed(1) : value)}
              />
            </RadarChart>
          </ResponsiveContainer>

          {/* Stats Summary Below Chart */}
          <div className="mt-6 grid grid-cols-1 gap-3">
            {[
              {
                label: "Protein",
                actual: stats.totals.protein,
                recommended: stats.recommended.protein,
                percentage: stats.percentage.protein,
                color: "#FFB88C", // Primary
                bg: "rgba(255, 184, 140, 0.1)",
              },
              {
                label: "Carbs",
                actual: stats.totals.carbohydrates,
                recommended: stats.recommended.carbohydrates,
                percentage: stats.percentage.carbohydrates,
                color: "#D2691E", // Secondary
                bg: "rgba(210, 105, 30, 0.1)",
              },
              {
                label: "Fat",
                actual: stats.totals.fat,
                recommended: stats.recommended.fat,
                percentage: stats.percentage.fat,
                color: "#8B4513", // Saddle Brown / Accent
                bg: "rgba(139, 69, 19, 0.1)",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-bold text-gray-700">{stat.label}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {stat.percentage}% Goal
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-1000 shadow-sm"
                        style={{
                          width: `${Math.min(stat.percentage, 100)}%`,
                          backgroundColor: stat.color,
                        }}
                      ></div>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-gray-900 min-w-[80px] text-right">
                    {typeof stat.actual === 'number' ? stat.actual.toFixed(1) : 0}g <span className="text-gray-400 font-normal">/ {stat.recommended || 0}g</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-48 bg-gray-50/50 rounded-2xl">
          <p className="text-gray-500 text-sm font-medium">No nutrition data available</p>
        </div>
      )}
    </div>
  );
}
