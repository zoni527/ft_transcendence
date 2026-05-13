import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import FormHeader from '../components/FormHeader.tsx';
import SearchBar from '../components/SearchBar.tsx';

import { cardBase } from '../styles/styles.tsx';

type AddFriendModalProps = {
  onClose: () => void;
  onSelectUser: () => void;
};

const AddFriendModal = ({ onClose, onSelectUser }: AddFriendModalProps) => {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal content */}
      <div
        className={`${cardBase} relative z-10 h-96 w-full max-w-xl overflow-visible p-8`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:cursor-pointer hover:text-black"
        >
          ✕
        </button>

        <FormHeader title={t('dashboard.addFriend')} />

        {/* Search bar */}
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <SearchBar onClose={onClose} onSelectUser={onSelectUser} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddFriendModal;
