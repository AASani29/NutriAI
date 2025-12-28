import axios from 'axios';

interface NewsArticle {
    title: string;
    description: string;
    url: string;
    urlToImage: string | null;
    source: {
        name: string;
    };
    publishedAt: string;
}

interface NewsAPIResponse {
    status: string;
    totalResults: number;
    articles: NewsArticle[];
}

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

export class NewsAPIService {
    private apiKey: string;
    private baseUrl = 'https://newsapi.org/v2';

    constructor() {
        this.apiKey = process.env.NEWS_API_KEY || '';
        if (!this.apiKey) {
            console.warn('NEWS_API_KEY not set in environment variables');
        }
    }

    /**
     * Search for articles based on keywords
     */
    async searchArticles(
        keywords: string[],
        limit: number = 10
    ): Promise<Article[]> {
        if (!this.apiKey) {
            console.warn('News API key not configured, returning empty results');
            return [];
        }

        try {
            // Combine keywords into a search query
            const query = keywords.slice(0, 3).join(' OR '); // Limit to 3 keywords to avoid too broad search

            const response = await axios.get<NewsAPIResponse>(`${this.baseUrl}/everything`, {
                params: {
                    q: query,
                    language: 'en',
                    sortBy: 'relevancy',
                    pageSize: limit,
                    apiKey: this.apiKey,
                },
                timeout: 3000, // 5 second timeout
            });

            if (response.data.status !== 'ok') {
                console.error('News API returned non-ok status:', response.data);
                return [];
            }

            // Transform to our Article format
            return response.data.articles.map((article: NewsArticle, index: number) => ({
                id: `news-${Date.now()}-${index}`,
                title: article.title,
                description: article.description || '',
                url: article.url,
                imageUrl: article.urlToImage,
                source: article.source.name,
                publishedAt: article.publishedAt,
                recommendationReason: this.determineRecommendationReason(article, keywords),
            }));
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                console.error('News API request failed:', error.message);
                if (error.response?.status === 429) {
                    console.error('News API rate limit exceeded');
                }
            } else {
                console.error('Unexpected error fetching news:', error);
            }
            return [];
        }
    }

    /**
     * Determine why this article is being recommended
     */
    private determineRecommendationReason(article: NewsArticle, keywords: string[]): string {
        const titleLower = article.title.toLowerCase();
        const descLower = (article.description || '').toLowerCase();
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

        // Default
        return 'Food & Sustainability';
    }

    /**
     * Get articles for specific topics with fallback
     */
    async getArticlesByTopic(
        topic: 'budget' | 'waste-reduction' | 'nutrition' | 'general',
        limit: number = 5
    ): Promise<Article[]> {
        const topicKeywords: Record<string, string[]> = {
            budget: ['budget meal planning', 'affordable healthy food', 'save money groceries'],
            'waste-reduction': ['reduce food waste', 'zero waste cooking', 'food storage tips'],
            nutrition: ['healthy eating', 'nutrition tips', 'balanced diet'],
            general: ['sustainable food', 'meal planning', 'cooking tips'],
        };

        return this.searchArticles(topicKeywords[topic], limit);
    }
}

export const newsAPIService = new NewsAPIService();
