import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import SearchField from './SearchField.tsx';
import { useAuth } from '../utils/AuthContext';
import { getSearch } from '../api.tsx';
import type { getSearchResponse } from '../api.tsx';
import { useNotification } from '../utils/NotifContext.ts';

const SearchBar = () => {
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const { loading } = useAuth();
  const { t } = useTranslation();

  const [results, setResults] = useState<getSearchResponse[]>([]);
  const [open, setOpen] = useState(false);

  const handleSelectUser = (id: string) => {
    setOpen(false);
    setResults([]);
    void navigate(`/users/${id}`);
  };

  const handleSearch = (query: string) => {
    if (loading) return;

    getSearch(query, t)
      .then((found) => {
        setResults(found);
        setOpen(true);
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : t('error.genericError');

        showNotification(message, 'error');
      });
  };

  return (
    <div className={`mt-2 px-4 py-3`}>
      <div className="relative flex items-center">
        {/* Left (Desktop only) */}

        <div className="relative w-full md:w-auto">
          <SearchField onSearch={handleSearch} />

          {open && results.length > 0 && (
            <ul className="absolute left-0 z-50 mt-2 w-full rounded-md border bg-white shadow-lg">
              {results.map((user) => (
                <li
                  key={user.id}
                  onClick={() => handleSelectUser(user.id)}
                  className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                >
                  {user.username}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
