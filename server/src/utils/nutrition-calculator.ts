/**
 * Calculate recommended daily nutrition values based on user metrics
 * Uses Mifflin-St Jeor Equation for BMR and activity factor
 */

interface UserMetrics {
  height?: number; // cm
  weight?: number; // kg
  weightPreference?: string; // 'lose', 'maintain', 'gain'
  age?: number; // years (optional, defaults to 25 if not provided)
  gender?: 'male' | 'female'; // optional, defaults to male
}

interface NutritionRecommendations {
  protein: number; // grams
  carbohydrates: number; // grams
  fat: number; // grams
  energy: number; // kcal
}

export class NutritionCalculator {
  /**
   * Calculate Basal Metabolic Rate using Mifflin-St Jeor Equation
   */
  private static calculateBMR(weight: number, height: number, age: number, gender: 'male' | 'female'): number {
    if (gender === 'male') {
      return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      return 10 * weight + 6.25 * height - 5 * age - 161;
    }
  }

  /**
   * Calculate Total Daily Energy Expenditure (TDEE)
   * Assumes moderate activity level (1.55 multiplier)
   */
  private static calculateTDEE(bmr: number): number {
    return bmr * 1.55; // Moderate activity
  }

  /**
   * Adjust calories based on weight goal
   */
  private static adjustForGoal(tdee: number, weightPreference?: string): number {
    switch (weightPreference) {
      case 'lose':
        return tdee - 500; // 500 kcal deficit for weight loss
      case 'gain':
        return tdee + 300; // 300 kcal surplus for weight gain
      case 'maintain':
      default:
        return tdee;
    }
  }

  /**
   * Calculate macronutrient distribution
   * Protein: 25-30% of calories (2g per kg body weight for active individuals)
   * Carbs: 45-50% of calories
   * Fat: 25-30% of calories
   */
  public static calculateRecommendations(metrics: UserMetrics): NutritionRecommendations {
    // Default values if not provided
    const age = metrics.age || 25;
    const gender = metrics.gender || 'male';
    
    // If height and weight not provided, return standard recommendations
    if (!metrics.height || !metrics.weight) {
      return {
        protein: 60,
        carbohydrates: 250,
        fat: 70,
        energy: 2000,
      };
    }

    // Calculate BMR and TDEE
    const bmr = this.calculateBMR(metrics.weight, metrics.height, age, gender);
    const tdee = this.calculateTDEE(bmr);
    const targetCalories = this.adjustForGoal(tdee, metrics.weightPreference);

    // Calculate macros
    const protein = Math.round(metrics.weight * 2); // 2g per kg body weight
    const proteinCalories = protein * 4;
    
    const fatPercentage = 0.28; // 28% of calories from fat
    const fatCalories = targetCalories * fatPercentage;
    const fat = Math.round(fatCalories / 9); // 9 calories per gram of fat
    
    const remainingCalories = targetCalories - proteinCalories - fatCalories;
    const carbohydrates = Math.round(remainingCalories / 4); // 4 calories per gram of carbs

    return {
      protein,
      carbohydrates,
      fat,
      energy: Math.round(targetCalories),
    };
  }

  /**
   * Format recommendations as a human-readable string
   */
  public static formatRecommendation(value: number, unit: string): string {
    return `Recommended: ${value}${unit}`;
  }
}
