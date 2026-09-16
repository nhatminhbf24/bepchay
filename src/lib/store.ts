import { initialRecipes } from '../data/recipes';
import type { AppState, MealSuggestion, Recipe, Settings, ShoppingItem } from '../types';

const STORAGE_KEY = 'bep-chay-state-v1';
const SEED_VERSION = 2;

export const defaultSettings: Settings = {
  enabledMeals: ['breakfast', 'lunch', 'dinner'],
  defaultServings: 2,
  priorities: ['taste', 'balanced'],
  avoidedIngredients: ['trứng', 'gelatin', 'thịt', 'cá', 'hải sản', 'nước mắm'],
  dislikedIngredients: ['chao'],
  equipment: ['bếp ga', 'bếp điện', 'nồi cơm điện', 'nồi chiên không dầu', 'máy xay', 'xửng hấp']
};

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return freshState();
    const parsed = JSON.parse(raw) as AppState;
    const seeds = new Map(initialRecipes.map((recipe) => [recipe.id, recipe]));
    const migrated = parsed.recipes.map((recipe) => parsed.seededVersion < SEED_VERSION && recipe.version === 1 && seeds.has(recipe.id) ? seeds.get(recipe.id)! : recipe);
    const existingIds = new Set(migrated.map((recipe) => recipe.id));
    const newSeeds = initialRecipes.filter((recipe) => !existingIds.has(recipe.id));
    return { ...parsed, recipes: [...migrated, ...newSeeds], seededVersion: SEED_VERSION };
  } catch {
    return freshState();
  }
}

export function freshState(): AppState {
  return { recipes: initialRecipes, meals: [], shopping: [], settings: defaultSettings, pantry: [], seededVersion: SEED_VERSION };
}

export function saveState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export type StateAction =
  | { type: 'hydrate'; value: AppState }
  | { type: 'settings'; value: Settings }
  | { type: 'pantry'; value: string[] }
  | { type: 'meal-upsert'; value: MealSuggestion }
  | { type: 'recipe-upsert'; value: Recipe }
  | { type: 'recipe-toggle-favorite'; id: string }
  | { type: 'shopping-set'; value: ShoppingItem[] }
  | { type: 'shopping-toggle'; id: string };

export function reducer(state: AppState, action: StateAction): AppState {
  switch (action.type) {
    case 'hydrate': return action.value;
    case 'settings': return { ...state, settings: action.value };
    case 'pantry': return { ...state, pantry: action.value };
    case 'meal-upsert': return { ...state, meals: [...state.meals.filter((item) => item.id !== action.value.id), action.value] };
    case 'recipe-upsert': return { ...state, recipes: [...state.recipes.filter((item) => item.id !== action.value.id), action.value] };
    case 'recipe-toggle-favorite': return { ...state, recipes: state.recipes.map((item) => item.id === action.id ? { ...item, favorite: !item.favorite, updatedAt: new Date().toISOString(), version: item.version + 1 } : item) };
    case 'shopping-set': return { ...state, shopping: action.value };
    case 'shopping-toggle': return { ...state, shopping: state.shopping.map((item) => item.id === action.id ? { ...item, checked: !item.checked } : item) };
  }
}
