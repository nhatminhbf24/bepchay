import { describe, expect, it } from 'vitest';
import { initialRecipes } from '../data/recipes';
import { defaultSettings } from './store';
import { scaleAmount, shoppingFromMeals, suggestMeal } from './engine';

describe('meal engine', () => {
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

