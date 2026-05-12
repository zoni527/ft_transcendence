import { useState } from 'react';

type SearchFieldProps = {
  placeholder?: string;
  onSearch: (value: string) => void;
};

const SearchField = ({
  placeholder = 'Search...',
  onSearch,
}: SearchFieldProps) => {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(value.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
      />

      <button
        type="submit"
        className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Search
      </button>
    </form>
  );
};

export default SearchField;
