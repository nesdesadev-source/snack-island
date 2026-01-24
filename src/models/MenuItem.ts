export type MenuCategory = 'Snack' | 'Drink' | 'Combo' | 'Side';

export type FriesOption = 'cheese' | 'sour_cream' | 'bbq';
export type DrinkOption = 'cucumber' | 'iced_tea';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: MenuCategory;
  item_code?: string;
  is_active?: boolean;
  has_fries?: boolean;
  has_spicy?: boolean;
  has_drink?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateMenuItemInput {
  name: string;
  price: number;
  category: MenuCategory;
  item_code: string;
  is_active?: boolean;
  has_fries?: boolean;
  has_spicy?: boolean;
  has_drink?: boolean;
}

export interface UpdateMenuItemInput {
  name?: string;
  price?: number;
  category?: MenuCategory;
  item_code?: string;
  is_active?: boolean;
  has_fries?: boolean;
  has_spicy?: boolean;
  has_drink?: boolean;
}

