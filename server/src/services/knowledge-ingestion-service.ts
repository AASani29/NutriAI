import { vectorService } from "./vector-service";

export class KnowledgeIngestionService {
  /**
   * Ingests a block of text, chunks it, and saves it to the health knowledge base.
   */
  async ingestText(content: string, category: string, tags: string[] = [], metadata: any = {}) {
    // Simple chunking by paragraphs for now. For production, a more sophisticated recursive character splitter would be better.
    const chunks = content.split("\n\n").filter(c => c.trim().length > 50);

    console.log(`📥 Ingesting ${chunks.length} chunks for category: ${category}`);

    for (const chunk of chunks) {
      await vectorService.saveHealthKnowledge(chunk.trim(), category, tags, metadata);
    }
  }

  /**
   * Seeds initial nutrition and health knowledge for common use cases.
   */
  async seedInitialKnowledge() {
    const nutritionKnowledge = [
      {
        category: "Nutrition",
        content: `Diabetes and Carbohydrate Management: For individuals with type 2 diabetes, managing carbohydrate intake is crucial. Focus on complex carbohydrates with a low glycemic index, such as whole grains (oatmeal, brown rice) and non-starchy vegetables. It is recommended to maintain a consistent carb count across meals to prevent blood sugar spikes. A typical goal for diabetes management is 45-60 grams of carbs per meal, but this should be personalized based on activity levels and medications.`,
        tags: ["diabetes", "carbs", "glucose"],
        metadata: { source: "General Medical Guidelines" }
      },
      {
        category: "Nutrition",
        content: `Protein Requirements for Active Individuals: Adults who are physically active or engaging in resistance training often require higher protein intake than the standard sedentary recommendation of 0.8g per kg of body weight. For muscle maintenance and repair, a range of 1.2g to 2.0g of protein per kg of body weight is generally recommended. High-quality sources include eggs, lean poultry, fish, and plant-based options like lentils and soy.`,
        tags: ["protein", "fitness", "muscle"],
        metadata: { source: "Sports Nutrition Standards" }
      },
      {
        category: "Nutrition",
        content: `Hydration and Health: Water is essential for every function in the body. A general rule of thumb is 2-3 liters per day for adults, but this varies significantly based on climate, activity, and diet. Foods with high water content, such as cucumbers, watermelon, and spinach, also contribute to hydration. Dehydration can lead to fatigue, headaches, and impaired cognitive function.`,
        tags: ["hydration", "water", "wellness"],
        metadata: { source: "Health Wellness Guides" }
      },
      {
        category: "Diet",
        content: `Intermittent Fasting (16:8): The 16:8 method involves fasting for 16 hours and eating during an 8-hour window. This approach can help with weight management and improve metabolic health by extending the period when the body burns stored fat for energy. During the fasting window, non-caloric beverages like water, black coffee, and tea are permitted. It is important to focus on nutrient-dense foods during the eating window to avoid nutritional gaps.`,
        tags: ["fasting", "weight loss", "metabolism"],
        metadata: { source: "Dietary Trends" }
      }
    ];

    for (const k of nutritionKnowledge) {
      await vectorService.saveHealthKnowledge(k.content, k.category, k.tags, k.metadata);
    }

    console.log("✅ Initial health knowledge seeded.");
  }
}

export const knowledgeIngestionService = new KnowledgeIngestionService();
