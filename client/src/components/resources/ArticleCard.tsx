import { ExternalLink, Calendar, Building2 } from 'lucide-react';
import type { Article } from '../../types/resource-types';

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
                    {/* <div className="absolute top-2 right-2">
                        <RecommendationBadge reason={article.recommendationReason} />
                    </div> */}
                </div>
            )}

            {/* Content */}
            <div className="p-6">
                {/* {!article.imageUrl && (
                    <div className="mb-2">
                        <RecommendationBadge reason={article.recommendationReason} />
                    </div>
                )} */}

                <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-secondary transition-colors tracking-tight">
                    {article.title}
                </h3>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-3 font-medium leading-relaxed">
                    {article.description}
                </p>

                {/* Metadata */}
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-5 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5" />
                        <span className="truncate">{article.source}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDate(article.publishedAt)}</span>
                    </div>
                </div>

                {/* Read More Link */}
                <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-bold text-secondary hover:text-secondary/80 transition-all group/link"
                >
                    Read Article
                    <ExternalLink className="h-4 w-4 group-hover/link:translate-x-0.5 transition-transform" />
                </a>
            </div>
        </div>
    );
}
