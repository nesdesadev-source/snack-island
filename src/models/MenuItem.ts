export type MenuCategory = 'Snack' | 'Drink' | 'Combo' | 'Side';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: MenuCategory;
  created_at?: string;
  updated_at?: string;
}

export interface CreateMenuItemInput {
  name: string;
  price: number;
  category: MenuCategory;
}

export interface UpdateMenuItemInput {
  name?: string;
  price?: number;
  category?: MenuCategory;
}

