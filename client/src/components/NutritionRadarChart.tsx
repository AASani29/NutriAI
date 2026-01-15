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
    <div className={`bg-white rounded-lg shadow-md p-6 ${className} `}>
      {/* Header with toggle */}
      <div className="flex justify-between items-center mb-6 ">
        <h2 className="text-xl font-bold text-gray-800">Nutrition Intake</h2>

        {/* Period Toggle Dropdown */}
        <div className="relative inline-block ">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm"
          >
            <span className="text-sm font-medium capitalize">{period}</span>
            <ChevronDown
              size={16}
              className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              {["daily", "monthly"].map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setPeriod(p as "daily" | "monthly");
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm capitalize transition-colors ${
                    period === p
                      ? "bg-blue-50 text-blue-600 font-medium"
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
        <div className="flex items-center justify-center h-20 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-600 text-sm">Loading nutrition data...</p>
          </div>
        </div>
      ) : stats ? (
        <>
          <ResponsiveContainer width="100%" height={210}>
            <RadarChart
                data={chartData}
                margin={{ top: 0, right: 80, bottom: 20, left: 80 }}
                >
              <PolarGrid strokeDasharray="10 10" stroke="#e0e0e0" />
              <PolarAngleAxis
                dataKey="name"
                tick={{ fill: "#666", fontSize: 16 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, "auto"]}
                tick={{ fill: "#999", fontSize: 14, dx: 36, dy:10 }}
                tickSize={10}
              />

              {/* Actual intake - Blue Triangle */}
              <Radar
                name="Actual"
                dataKey="actual"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.5}
                strokeWidth={2.5}
              />

              {/* Recommended intake - Green Triangle */}
              <Radar
                name="Goal"
                dataKey="recommended"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.2}
                strokeWidth={2.5}
              />

              <Legend wrapperStyle={{ paddingTop: "20px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "8px 12px",
                }}
                formatter={(value: number) => value.toFixed(1)}
              />
            </RadarChart>
          </ResponsiveContainer>

          {/* Stats Summary Below Chart */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            {[
              {
                label: "Protein",
                actual: stats.totals.protein,
                recommended: stats.recommended.protein,
                percentage: stats.percentage.protein,
                color: "blue",
              },
              {
                label: "Carbs",
                actual: stats.totals.carbohydrates,
                recommended: stats.recommended.carbohydrates,
                percentage: stats.percentage.carbohydrates,
                color: "emerald",
              },
              {
                label: "Fat",
                actual: stats.totals.fat,
                recommended: stats.recommended.fat,
                percentage: stats.percentage.fat,
                color: "orange",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`bg-${stat.color}-50 rounded-lg p-3 border border-${stat.color}-200`}
              >
                <p className="text-xs text-gray-600 mb-1">{stat.label}</p>
                <p className={`text-sm font-bold text-${stat.color}-700`}>
                  {stat.actual.toFixed(1)}g / {stat.recommended}g
                </p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`bg-${stat.color}-500 h-2 rounded-full transition-all`}
                    style={{
                      width: `${Math.min(stat.percentage, 100)}%`,
                    }}
                  ></div>
                </div>
                <p
                  className={`text-xs mt-1 text-${stat.color}-600 font-medium`}
                >
                  {stat.percentage}%
                </p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-sm">No nutrition data available</p>
        </div>
      )}
    </div>
  );
}
