export interface Recipe {
  id: string;
  author: {
    id: string;
    display_name: string;
    avatar_url: string;
  };
  title: string;
  description: string;
  preparation_time_min: number;
  servings: number;
  difficulty: string;
  cuisine: string;
  meal_type: string;
  image_url: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  display_name: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
  roles: string[];
  is_online: boolean;
}

export type AuthContextType = {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  loading: boolean;
  hasRole: (roles: string[]) => boolean;
};
