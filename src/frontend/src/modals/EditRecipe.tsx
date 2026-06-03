import { useState, useEffect } from 'react';
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
import { validateImageFile } from '../utils/utils.tsx';
import type { Recipe } from '../types/types.tsx';
import { cardBase, uploadButtonBase } from '../styles/styles.tsx';

type EditRecipeModalProps = {
  passedRecipe: Recipe;
  onClose: () => void;
  onSave: (updatedRecipe: Recipe) => void;
};

// Helper function for validation
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

const EditRecipeModal = ({
  passedRecipe,
  onClose,
  onSave,
}: EditRecipeModalProps) => {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  // Controlled input states
  const [title, setTitle] = useState(passedRecipe.title);
  const [description, setDescription] = useState(passedRecipe.description);
  const [preparation_time_min, setPrepTimeMin] = useState(
    passedRecipe.preparation_time_min,
  );
  const [servings, setServings] = useState(passedRecipe.servings);
  const [difficulty, setDifficulty] = useState(passedRecipe.difficulty);
  const [cuisine, setCuisine] = useState(passedRecipe.cuisine);
  const [meal_type, setMealType] = useState(passedRecipe.meal_type);
  const [calories, setCalories] = useState(passedRecipe.calories);
  const [protein, setProtein] = useState(passedRecipe.protein_g);
  const [carbs, setCarbs] = useState(passedRecipe.carbs_g);
  const [fat, setFat] = useState(passedRecipe.fat_g);
  const [fileName, setFileName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

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
    void handleSubmitAsync();
  };

  const handleSubmitAsync = async () => {
    if (loading) return;

    const currentData = {
      title,
      description,
      preparation_time_min,
      servings,
      difficulty,
      cuisine,
      meal_type,
      calories,
      protein_g: protein,
      carbs_g: carbs,
      fat_g: fat,
    };

    const originalData = {
      title: passedRecipe.title,
      description: passedRecipe.description,
      preparation_time_min: passedRecipe.preparation_time_min,
      servings: passedRecipe.servings,
      difficulty: passedRecipe.difficulty,
      cuisine: passedRecipe.cuisine,
      meal_type: passedRecipe.meal_type,
      calories: passedRecipe.calories,
      protein_g: passedRecipe.protein_g,
      carbs_g: passedRecipe.carbs_g,
      fat_g: passedRecipe.fat_g,
    };

    const hasChanges =
      JSON.stringify(originalData) !== JSON.stringify(currentData) ||
      imageFile !== null;

    if (!hasChanges) {
      showNotification(t('notification.noChanges'), 'info');
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const schema = createRecipeSchema(t);

      const result = schema.safeParse(currentData);

      if (!result.success) {
        throw new Error(result.error.issues[0]?.message || t('error.input'));
      }

      let image_url = passedRecipe.image_url;

      if (imageFile) {
        const signature = await getCloudinarySignature(t);
        image_url = await uploadImageToCloudinary(imageFile, signature, t);
      }

      const id = passedRecipe.id;

      await putUpdateRecipe(
        {
          ...result.data,
          id,
          image_url,
        },
        id,
        t,
      );

      const updatedRecipe: Recipe = {
        ...passedRecipe,
        ...result.data,
        image_url,
      };

      onSave(updatedRecipe);

      showNotification(t('notification.editRecipeSuccess'), 'success');

      onClose();
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

        <FormHeader title={t('editRecipe.header')} />

        {/* Information fields */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <InputField
            id="title"
            name="title"
            label={t('createRecipe.title')}
            placeholder={t('createRecipe.titlePlace')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <InputTextArea
            id="description"
            name="description"
            label={t('createRecipe.description')}
            placeholder={t('createRecipe.descriptionPlace')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <InputField
            id="preparation_time_min"
            name="preparation_time_min"
            label={t('createRecipe.prep')}
            placeholder={t('createRecipe.prepPlace')}
            value={preparation_time_min.toString()}
            onChange={(e) => setPrepTimeMin(Number(e.target.value))}
          />

          <InputField
            id="servings"
            name="servings"
            label={t('createRecipe.servings')}
            placeholder={t('createRecipe.servingsPlace')}
            value={servings.toString()}
            onChange={(e) => setServings(Number(e.target.value))}
          />

          <SelectField
            id="difficulty"
            name="difficulty"
            label={t('difficulty.type')}
            placeholder={t('createRecipe.difficultyPlace')}
            options={[
              { value: 'easy', label: t('difficulty.type_easy') },
              { value: 'medium', label: t('difficulty.type_medium') },
              { value: 'hard', label: t('difficulty.type_hard') },
            ]}
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          />

          <InputField
            id="cuisine"
            name="cuisine"
            label={t('createRecipe.cuisine')}
            placeholder={t('createRecipe.cuisinePlace')}
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
          />

          <SelectField
            id="meal_type"
            name="meal_type"
            label={t('meal.type')}
            placeholder={t('createRecipe.mealTypePlace')}
            options={[
              { value: 'breakfast', label: t('meal.type_breakfast') },
              { value: 'lunch', label: t('meal.type_lunch') },
              { value: 'dinner', label: t('meal.type_dinner') },
              { value: 'snack', label: t('meal.type_snack') },
              { value: 'dessert', label: t('meal.type_dessert') },
            ]}
            value={meal_type}
            onChange={(e) => setMealType(e.target.value)}
          />

          <InputField
            id="calories"
            name="calories"
            label={t('createRecipe.calories')}
            placeholder={t('createRecipe.caloriesPlace')}
            value={calories.toString()}
            onChange={(e) => setCalories(Number(e.target.value))}
          />

          <InputField
            id="protein_g"
            name="protein_g"
            label={t('createRecipe.protein')}
            placeholder={t('createRecipe.proteinPlace')}
            value={protein.toString()}
            onChange={(e) => setProtein(Number(e.target.value))}
          />

          <InputField
            id="carbs_g"
            name="carbs_g"
            label={t('createRecipe.carbs')}
            placeholder={t('createRecipe.carbsPlace')}
            value={carbs.toString()}
            onChange={(e) => setCarbs(Number(e.target.value))}
          />

          <InputField
            id="fat_g"
            name="fat_g"
            label={t('createRecipe.fat')}
            placeholder={t('createRecipe.fatPlace')}
            value={fat.toString()}
            onChange={(e) => setFat(Number(e.target.value))}
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
                  const file = e.target.files?.[0] ?? null;

                  try {
                    const validFile = validateImageFile(file, t, {
                      maxSizeMB: 10,
                    });
                    setFileName(validFile?.name ?? '');
                    setImageFile(validFile);
                  } catch (err: unknown) {
                    const message =
                      err instanceof Error
                        ? err.message
                        : t('error.genericError');
                    showNotification(message, 'error');
                    setFileName('');
                    setImageFile(null);
                  }
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
              defaultText={t('editRecipe.submit')}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRecipeModal;
