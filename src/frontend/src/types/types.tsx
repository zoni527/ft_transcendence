export interface Recipe {
  id: number;
  author_id: string;
  title: string;
  description: string;
  prep_time_min: number;
  cook_time_min: number;
  servings: number;
  difficulty: string;
  cuisine: string;
  meal_type: string;
  image_url: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  has_been_favourite_times: number;
}
