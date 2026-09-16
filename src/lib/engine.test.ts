import { describe, expect, it } from 'vitest';
import { initialRecipes } from '../data/recipes';
import { defaultSettings } from './store';
import { scaleAmount, shoppingFromMeals, suggestMeal } from './engine';

describe('meal engine', () => {
  it('ships 26 reviewed recipes with visible sources', () => {
    expect(initialRecipes).toHaveLength(26);
    expect(initialRecipes.every((recipe) => recipe.verification === 'source-checked' && recipe.sources?.length)).toBe(true);
  });

  it('does not seed explicitly banned animal ingredients', () => {
    const text = initialRecipes.flatMap((recipe) => recipe.ingredients.map((item) => item.name.toLowerCase())).join(' ');
    for (const banned of ['trứng', 'gelatin', 'thịt', 'cá', 'hải sản', 'nước mắm']) expect(text).not.toContain(banned);
  });

  it('builds a balanced lunch without hidden recipes', () => {
    const result = suggestMeal('lunch', '2026-09-16', initialRecipes, defaultSettings, [], []);
    expect(result.recipeIds.length).toBe(3);
    expect(result.status).toBe('suggested');
  });

  it('scales ingredient amounts', () => {
    expect(scaleAmount(200, 2, 3)).toBe(300);
  });

  it('groups shopping items with matching units', () => {
    const recipe = initialRecipes.find((item) => item.name === 'Canh mướp đậu phụ')!;
    const meal = { id: 'x', date: '2026-09-16', meal: 'lunch' as const, servings: 6, recipeIds: [recipe.id], reasons: [], status: 'confirmed' as const };
    const items = shoppingFromMeals([meal], initialRecipes, []);
    expect(items.find((item) => item.name === 'Mướp')?.amount).toBe(700);
  });
});
