import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import FormHeader from '../components/FormHeader';
import InputField from '../components/InputField';
import SubmitButton from '../components/SubmitButton';
import { useNotification } from '../utils/NotifContext';
import type { User } from '../types/types';
import { cardBase } from '../styles/styles';

type EditUserModalProps = {
  user: User;
  onClose: () => void;
};

const EditUserModal = ({ user, onClose }: EditUserModalProps) => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(user.name);
  const [displayName, setDisplayName] = useState(user.display_name);
  const [email, setEmail] = useState(user.email);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);

    try {
      // TODO: replace with your real API call
      await new Promise((res) => setTimeout(res, 800));

      showNotification(t('notification.updateUserSuccess'), 'success');
      onClose();
    } catch (err) {
      showNotification(t('error.genericError'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div
        className={`${cardBase} relative z-10 max-h-[90vh] w-full max-w-xl overflow-y-auto p-8`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
        >
          ✕
        </button>

        {/* Sticky header (nice UX) */}
        <div className="sticky top-0 z-10 bg-white pb-4">
          <FormHeader title={t('dashboard.editUser')} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <InputField
            id="name"
            name="name"
            label={t('dashboard.name')}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <InputField
            id="display_name"
            name="display_name"
            label={t('dashboard.username')}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />

          <InputField
            id="email"
            name="email"
            label={t('dashboard.email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="mt-12 flex justify-center">
            <SubmitButton
              className="rounded-full bg-orange-700 hover:bg-orange-800"
              isLoading={loading}
              pendingText={t('editUser.saving')}
              defaultText={t('editUser.save')}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
