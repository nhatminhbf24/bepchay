import { describe, expect, it } from 'vitest';
import { freshState, reducer } from './store';

describe('recipe progress', () => {
  it('starts with no checked ingredients or steps', () => {
    expect(freshState().progress).toEqual({});
  });

  it('stores progress separately from the recipe content', () => {
    const state = freshState();
    const recipe = state.recipes[0];
    const next = reducer(state, {
      type: 'recipe-progress',
      recipeId: recipe.id,
      value: { ingredients: [recipe.ingredients[0].id], steps: [0] }
    });

    expect(next.progress[recipe.id]).toEqual({ ingredients: [recipe.ingredients[0].id], steps: [0] });
    expect(next.recipes[0]).toEqual(recipe);
  });
});
