import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SearchField from './SearchField.tsx';
import { useAuth } from '../utils/AuthContext';
import { getSearch, sendFriendship } from '../api.tsx';
import type { getSearchResponse } from '../api.tsx';
import { useNotification } from '../utils/NotifContext.ts';

type SearchBarProps = {
  onClose: () => void;
  onSelectUser: (user: getSearchResponse) => void;
};

const SearchBar = ({ onClose, onSelectUser }: SearchBarProps) => {
  const { showNotification } = useNotification();
  const { loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const [results, setResults] = useState<getSearchResponse[]>([]);

  const handleSelectUser = (user: getSearchResponse) => {
    if (authLoading || loading) return;

    setLoading(true);

    sendFriendship(user.id, t)
      .then(() => {
        showNotification(t('notification.friendRequestSent'), 'success');

        onSelectUser(user);
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : t('error.genericError');

        showNotification(message, 'error');
      })
      .finally(() => {
        setLoading(false);
        setResults([]);
        onClose();
      });
  };

  const handleSearch = (query: string) => {
    if (loading) return;

    getSearch(query, t)
      .then((found) => {
        setResults(found);
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : t('error.genericError');

        showNotification(message, 'error');
      });
  };

  return (
    <div className="relative w-full">
      <SearchField onSearch={handleSearch} />

      <div className="mt-8 max-h-46 overflow-y-auto rounded-md border border-gray-300 bg-white shadow-[0px_0px_5px_0px_rgba(0,0,0,0.2)]">
        {results.length > 0 ? (
          <ul>
            {results.map((user) => (
              <li
                key={user.id}
                onClick={() => handleSelectUser(user)}
                className="cursor-pointer border-b border-gray-300 px-4 py-2 text-gray-800 last:border-b-0 hover:bg-gray-100"
              >
                {user.display_name}
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-4 py-3 text-sm text-gray-400">
            {t('dashboard.noResults')}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
