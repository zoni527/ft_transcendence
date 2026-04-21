import { useState } from 'react';
import InputField from '../components/InputField';
import InputTextArea from '../components/InputTextArea';
import SelectField from '../components/SelectField';
import { cardBase, buttonBase } from '../styles/styles';

const CreateRecipe = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    setLoading(true);
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
          id="protein"
          name="protein"
          label="Protein (grams)"
          placeholder="Enter the amount of protein in grams"
        />

        {/* Carbohydrates */}
        <InputField
          id="carbs"
          name="carbs"
          label="Carbohydrates (grams)"
          placeholder="Enter the amount of carbohydrates in grams"
        />

        {/* Fat */}
        <InputField
          id="fat"
          name="fat"
          label="Fat (grams)"
          placeholder="Enter the amount of fat in grams"
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
