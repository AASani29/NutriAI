import { tavily } from '@tavily/core';
import { connection } from '../config/queue';

class TavilyService {
    private client: any;
    private readonly REDIS_TTL = 86400; // 24 hours in seconds

    constructor() {
        this.client = tavily({ apiKey: process.env.TAVILY_API_KEY || '' });
    }

    /**
     * Search for current market prices for a specific query
     * @param query The search query (e.g. "price of 1kg onion in Bangladesh")
     * @returns Search results as a string context
     */
    async searchPrices(query: string): Promise<string> {
        const cacheKey = `tavily:price:${query.toLowerCase().replace(/\s+/g, '_')}`;

        // 1. Try Cache
        try {
            const cached = await connection.get(cacheKey);
            if (cached) {
                console.log(`⚡ [Tavily] Returning cached price search for: "${query}"`);
                return cached;
            }
        } catch (err) {
            console.warn('Redis cache read error:', err);
        }

        // 2. Fetch from Tavily
        try {
            console.log(`🔍 [Tavily] Searching web for: "${query}"...`);
            const response = await this.client.search(query, {
                search_depth: "basic",
                include_domains: [
                    "chaldal.com",
                    "shwapno.com",
                    "daraz.com.bd",
                    "khaasfood.com",
                    "numbeo.com",
                    "globalproductprices.com"
                ],
                max_results: 5,
            });

            const context = response.results
                .map((r: any) => `- [${r.title}](${r.url}): ${r.content}`)
                .join('\n');

            if (!context) {
                return "No specific price information found.";
            }

            // 3. Save to Cache
            try {
                await connection.setex(cacheKey, this.REDIS_TTL, context);
            } catch (err) {
                console.warn('Redis cache write error:', err);
            }

            return context;
        } catch (error: any) {
            console.error('Tavily search error:', error);
            return "Unable to retrieve real-time prices at this moment.";
        }
    }
}

export const tavilyService = new TavilyService();
