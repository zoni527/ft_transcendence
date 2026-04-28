import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { z } from 'zod';
import FormHeader from '../components/FormHeader';
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
      required_error: t('recValidation.fieldRequired', { field }),
      invalid_type_error: t('recValidation.numRequired', { field }),
    })
    .min(value, t('recValidation.numMin', { field, value }));

// Validation schema
const createRecipeSchema = (t: TFunction) =>
  z.object({
    title: z.string().min(1, t('recValidation.recipeNameRequired')),
    description: z.string().min(1, t('recValidation.descriptionRequired')),
    prep_time_min: requiredNumber(t('recValidation.prepTime'), 0, t),
    cook_time_min: requiredNumber(t('recValidation.cookTime'), 0, t),
    servings: requiredNumber(t('recValidation.servings'), 1, t),
    difficulty: z.enum(['easy', 'medium', 'hard'], {
      errorMap: () => ({ message: t('recValidation.selectDifficulty') }),
    }),
    cuisine: z.string().min(1, t('recValidation.cuisineRequired')),
    meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack'], {
      errorMap: () => ({ message: t('recValidation.selectMealType') }),
    }),
    calories: requiredNumber(t('recValidation.calories'), 0, t),
    protein_g: requiredNumber(t('recValidation.protein'), 0, t),
    carbs_g: requiredNumber(t('recValidation.carbs'), 0, t),
    fat_g: requiredNumber(t('recValidation.fat'), 0, t),
    is_published: z.enum(['yes', 'no'], {
      errorMap: () => ({ message: t('recValidation.selectPublishOption') }),
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
      postCreateRecipe(
        {
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
        },
        t,
      )
        .then((recipe) => {
          void navigate(`/recipe/${recipe.id}`);
        })
        .catch((err: unknown) => {
          if (err instanceof Error) setError(err.message);
          else setError(t('genericError'));
        })
        .finally(() => setLoading(false));
    }
  };

  return (
    <div className={`${cardBase} mx-auto mt-8 max-w-xl p-8`}>
      {/* Header */}
      <FormHeader title={t('recipes.header')} />

      {/* Input Fields */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <InputField
          id="title"
          name="title"
          label={t('recipes.title')}
          placeholder={t('recipes.titlePlace')}
        />

        {/* Description */}
        <InputTextArea
          id="description"
          name="description"
          label={t('recipes.description')}
          placeholder={t('recipes.descriptionPlace')}
        />

        {/* Preparation Time */}
        <InputField
          id="prep_time_min"
          name="prep_time_min"
          label={t('recipes.prep')}
          placeholder={t('recipes.prepPlace')}
        />

        {/* Cooking Time */}
        <InputField
          id="cook_time_min"
          name="cook_time_min"
          label={t('recipes.cook')}
          placeholder={t('recipes.cookPlace')}
        />

        {/* Servings */}
        <InputField
          id="servings"
          name="servings"
          label={t('recipes.servings')}
          placeholder={t('recipes.servingsPlace')}
        />

        {/* Difficulty */}
        <SelectField
          id="difficulty"
          name="difficulty"
          label={t('recipes.difficulty')}
          options={[
            { value: 'easy', label: t('recipes.easy') },
            { value: 'medium', label: t('recipes.medium') },
            { value: 'hard', label: t('recipes.hard') },
          ]}
        />

        {/* Cuisine */}
        <InputField
          id="cuisine"
          name="cuisine"
          label={t('recipes.cuisine')}
          placeholder={t('recipes.cuisinePlace')}
        />

        {/* Meal Type */}
        <SelectField
          id="meal_type"
          name="meal_type"
          label={t('recipes.meal')}
          options={[
            { value: 'breakfast', label: t('recipes.breakfast') },
            { value: 'lunch', label: t('recipes.lunch') },
            { value: 'dinner', label: t('recipes.dinner') },
            { value: 'snack', label: t('recipes.snack') },
          ]}
        />

        {/* Calories */}
        <InputField
          id="calories"
          name="calories"
          label={t('recipes.calories')}
          placeholder={t('recipes.caloriesPlace')}
        />

        {/* Protein */}
        <InputField
          id="protein_g"
          name="protein_g"
          label={t('recipes.protein')}
          placeholder={t('recipes.proteinPlace')}
        />

        {/* Carbohydrates */}
        <InputField
          id="carbs_g"
          name="carbs_g"
          label={t('recipes.carbs')}
          placeholder={t('recipes.carbsPlace')}
        />

        {/* Fat */}
        <InputField
          id="fat_g"
          name="fat_g"
          label={t('recipes.fat')}
          placeholder={t('recipes.fatPlace')}
        />

        {/* Publish Recipe? */}
        <SelectField
          id="is_published"
          name="is_published"
          label={t('recipes.publish')}
          options={[
            { value: 'yes', label: t('recipes.yes') },
            { value: 'no', label: t('recipes.no') },
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
            pendingText={t('recipe.submitPending')}
            defaultText={t('recipe.submit')}
          />
        </div>
      </form>
    </div>
  );
};

export default CreateRecipe;
