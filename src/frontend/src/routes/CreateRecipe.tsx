import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import InputField from '../components/InputField';
import InputTextArea from '../components/InputTextArea';
import SelectField from '../components/SelectField';
import { postCreateRecipe } from '../api';
import { getStringValue } from '../utils/utils';
import { cardBase, buttonBase } from '../styles/styles';

// Helper function for checking number fields in the validation schema
const requiredNumber = (field: string, value: number) =>
  z.coerce
    .number({
      required_error: `${field} is required`,
      invalid_type_error: `${field} must be a number`,
    })
    .min(value, `${field} must be at least ${value}`);

// Validation schema
const createRecipeSchema = z.object({
  title: z.string().min(1, 'Recipe name is required'),
  description: z.string().min(1, 'Description is required'),
  prep_time_min: requiredNumber('Prep time', 0),
  cook_time_min: requiredNumber('Cook time', 0),
  servings: requiredNumber('Servings', 1),
  difficulty: z.enum(['easy', 'medium', 'hard'], {
    errorMap: () => ({ message: 'Please select a difficulty' }),
  }),
  cuisine: z.string().min(1, 'Cuisine type is required'),
  meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack'], {
    errorMap: () => ({ message: 'Please select a meal type' }),
  }),
  calories: requiredNumber('Calories', 0),
  protein_g: requiredNumber('Protein', 0),
  carbs_g: requiredNumber('Carbs', 0),
  fat_g: requiredNumber('Fat', 0),
  is_published: z.enum(['yes', 'no'], {
    errorMap: () => ({ message: 'Please select a publish option' }),
  }),
});

const CreateRecipe = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Input validation
    const result = createRecipeSchema.safeParse({
      title: getStringValue(formData, 'title'),
      description: getStringValue(formData, 'description'),
      prep_time_min: getStringValue(formData, 'prep_time_min'),
      cook_time_min: getStringValue(formData, 'cook_time_min'),
      servings: getStringValue(formData, 'servings'),
      difficulty: getStringValue(formData, 'difficulty'),
      cuisine: getStringValue(formData, 'cuisine'),
      meal_type: getStringValue(formData, 'meal_type'),
      calories: getStringValue(formData, 'calories'),
      protein_g: getStringValue(formData, 'protein_g'),
      carbs_g: getStringValue(formData, 'carbs_g'),
      fat_g: getStringValue(formData, 'fat_g'),
      is_published: getStringValue(formData, 'is_published'),
    });

    if (!result.success) {
      setError(result.error.issues[0]?.message || 'Invalid input');
    } else {
      setLoading(true);

      // POST /api/recipes (create a new recipe)
      postCreateRecipe({
        author_id: 'HARDCODED',
        title: result.data.title,
        description: result.data.description,
        prep_time_min: result.data.prep_time_min,
        cook_time_min: result.data.cook_time_min,
        servings: result.data.servings,
        difficulty: result.data.difficulty,
        cuisine: result.data.cuisine,
        meal_type: result.data.meal_type,
        image_url: 'HARDCODED',
        calories: result.data.calories,
        protein_g: result.data.protein_g,
        carbs_g: result.data.carbs_g,
        fat_g: result.data.fat_g,
        is_published: result.data.is_published === 'yes',
      })
        .then((recipe) => {
          void navigate(`/recipe/${recipe.id}`);
        })
        .catch((err: unknown) => {
          if (err instanceof Error) setError(err.message);
          else setError('Something went wrong. Please try again.');
        })
        .finally(() => setLoading(false));
    }
  };

  return (
    <div className={`${cardBase} mx-auto mt-8 max-w-xl p-8`}>
      {/* Header */}
      <h1 className="mb-6 text-center text-2xl font-semibold text-amber-900">
        Create Recipe
      </h1>

      {/* Input Fields */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <InputField
          id="title"
          name="title"
          label="Recipe Name"
          placeholder="Enter recipe name"
        />

        {/* Description */}
        <InputTextArea
          id="description"
          name="description"
          label="Short description"
          placeholder="Enter short description"
        />

        {/* Preparation Time */}
        <InputField
          id="prep_time_min"
          name="prep_time_min"
          label="Preparation time (min)"
          placeholder="Enter preparation time in minutes"
        />

        {/* Cooking Time */}
        <InputField
          id="cook_time_min"
          name="cook_time_min"
          label="Cooking time (min)"
          placeholder="Enter cooking time in minutes"
        />

        {/* Servings */}
        <InputField
          id="servings"
          name="servings"
          label="Servings"
          placeholder="Enter number of servings"
        />

        {/* Difficulty */}
        <SelectField
          id="difficulty"
          name="difficulty"
          label="Difficulty"
          options={[
            { value: 'easy', label: 'Easy' },
            { value: 'medium', label: 'Medium' },
            { value: 'hard', label: 'Hard' },
          ]}
        />

        {/* Cuisine */}
        <InputField
          id="cuisine"
          name="cuisine"
          label="Cuisine"
          placeholder="Enter the type of cuisine"
        />

        {/* Meal Type */}
        <SelectField
          id="meal_type"
          name="meal_type"
          label="Meal Type"
          options={[
            { value: 'breakfast', label: 'Breakfast' },
            { value: 'lunch', label: 'Lunch' },
            { value: 'dinner', label: 'Dinner' },
            { value: 'snack', label: 'Snack' },
          ]}
        />

        {/* Calories */}
        <InputField
          id="calories"
          name="calories"
          label="Calories (kcal)"
          placeholder="Enter the amount of calories in kcal"
        />

        {/* Protein */}
        <InputField
          id="protein_g"
          name="protein_g"
          label="Protein (grams)"
          placeholder="Enter the amount of protein in grams"
        />

        {/* Carbohydrates */}
        <InputField
          id="carbs_g"
          name="carbs_g"
          label="Carbohydrates (grams)"
          placeholder="Enter the amount of carbohydrates in grams"
        />

        {/* Fat */}
        <InputField
          id="fat_g"
          name="fat_g"
          label="Fat (grams)"
          placeholder="Enter the amount of fat in grams"
        />

        {/* Publish Recipe? */}
        <SelectField
          id="is_published"
          name="is_published"
          label="Publish Recipe?"
          options={[
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
          ]}
        />

        {/* Image Upload */}
        <input type="file" name="image" accept="image/*" className="w-full" />

        {/* Errors & Warnings */}
        <p className="text-md min-h-5 text-center text-red-500">
          {error || '\u00A0'}
        </p>

        {/* Submit Button */}
        <button type="submit" className={buttonBase} disabled={loading}>
          {loading && !error ? 'Submitting recipe...' : 'Submit recipe'}
        </button>
      </form>
    </div>
  );
};

export default CreateRecipe;
