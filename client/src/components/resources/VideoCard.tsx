import { useState } from 'react';
import { Play, Eye, Calendar, User } from 'lucide-react';
import type { Video } from '../../types/resource-types';
import { RecommendationBadge } from './RecommendationBadge';

interface VideoCardProps {
    video: Video;
}

export function VideoCard({ video }: VideoCardProps) {
    const [showPlayer, setShowPlayer] = useState(false);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatViewCount = (count: number): string => {
        if (count >= 1000000) {
            return `${(count / 1000000).toFixed(1)}M`;
        }
        if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}K`;
        }
        return count.toString();
    };

    const embedUrl = `https://www.youtube.com/embed/${video.videoId}`;
    const watchUrl = `https://www.youtube.com/watch?v=${video.videoId}`;

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
            {/* Thumbnail or Player */}
            <div className="relative aspect-video bg-gray-900">
                {showPlayer ? (
                    <iframe
                        src={embedUrl}
                        title={video.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                ) : (
                    <>
                        <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                            <button
                                onClick={() => setShowPlayer(true)}
                                className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4 transform scale-100 group-hover:scale-110 transition-transform shadow-lg"
                                aria-label="Play video"
                            >
                                <Play className="h-6 w-6 fill-current" />
                            </button>
                        </div>
                        <div className="absolute top-2 right-2">
                            <RecommendationBadge reason={video.recommendationReason} />
                        </div>
                    </>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {video.title}
                </h3>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {video.description}
                </p>

                {/* Metadata */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span className="truncate">{video.channelTitle}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{formatViewCount(video.viewCount)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(video.publishedAt)}</span>
                        </div>
                    </div>
                </div>

                {/* Watch on YouTube Link */}
                {!showPlayer && (
                    <a
                        href={watchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                    >
                        Watch on YouTube
                    </a>
                )}
            </div>
        </div>
    );
}
