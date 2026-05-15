import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { inputFieldBase } from '../styles/styles';

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
        className={`${inputFieldBase} rounded-full shadow-[0px_0px_5px_0px_rgba(0,0,0,0.2)]`}
      />
    </form>
  );
};

export default SearchField;
