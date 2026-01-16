import { DollarSign, Leaf, Heart, Utensils, Sparkles } from 'lucide-react';

interface RecommendationBadgeProps {
    reason: string;
}

export function RecommendationBadge({ reason }: RecommendationBadgeProps) {
    const getBadgeConfig = (reason: string) => {
        const reasonLower = reason.toLowerCase();

        if (reasonLower.includes('budget')) {
            return {
                icon: DollarSign,
                color: 'bg-primary/20 text-secondary border-primary/30',
                label: 'Budget-Friendly',
            };
        }

        if (reasonLower.includes('waste')) {
            return {
                icon: Leaf,
                color: 'bg-secondary/10 text-secondary border-secondary/20',
                label: 'Waste Reduction',
            };
        }

        if (reasonLower.includes('nutrition')) {
            return {
                icon: Heart,
                color: 'bg-orange-50 text-orange-700 border-orange-100',
                label: 'Nutrition',
            };
        }

        if (reasonLower.includes('meal')) {
            return {
                icon: Utensils,
                color: 'bg-amber-50 text-amber-700 border-amber-100',
                label: 'Meal Planning',
            };
        }

        // Default
        return {
            icon: Sparkles,
            color: 'bg-gray-50 text-muted-foreground border-gray-100',
            label: reason,
        };
    };

    const config = getBadgeConfig(reason);
    const Icon = config.icon;

    return (
        <div
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}
            title={`Recommended for: ${config.label}`}
        >
            <Icon className="h-3 w-3" />
            <span>{config.label}</span>
        </div>
    );
}
