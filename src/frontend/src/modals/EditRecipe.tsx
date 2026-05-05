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
  putUpdateRecipe,
  getCloudinarySignature,
  uploadImageToCloudinary,
} from '../api.tsx';
import { useNotification } from '../utils/NotifContext.ts';
import { getStringValue } from '../utils/utils.tsx';
import { cardBase, uploadButtonBase } from '../styles/styles.tsx';

type EditRecipeModalProps = {
  id: string;
  onClose: () => void;
};

// Helper function for validation
const requiredNumber = (field: string, value: number, t: TFunction) =>
  z.coerce
    .number({
      required_error: t('recValidation.fieldRequired', { field }),
      invalid_type_error: t('recValidation.numRequired', { field }),
    })
    .min(value, t('recValidation.numMin', { field, value }));

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

const EditRecipeModal = ({ id, onClose }: EditRecipeModalProps) => {
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
        throw new Error(result.error.issues[0]?.message || t('error.input'));
      }

      const image = formData.get('image');

      if (!(image instanceof File) || image.size === 0) {
        throw new Error(t('recValidation.imageRequired'));
      }

      const signature = await getCloudinarySignature(t);
      const image_url = await uploadImageToCloudinary(image, signature, t);

      const recipe = await putUpdateRecipe(
        {
          ...result.data,
          id,
          image_url,
          is_published: result.data.is_published === 'yes',
        },
        id,
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
          <InputField id="title" name="title" label={t('editRecipe.title')} />

          <InputTextArea
            id="description"
            name="description"
            label={t('createRecipe.description')}
          />

          <InputField
            id="prep_time_min"
            name="prep_time_min"
            label={t('createRecipe.prep')}
          />
          <InputField
            id="cook_time_min"
            name="cook_time_min"
            label={t('createRecipe.cook')}
          />
          <InputField
            id="servings"
            name="servings"
            label={t('createRecipe.servings')}
          />

          <SelectField
            id="difficulty"
            name="difficulty"
            label={t('difficulty.type')}
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
          />

          <SelectField
            id="meal_type"
            name="meal_type"
            label={t('meal.type')}
            options={[
              { value: 'breakfast', label: t('meal.type_breakfast') },
              { value: 'lunch', label: t('meal.type_lunch') },
              { value: 'dinner', label: t('meal.type_dinner') },
              { value: 'snack', label: t('meal.type_snack') },
            ]}
          />

          <InputField
            id="calories"
            name="calories"
            label={t('createRecipe.calories')}
          />
          <InputField
            id="protein_g"
            name="protein_g"
            label={t('createRecipe.protein')}
          />
          <InputField
            id="carbs_g"
            name="carbs_g"
            label={t('createRecipe.carbs')}
          />
          <InputField id="fat_g" name="fat_g" label={t('createRecipe.fat')} />

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
              className="rounded-full bg-orange-700 hover:bg-orange-800"
              isLoading={loading}
              pendingText={t('createRecipe.submitPending')}
              defaultText={t('createRecipe.submit')}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRecipeModal;
