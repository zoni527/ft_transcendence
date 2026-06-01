import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { z } from 'zod';
import FormHeader from '../components/FormHeader.tsx';
import InputField from '../components/InputField.tsx';
import InputTextArea from '../components/InputTextArea.tsx';
import SelectField from '../components/SelectField.tsx';
import SubmitButton from '../components/SubmitButton.tsx';
import {
  postCreateRecipe,
  getCloudinarySignature,
  uploadImageToCloudinary,
} from '../api.tsx';
import { useNotification } from '../utils/NotifContext.ts';
import { getStringValue } from '../utils/utils.tsx';
import { cardBase, uploadButtonBase } from '../styles/styles.tsx';

type CreateRecipeModalProps = {
  onClose: () => void;
};

// Helper function for validation with min and max
const requiredNumber = (
  field: string,
  minValue: number,
  maxValue: number,
  t: TFunction,
) =>
  z.coerce
    .number({
      required_error: t('recValidation.fieldRequired', { field }),
      invalid_type_error: t('recValidation.numRequired', { field }),
    })
    .min(minValue, t('recValidation.numMin', { field, minValue }))
    .max(maxValue, t('recValidation.numMax', { field, maxValue }));

const createRecipeSchema = (t: TFunction) =>
  z.object({
    title: z
      .string()
      .min(3, t('recValidation.recipeNameRequired'))
      .max(60, t('recValidation.recipeNameRequired')),
    description: z.string().max(10000, t('recValidation.descriptionRequired')),
    preparation_time_min: requiredNumber(
      t('recValidation.prepTime'),
      0,
      60000,
      t,
    ),
    servings: requiredNumber(t('recValidation.servings'), 1, 100, t),
    difficulty: z.enum(['easy', 'medium', 'hard'], {
      errorMap: () => ({ message: t('recValidation.selectDifficulty') }),
    }),
    cuisine: z
      .string()
      .trim()
      .max(50, t('recValidation.cuisineRequired'))
      .refine(
        (value) =>
          [...value].every(
            (c) =>
              /\p{L}/u.test(c) ||
              /\p{S}/u.test(c) ||
              /\p{P}/u.test(c) ||
              c === ' ',
          ),
        {
          message: t('recValidation.cuisineRequired'),
        },
      ),
    meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack', 'dessert'], {
      errorMap: () => ({ message: t('recValidation.selectMealType') }),
    }),
    calories: requiredNumber(t('recValidation.calories'), 0, 1000000, t),
    protein_g: requiredNumber(t('recValidation.protein'), 0, 100000, t),
    carbs_g: requiredNumber(t('recValidation.carbs'), 0, 100000, t),
    fat_g: requiredNumber(t('recValidation.fat'), 0, 100000, t),
  });

const CreateRecipeModal = ({ onClose }: CreateRecipeModalProps) => {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Disable background scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    void handleSubmitAsync(e);
  };

  const handleSubmitAsync = async (
    e: React.SyntheticEvent<HTMLFormElement>,
  ) => {
    if (loading) return;

    setLoading(true);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);

      const schema = createRecipeSchema(t);

      const result = schema.safeParse({
        title: getStringValue(formData, 'title'),
        description: getStringValue(formData, 'description'),
        preparation_time_min: getStringValue(formData, 'preparation_time_min'),
        servings: getStringValue(formData, 'servings'),
        difficulty: getStringValue(formData, 'difficulty'),
        cuisine: getStringValue(formData, 'cuisine'),
        meal_type: getStringValue(formData, 'meal_type'),
        calories: getStringValue(formData, 'calories'),
        protein_g: getStringValue(formData, 'protein_g'),
        carbs_g: getStringValue(formData, 'carbs_g'),
        fat_g: getStringValue(formData, 'fat_g'),
      });

      if (!result.success) {
        throw new Error(result.error.issues[0]?.message || t('error.input'));
      }

      const image = formData.get('image');

      if (!(image instanceof File) || image.size === 0) {
        throw new Error(t('recValidation.imageRequired'));
      }

      const signature = await getCloudinarySignature(t);
      const image_url = await uploadImageToCloudinary(image, signature, t);

      const recipe = await postCreateRecipe(
        {
          ...result.data,
          image_url,
        },
        t,
      );

      showNotification(t('notification.createRecipeSuccess'), 'success');

      onClose();
      void navigate(`/recipes/${recipe.id}`);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : t('error.genericError');

      showNotification(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal content */}
      <div
        className={`${cardBase} relative z-10 max-h-[90vh] w-full max-w-xl overflow-y-auto p-8`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:cursor-pointer hover:text-black"
        >
          ✕
        </button>

        <FormHeader title={t('createRecipe.header')} />

        {/* Information fields */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <InputField
            id="title"
            name="title"
            label={t('createRecipe.title')}
            placeholder={t('createRecipe.titlePlace')}
          />

          <InputTextArea
            id="description"
            name="description"
            label={t('createRecipe.description')}
            placeholder={t('createRecipe.descriptionPlace')}
          />

          <InputField
            id="preparation_time_min"
            name="preparation_time_min"
            label={t('createRecipe.prep')}
            placeholder={t('createRecipe.prepPlace')}
          />

          <InputField
            id="servings"
            name="servings"
            label={t('createRecipe.servings')}
            placeholder={t('createRecipe.servingsPlace')}
          />

          <SelectField
            id="difficulty"
            name="difficulty"
            label={t('difficulty.type')}
            defaultValue=""
            placeholder={t('createRecipe.difficultyPlace')}
            options={[
              { value: 'easy', label: t('difficulty.type_easy') },
              { value: 'medium', label: t('difficulty.type_medium') },
              { value: 'hard', label: t('difficulty.type_hard') },
            ]}
          />

          <InputField
            id="cuisine"
            name="cuisine"
            label={t('createRecipe.cuisine')}
            placeholder={t('createRecipe.cuisinePlace')}
          />

          <SelectField
            id="meal_type"
            name="meal_type"
            label={t('meal.type')}
            defaultValue=""
            placeholder={t('createRecipe.mealTypePlace')}
            options={[
              { value: 'breakfast', label: t('meal.type_breakfast') },
              { value: 'lunch', label: t('meal.type_lunch') },
              { value: 'dinner', label: t('meal.type_dinner') },
              { value: 'snack', label: t('meal.type_snack') },
              { value: 'dessert', label: t('meal.type_dessert') },
            ]}
          />

          <InputField
            id="calories"
            name="calories"
            label={t('createRecipe.calories')}
            placeholder={t('createRecipe.caloriesPlace')}
          />
          <InputField
            id="protein_g"
            name="protein_g"
            label={t('createRecipe.protein')}
            placeholder={t('createRecipe.proteinPlace')}
          />
          <InputField
            id="carbs_g"
            name="carbs_g"
            label={t('createRecipe.carbs')}
            placeholder={t('createRecipe.carbsPlace')}
          />

          <InputField
            id="fat_g"
            name="fat_g"
            label={t('createRecipe.fat')}
            placeholder={t('createRecipe.fatPlace')}
          />

          {/* Image Upload */}
          <div className="mt-12 flex items-center gap-3">
            <label className={uploadButtonBase}>
              📁 {t('createRecipe.uploadImage')}
              <input
                type="file"
                name="image"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setFileName(file ? file.name : '');
                }}
              />
            </label>

            <span className="text-sm text-gray-600">
              {fileName || t('common.noFile')}
            </span>
          </div>

          {/* Submit */}
          <div className="mt-12 flex justify-center">
            <SubmitButton
              className="rounded-full border-3 border-orange-700 hover:border-orange-800"
              isLoading={loading}
              defaultText={t('createRecipe.submit')}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRecipeModal;
