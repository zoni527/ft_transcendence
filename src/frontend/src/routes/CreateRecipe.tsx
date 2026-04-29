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
      setError(result.error.issues[0]?.message || t('error.input'));
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
          else setError(t('error.genericError'));
        })
        .finally(() => setLoading(false));
    }
  };

  return (
    <div className={`${cardBase} mx-auto mt-8 max-w-xl p-8`}>
      {/* Header */}
      <FormHeader title={t('createRecipe.header')} />

      {/* Input Fields */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <InputField
          id="title"
          name="title"
          label={t('createRecipe.title')}
          placeholder={t('createRecipe.titlePlace')}
        />

        {/* Description */}
        <InputTextArea
          id="description"
          name="description"
          label={t('createRecipe.description')}
          placeholder={t('createRecipe.descriptionPlace')}
        />

        {/* Preparation Time */}
        <InputField
          id="prep_time_min"
          name="prep_time_min"
          label={t('createRecipe.prep')}
          placeholder={t('createRecipe.prepPlace')}
        />

        {/* Cooking Time */}
        <InputField
          id="cook_time_min"
          name="cook_time_min"
          label={t('createRecipe.cook')}
          placeholder={t('createRecipe.cookPlace')}
        />

        {/* Servings */}
        <InputField
          id="servings"
          name="servings"
          label={t('createRecipe.servings')}
          placeholder={t('createRecipe.servingsPlace')}
        />

        {/* Difficulty */}
        <SelectField
          id="difficulty"
          name="difficulty"
          label={t('createRecipe.difficulty')}
          options={[
            { value: 'easy', label: t('createRecipe.difficulty_easy') },
            { value: 'medium', label: t('createRecipe.difficulty_medium') },
            { value: 'hard', label: t('createRecipe.difficulty_hard') },
          ]}
        />

        {/* Cuisine */}
        <InputField
          id="cuisine"
          name="cuisine"
          label={t('createRecipe.cuisine')}
          placeholder={t('createRecipe.cuisinePlace')}
        />

        {/* Meal Type */}
        <SelectField
          id="meal_type"
          name="meal_type"
          label={t('createRecipe.meal')}
          options={[
            { value: 'breakfast', label: t('createRecipe.meal_breakfast') },
            { value: 'lunch', label: t('createRecipe.meal_lunch') },
            { value: 'dinner', label: t('createRecipe.meal_dinner') },
            { value: 'snack', label: t('createRecipe.meal_snack') },
          ]}
        />

        {/* Calories */}
        <InputField
          id="calories"
          name="calories"
          label={t('createRecipe.calories')}
          placeholder={t('createRecipe.caloriesPlace')}
        />

        {/* Protein */}
        <InputField
          id="protein_g"
          name="protein_g"
          label={t('createRecipe.protein')}
          placeholder={t('createRecipe.proteinPlace')}
        />

        {/* Carbohydrates */}
        <InputField
          id="carbs_g"
          name="carbs_g"
          label={t('createRecipe.carbs')}
          placeholder={t('createRecipe.carbsPlace')}
        />

        {/* Fat */}
        <InputField
          id="fat_g"
          name="fat_g"
          label={t('createRecipe.fat')}
          placeholder={t('createRecipe.fatPlace')}
        />

        {/* Publish Recipe? */}
        <SelectField
          id="is_published"
          name="is_published"
          label={t('createRecipe.publish')}
          options={[
            { value: 'yes', label: t('createRecipe.yes') },
            { value: 'no', label: t('createRecipe.no') },
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
            pendingText={t('createRecipe.submitPending')}
            defaultText={t('createRecipe.submit')}
          />
        </div>
      </form>
    </div>
  );
};

export default CreateRecipe;
