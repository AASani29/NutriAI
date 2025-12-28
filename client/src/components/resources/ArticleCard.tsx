import { ExternalLink, Calendar, Building2 } from 'lucide-react';
import type { Article } from '../../types/resource-types';
import { RecommendationBadge } from './RecommendationBadge';

interface ArticleCardProps {
    article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
            {/* Image */}
            {article.imageUrl && (
                <div className="relative h-48 overflow-hidden bg-gray-100">
                    <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                    <div className="absolute top-2 right-2">
                        <RecommendationBadge reason={article.recommendationReason} />
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="p-4">
                {!article.imageUrl && (
                    <div className="mb-2">
                        <RecommendationBadge reason={article.recommendationReason} />
                    </div>
                )}

                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                    {article.title}
                </h3>

                <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {article.description}
                </p>

                {/* Metadata */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        <span className="truncate">{article.source}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(article.publishedAt)}</span>
                    </div>
                </div>

                {/* Read More Link */}
                <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
                >
                    Read Article
                    <ExternalLink className="h-3 w-3" />
                </a>
            </div>
        </div>
    );
}
