import type { MealKey, MealSuggestion, Priority, Recipe, Settings, ShoppingItem } from '../types';

const recentPenalty = (recipeId: string, meals: MealSuggestion[]) => {
  const recent = meals.slice(-14).filter((meal) => meal.status !== 'skipped');
  const index = [...recent].reverse().findIndex((meal) => meal.recipeIds.includes(recipeId));
  return index < 0 ? 0 : Math.max(0, 20 - index * 3);
};

function scoreRecipe(recipe: Recipe, priorities: Priority[], pantry: string[], meals: MealSuggestion[]) {
  let score = 50 - recentPenalty(recipe.id, meals);
  if (recipe.favorite && priorities.includes('taste')) score += 18;
  if (priorities.includes('quick')) score += Math.max(0, 30 - recipe.prepMinutes - recipe.cookMinutes) * 0.8;
  if (priorities.includes('budget') && recipe.budget) score += 12;
  if (priorities.includes('pantry')) {
    score += recipe.ingredients.filter((item) => pantry.some((name) => item.name.toLowerCase().includes(name.toLowerCase()))).length * 6;
  }
  if (recipe.spicy) score -= 8;
  return score;
}

function eligible(recipe: Recipe, settings: Settings) {
  if (recipe.hidden) return false;
  const text = recipe.ingredients.map((item) => item.name.toLowerCase()).join(' ');
  if (settings.avoidedIngredients.some((item) => text.includes(item.toLowerCase()))) return false;
  if (settings.dislikedIngredients.some((item) => text.includes(item.toLowerCase()))) return false;
  return recipe.equipment.every((item) => settings.equipment.includes(item));
}

function ranked(recipes: Recipe[], role: Recipe['roles'][number], settings: Settings, pantry: string[], meals: MealSuggestion[]) {
  return recipes
    .filter((recipe) => eligible(recipe, settings) && recipe.roles.includes(role))
    .map((recipe) => ({ recipe, score: scoreRecipe(recipe, settings.priorities, pantry, meals) + Math.random() * 5 }))
    .sort((a, b) => b.score - a.score)
    .map((item) => item.recipe);
}

export function suggestMeal(meal: MealKey, date: string, recipes: Recipe[], settings: Settings, pantry: string[], meals: MealSuggestion[], servings = settings.defaultServings): MealSuggestion {
  const oneBowl = ranked(recipes, 'one-bowl', settings, pantry, meals);
  let chosen: Recipe[] = [];
  if (meal === 'breakfast' || meal === 'snack') {
    chosen = oneBowl.slice(0, 1);
  } else {
    const mains = ranked(recipes, 'main', settings, pantry, meals);
    const vegetables = ranked(recipes, 'vegetable', settings, pantry, meals);
    const soups = ranked(recipes, 'soup', settings, pantry, meals);
    chosen = [mains[0], vegetables.find((item) => item.id !== mains[0]?.id), soups[0]].filter(Boolean) as Recipe[];
  }
  const reasons: string[] = [];
  if (settings.priorities.includes('quick')) reasons.push('Ưu tiên thời gian nấu ngắn');
  if (settings.priorities.includes('pantry') && pantry.length) reasons.push(`Tận dụng ${pantry.slice(0, 2).join(', ')}`);
  if (settings.priorities.includes('budget')) reasons.push('Dùng nguyên liệu bình dân');
  if (settings.priorities.includes('balanced')) reasons.push('Có món chính, rau và canh');
  if (!reasons.length) reasons.push('Ít lặp lại các bữa gần đây');
  return {
    id: `${date}-${meal}`,
    date,
    meal,
    servings,
    recipeIds: chosen.map((item) => item.id),
    reasons,
    status: 'suggested'
  };
}

export function shoppingFromMeals(meals: MealSuggestion[], recipes: Recipe[], existing: ShoppingItem[]): ShoppingItem[] {
  const grouped = new Map<string, ShoppingItem>();
  for (const meal of meals.filter((item) => item.status !== 'skipped')) {
    for (const recipeId of meal.recipeIds) {
      const recipe = recipes.find((item) => item.id === recipeId);
      if (!recipe) continue;
      const scale = meal.servings / recipe.servings;
      for (const item of recipe.ingredients.filter((ingredient) => !ingredient.optional)) {
        const key = `${item.id}:${item.unit}`;
        const current = grouped.get(key);
        const amount = Math.round(item.amount * scale * 10) / 10;
        if (current) current.amount += amount;
        else grouped.set(key, { id: key, name: item.name, amount, unit: item.unit, checked: existing.find((old) => old.id === key)?.checked || false });
      }
    }
  }
  return [...grouped.values()].sort((a, b) => a.name.localeCompare(b.name, 'vi'));
}

export function scaleAmount(amount: number, baseServings: number, targetServings: number) {
  const value = amount * targetServings / baseServings;
  return Number.isInteger(value) ? value : Math.round(value * 10) / 10;
}

