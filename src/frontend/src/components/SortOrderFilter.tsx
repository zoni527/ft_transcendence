import { useTranslation } from 'react-i18next';

type SortOrder = 'oldest' | 'newest';

type SortOrderFilterProps = {
  value: SortOrder;
  onChange: (value: SortOrder) => void;
  onResetPage?: () => void;
};

const SortOrderFilter = ({
  value,
  onChange,
  onResetPage,
}: SortOrderFilterProps) => {
  const { t } = useTranslation();

  const handleChange = (newValue: SortOrder) => {
    onChange(newValue);
    onResetPage?.();
  };

  return (
    <div>
      <label className="text-md mt-12 mb-2 block font-semibold">
        {t('common.sortBy')}
      </label>

      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() => handleChange('newest')}
          className={`text-md w-full rounded-lg px-4 py-2 text-left transition hover:cursor-pointer ${
            value === 'newest'
              ? 'bg-orange-800/10 font-bold text-[#C04D31]'
              : 'text-gray-700'
          }`}
        >
          {t('common.newest')}
        </button>

        <button
          type="button"
          onClick={() => handleChange('oldest')}
          className={`text-md w-full rounded-lg px-4 py-2 text-left transition hover:cursor-pointer ${
            value === 'oldest'
              ? 'bg-orange-800/10 font-bold text-[#C04D31]'
              : 'text-gray-700'
          }`}
        >
          {t('common.oldest')}
        </button>
      </div>
    </div>
  );
};

export default SortOrderFilter;
