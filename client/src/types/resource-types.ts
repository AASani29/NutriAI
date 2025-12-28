export interface Article {
    id: string;
    title: string;
    description: string;
    url: string;
    imageUrl: string | null;
    source: string;
    publishedAt: string;
    recommendationReason: string;
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

export interface PersonalizedRecommendations {
    articles: Article[];
    videos: Video[];
    userProfile: {
        wasteReductionPercentage: number;
        spendingTier: string;
        primaryConcerns: string[];
        budgetRange: number | null;
    };
}
