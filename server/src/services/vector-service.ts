import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "../config/database";

export class VectorService {
  private genAI: GoogleGenerativeAI;
  private embeddingModel: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
    if (!apiKey) {
      console.warn("⚠️ GEMINI_API_KEY is not set. Vector embeddings will not work.");
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.embeddingModel = this.genAI.getGenerativeModel({ model: "text-embedding-004" });
  }

  /**
   * Generates an embedding for a given text using Gemini's text-embedding-004.
   * Note: This model returns a 768-dimensional vector.
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const result = await this.embeddingModel.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      console.error("Error generating embedding:", error);
      throw new Error("Failed to generate embedding");
    }
  }

  /**
   * Performs a vector similarity search in the health_knowledge table.
   */
  async searchHealthKnowledge(query: string, limit: number = 5): Promise<any[]> {
    const embedding = await this.generateEmbedding(query);
    const vectorString = `[${embedding.join(",")}]`;

    // Prisma doesn't natively support vector comparison yet, so we use $queryRaw
    // We use cosine similarity: 1 - (embedding <=> :vector)
    const results = await prisma.$queryRawUnsafe(`
      SELECT id, content, category, tags, metadata, 
      (1 - (embedding <=> '${vectorString}'::vector)) as similarity
      FROM health_knowledge
      ORDER BY similarity DESC
      LIMIT ${limit};
    `);

    return results as any[];
  }

  /**
   * Performs a vector similarity search in the user_health_memory table for a specific user.
   */
  async searchUserHealthMemory(userId: string, query: string, limit: number = 3): Promise<any[]> {
    const embedding = await this.generateEmbedding(query);
    const vectorString = `[${embedding.join(",")}]`;

    const results = await prisma.$queryRawUnsafe(`
      SELECT id, content, source, 
      (1 - (embedding <=> '${vectorString}'::vector)) as similarity
      FROM user_health_memory
      WHERE "userId" = '${userId}'
      ORDER BY similarity DESC
      LIMIT ${limit};
    `);

    return results as any[];
  }

  /**
   * Saves a new memory for a user with its embedding.
   */
  async saveUserHealthMemory(userId: string, content: string, source: string): Promise<void> {
    const embedding = await this.generateEmbedding(content);
    const vectorString = `[${embedding.join(",")}]`;

    await prisma.$executeRawUnsafe(`
      INSERT INTO user_health_memory (id, "userId", content, source, embedding, "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), '${userId}', $1, $2, '${vectorString}'::vector, NOW(), NOW())
    `, content, source);
  }

  /**
   * Saves a piece of general health knowledge with its embedding.
   */
  async saveHealthKnowledge(content: string, category: string, tags: string[] = [], metadata: any = {}): Promise<void> {
    const embedding = await this.generateEmbedding(content);
    const vectorString = `[${embedding.join(",")}]`;

    await prisma.$executeRawUnsafe(`
      INSERT INTO health_knowledge (id, content, category, tags, metadata, embedding, "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), $1, $2, $3, $4::jsonb, '${vectorString}'::vector, NOW(), NOW())
    `, content, category, tags, JSON.stringify(metadata));
  }
}

export const vectorService = new VectorService();
