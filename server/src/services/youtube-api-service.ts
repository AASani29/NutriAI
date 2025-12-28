import axios from 'axios';

interface YouTubeSearchResult {
    id: {
        videoId: string;
    };
    snippet: {
        title: string;
        description: string;
        thumbnails: {
            high: {
                url: string;
            };
        };
        channelTitle: string;
        publishedAt: string;
    };
}

interface YouTubeVideoStatistics {
    viewCount: string;
    likeCount: string;
}

interface YouTubeVideoDetails {
    id: string;
    statistics: YouTubeVideoStatistics;
}

interface YouTubeSearchResponse {
    items: YouTubeSearchResult[];
}

interface YouTubeVideosResponse {
    items: YouTubeVideoDetails[];
}

export interface Video {
    id: string;
    title: string;
    description: string;
    videoId: string;
    thumbnailUrl: string;
    channelTitle: string;
    publishedAt: string;
    viewCount: number;
    recommendationReason: string;
}

export class YouTubeAPIService {
    private apiKey: string;
    private baseUrl = 'https://www.googleapis.com/youtube/v3';

    constructor() {
        this.apiKey = process.env.YOUTUBE_API_KEY || '';
        if (!this.apiKey) {
            console.warn('YOUTUBE_API_KEY not set in environment variables');
        }
    }

    /**
     * Search for videos based on keywords
     */
    async searchVideos(
        keywords: string[],
        limit: number = 10
    ): Promise<Video[]> {
        if (!this.apiKey) {
            console.warn('YouTube API key not configured, returning empty results');
            return [];
        }

        try {
            // Combine keywords into a search query
            const query = keywords.slice(0, 3).join(' ');

            // Search for videos
            const searchResponse = await axios.get<YouTubeSearchResponse>(`${this.baseUrl}/search`, {
                params: {
                    part: 'snippet',
                    q: query,
                    type: 'video',
                    maxResults: limit,
                    order: 'relevance',
                    videoDuration: 'medium', // 4-20 minutes
                    key: this.apiKey,
                },
                timeout: 5000,
            });

            if (!searchResponse.data.items || searchResponse.data.items.length === 0) {
                return [];
            }

            // Get video IDs for statistics
            const videoIds = searchResponse.data.items
                .map(item => item.id.videoId)
                .filter(Boolean)
                .join(',');

            // Fetch video statistics
            const statsResponse = await axios.get<YouTubeVideosResponse>(`${this.baseUrl}/videos`, {
                params: {
                    part: 'statistics',
                    id: videoIds,
                    key: this.apiKey,
                },
                timeout: 5000,
            });

            // Create a map of video statistics
            const statsMap = new Map<string, YouTubeVideoStatistics>();
            statsResponse.data.items.forEach((item: YouTubeVideoDetails) => {
                statsMap.set(item.id, item.statistics);
            });

            // Transform to our Video format
            return searchResponse.data.items.map((item: YouTubeSearchResult, index: number) => {
                const stats = statsMap.get(item.id.videoId);
                return {
                    id: `youtube-${Date.now()}-${index}`,
                    title: item.snippet.title,
                    description: item.snippet.description,
                    videoId: item.id.videoId,
                    thumbnailUrl: item.snippet.thumbnails.high.url,
                    channelTitle: item.snippet.channelTitle,
                    publishedAt: item.snippet.publishedAt,
                    viewCount: stats ? parseInt(stats.viewCount, 10) : 0,
                    recommendationReason: this.determineRecommendationReason(item, keywords),
                };
            });
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                console.error('YouTube API request failed:', error.message);
                if (error.response?.status === 403) {
                    console.error('YouTube API quota exceeded or invalid API key');
                }
            } else {
                console.error('Unexpected error fetching YouTube videos:', error);
            }
            return [];
        }
    }

    /**
     * Determine why this video is being recommended
     */
    private determineRecommendationReason(video: YouTubeSearchResult, keywords: string[]): string {
        const titleLower = video.snippet.title.toLowerCase();
        const descLower = video.snippet.description.toLowerCase();
        const content = `${titleLower} ${descLower}`;

        // Check for budget-related content
        if (content.includes('budget') || content.includes('cheap') || content.includes('affordable')) {
            return 'Budget-Friendly';
        }

        // Check for waste reduction content
        if (content.includes('waste') || content.includes('leftover') || content.includes('zero waste')) {
            return 'Waste Reduction';
        }

        // Check for nutrition content
        if (content.includes('nutrition') || content.includes('healthy') || content.includes('diet')) {
            return 'Nutrition';
        }

        // Check for meal planning
        if (content.includes('meal plan') || content.includes('meal prep')) {
            return 'Meal Planning';
        }

        // Check for cooking/recipe content
        if (content.includes('recipe') || content.includes('cooking') || content.includes('how to cook')) {
            return 'Cooking Tips';
        }

        // Default
        return 'Food & Sustainability';
    }

    /**
     * Get videos for specific topics with fallback
     */
    async getVideosByTopic(
        topic: 'budget' | 'waste-reduction' | 'nutrition' | 'cooking' | 'general',
        limit: number = 5
    ): Promise<Video[]> {
        const topicKeywords: Record<string, string[]> = {
            budget: ['budget meal prep', 'cheap healthy recipes', 'affordable cooking'],
            'waste-reduction': ['reduce food waste', 'zero waste kitchen', 'food storage hacks'],
            nutrition: ['healthy eating tips', 'nutrition guide', 'balanced diet'],
            cooking: ['easy recipes', 'cooking tips', 'meal prep'],
            general: ['sustainable cooking', 'food tips', 'kitchen hacks'],
        };

        return this.searchVideos(topicKeywords[topic], limit);
    }

    /**
     * Get video embed URL
     */
    getEmbedUrl(videoId: string): string {
        return `https://www.youtube.com/embed/${videoId}`;
    }

    /**
     * Get video watch URL
     */
    getWatchUrl(videoId: string): string {
        return `https://www.youtube.com/watch?v=${videoId}`;
    }
}

export const youtubeAPIService = new YouTubeAPIService();
