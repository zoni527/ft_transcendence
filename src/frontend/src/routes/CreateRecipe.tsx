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
        <InputField id="title" name="title" label="Title" />

        {/* Description */}
        <InputTextArea
          id="description"
          name="description"
          label="Short description"
        />

        {/* Ingredients */}
        <InputTextArea
          id="ingredients"
          name="ingredients"
          label="Ingredients (one per line)"
        />

        {/* Instructions */}
        <InputTextArea
          id="instructions"
          name="instructions"
          label="Instructions"
        />

        {/* Category */}
        <SelectField
          id="category"
          name="category"
          label="Category"
          options={[
            { value: 'breakfast', label: 'Breakfast' },
            { value: 'lunch', label: 'Lunch' },
            { value: 'dinner', label: 'Dinner' },
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
