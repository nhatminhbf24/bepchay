export type Category = 'Món nước' | 'Kho' | 'Canh' | 'Xào' | 'Chiên/áp chảo' | 'Hấp/luộc' | 'Gỏi/trộn' | 'Cơm/cháo';
export type MealKey = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type Priority = 'taste' | 'quick' | 'pantry' | 'budget' | 'balanced';

export interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
  optional?: boolean;
  note?: string;
}

export interface Recipe {
  id: string;
  name: string;
  category: Category;
  summary: string;
  servings: number;
  prepMinutes: number;
  cookMinutes: number;
  advanceMinutes?: number;
  ingredients: Ingredient[];
  steps: string[];
  tags: string[];
  roles: Array<'one-bowl' | 'main' | 'vegetable' | 'soup' | 'staple' | 'side'>;
  equipment: string[];
  spicy: boolean;
  budget: boolean;
  favorite?: boolean;
  hidden?: boolean;
  sourceNote: string;
  sources?: Array<{ title: string; url: string }>;
  verification: 'draft' | 'source-checked' | 'cooked';
  updatedAt: string;
  version: number;
}

export interface MealSuggestion {
  id: string;
  date: string;
  meal: MealKey;
  servings: number;
  recipeIds: string[];
  reasons: string[];
  status: 'suggested' | 'confirmed' | 'cooked' | 'skipped';
}

export interface ShoppingItem {
  id: string;
  name: string;
  amount: number;
  unit: string;
  checked: boolean;
}

export interface Settings {
  enabledMeals: MealKey[];
  defaultServings: number;
  priorities: Priority[];
  avoidedIngredients: string[];
  dislikedIngredients: string[];
  equipment: string[];
}

export interface AppState {
  recipes: Recipe[];
  meals: MealSuggestion[];
  shopping: ShoppingItem[];
  settings: Settings;
  pantry: string[];
  seededVersion: number;
}
