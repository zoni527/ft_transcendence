import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type SearchFieldProps = {
  placeholder?: string;
  onSearch: (value: string) => void;
};

const SearchField = ({ placeholder, onSearch }: SearchFieldProps) => {
  const { t } = useTranslation();
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch(value.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder || t('common.searchUser')}
        className="text-md block w-full rounded-full border border-gray-700 bg-white px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-orange-800 focus:outline-none"
      />
    </form>
  );
};

export default SearchField;
