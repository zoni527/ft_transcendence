import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { z } from 'zod';
import InputField from '../components/InputField';
import InputTextArea from '../components/InputTextArea';
import SelectField from '../components/SelectField';
import SubmitButton from '../components/SubmitButton';
import { postCreateRecipe } from '../api';
import { getStringValue } from '../utils/utils';
import { cardBase } from '../styles/styles';

// Helper function for checking number fields in the validation schema
const requiredNumber = (field: string, value: number, t: TFunction) =>
  z.coerce
    .number({
      required_error: t('validation.fieldRequired', { field }),
      invalid_type_error: t('validation.numRequired', { field }),
    })
    .min(value, t('validation.numMin', { field, value }));

// Validation schema
const createRecipeSchema = (t: TFunction) =>
  z.object({
    title: z.string().min(1, t('validation.recipeNameRequired')),
    description: z.string().min(1, t('validation.descriptionRequired')),
    prep_time_min: requiredNumber(t('validation.prepTime'), 0, t),
    cook_time_min: requiredNumber(t('validation.cookTime'), 0, t),
    servings: requiredNumber(t('validation.servings'), 1, t),
    difficulty: z.enum(['easy', 'medium', 'hard'], {
      errorMap: () => ({ message: t('validation.selectDifficulty') }),
    }),
    cuisine: z.string().min(1, t('validation.cuisineRequired')),
    meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack'], {
      errorMap: () => ({ message: t('validation.selectMealType') }),
    }),
    calories: requiredNumber(t('validation.calories'), 0, t),
    protein_g: requiredNumber(t('validation.protein'), 0, t),
    carbs_g: requiredNumber(t('validation.carbs'), 0, t),
    fat_g: requiredNumber(t('validation.fat'), 0, t),
    is_published: z.enum(['yes', 'no'], {
      errorMap: () => ({ message: t('validation.selectPublishOption') }),
    }),
  });

const CreateRecipe = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    setError('');

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Input validation

    const schema = createRecipeSchema(t);

    const result = schema.safeParse({
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
        <div className="flex justify-center">
          <SubmitButton
            isLoading={loading}
            pendingText="Submitting recipe"
            defaultText="Submit"
          />
        </div>
      </form>
    </div>
  );
};

export default CreateRecipe;
