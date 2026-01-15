import Groq from 'groq-sdk';
import prisma from '../../config/database';
import { vectorService } from '../../services/vector-service';
import { userAnalyticsService } from '../../services/user-analytics-service';

export class HealthAdvisorService {
  private groq: Groq;

  constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  /**
   * Generates a personalized health advice response for a user based on their context and RAG.
   */
  async getHealthAdvice(userId: string, userQuery: string) {
    // 1. Fetch User Profile & Goals
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { profile: true }
    });

    if (!user) throw new Error('User not found');

    // 2. Fetch Recent Activities/Patterns (Context Window)
    const recentPatterns = await userAnalyticsService.getUserAnalytics(user.id);
    
    // 3. RAG: Retrieve Semantic Context from Knowledge Base
    const healthKnowledge = await vectorService.searchHealthKnowledge(userQuery, 3);
    const userMemories = await vectorService.searchUserHealthMemory(user.id, userQuery, 3);

    const ragContext = healthKnowledge.map(k => k.content).join("\n\n");
    const memoryContext = userMemories.map(m => m.content).join("\n\n");

    // 4. Construct Augmented Prompt
    const systemPrompt = `You are the NutriAI Health Advisor. Your goal is to provide hyper-personalized, data-driven health and nutrition advice.

### USER CONTEXT:
- Profile: ${user.profile?.fullName || 'User'}, ${user.profile?.dietaryPreference || 'No specific diet'}, BMI: ${this.calculateBMI(user.profile)}
- Health Conditions: ${user.profile?.healthConditions || 'None reported'}
- Allergies: ${user.profile?.allergies || 'None reported'}
- Recent Patterns: Waste reduction ${recentPatterns.wasteReductionPercentage}%, Primary concerns: ${recentPatterns.primaryConcerns.join(', ')}
- Nutrition Goals: ${JSON.stringify({ 
    protein: (user.profile as any)?.proteinGoal, 
    carbs: (user.profile as any)?.carbGoal, 
    fat: (user.profile as any)?.fatGoal, 
    energy: (user.profile as any)?.energyGoal 
  })}

### RELEVANT HEALTH KNOWLEDGE (RAG):
${ragContext}

### USER SPECIFIC MEMORIES:
${memoryContext}

### INSTRUCTIONS:
1. Provide advice that directly addresses the user's query while respecting their health conditions and allergies.
2. Use the provided "Health Knowledge" to ground your advice in scientific/nutritional facts.
3. If nutrition goals are set, reference how the advice aligns with them.
4. Keep the tone professional, encouraging, and empathetic.
5. In Bangladesh context, prefer local food names/solutions when appropriate.
6. MANDATORY: If the query is outside nutrition/health (e.g., weather, politics), politely direct the user back to health topics.
7. NEVER dump raw JSON context or excessive semantic data unless explicitly asked for a summary. Stay concise and actionable.

Response should be structured in Markdown.`;

    // 5. Generate Response via Groq
    const completion = await this.groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userQuery }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
    });

    const advice = completion.choices[0].message.content;

    // 6. Async: Extract and Save New Health Memory
    this.extractAndSaveMemory(user.id, userQuery, advice || '').catch(err => console.error('Error saving health memory:', err));

    return {
      advice,
      referencedKnowledge: healthKnowledge.map(k => ({ id: k.id, category: k.category })),
      contextUsed: {
        profileLinked: !!user.profile,
        patternsLinked: true
      }
    };
  }

  private calculateBMI(profile: any) {
    if (!profile?.weight || !profile?.height) return 'Unknown';
    const heightInMeters = profile.height / 100;
    return (profile.weight / (heightInMeters * heightInMeters)).toFixed(1);
  }

  /**
   * Summarizes the interaction into a short "memory" snippet and saves it semantically.
   */
  private async extractAndSaveMemory(userId: string, query: string, response: string) {
    // In a real system, we might use another LLM call to summarize, 
    // but here we'll just save a compact version of the user's apparent preference/need.
    if (query.length < 10) return;

    const memorySnippet = `User asked about: "${query}". Advisor provided guidance on nutrition/health alignment.`;
    await vectorService.saveUserHealthMemory(userId, memorySnippet, 'chat_interaction');
  }
}

export const healthAdvisorService = new HealthAdvisorService();
