import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { z } from 'zod';
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

// Validation schema
const editUserSchema = (t: TFunction) =>
  z
    .object({
      fullName: z.string().min(1, t('signupValidation.nameRequired')),
      username: z.string().min(1, t('signupValidation.usernameRequired')),
      email: z
        .string()
        .min(1, t('signupValidation.emailRequired'))
        .email(t('signupValidation.invalidEmail')),
      password: z.string().min(8, t('signupValidation.passwordLen')),
      confirmPassword: z.string().min(8, t('signupValidation.passwordConfirm')),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('signupValidation.passwordMatch'),
      path: ['confirmPassword'],
    });

const EditUserModal = ({ user, onClose }: EditUserModalProps) => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    const form = e.currentTarget;
    const formData = new FormData(form);

    const schema = editUserSchema(t);

    const result = schema.safeParse({
      fullName: formData.get('fullName'),
      username: formData.get('username'),
      email: formData.get('email'),
    });

    if (!result.success) {
      showNotification(
        result.error.issues[0]?.message || t('error.input'),
        'error',
      );
      return;
    }

    setLoading(true);

    // TODO: replace with real API call
    setTimeout(() => {
      showNotification(t('notification.updateUserSuccess'), 'success');
      setLoading(false);
      onClose();
    }, 600);
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
          className="absolute top-4 right-4 text-gray-500 hover:cursor-pointer hover:text-black"
        >
          ✕
        </button>

        <FormHeader title={t('editUser.header')} />

        {/* Information fields */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <InputField
            id="fullName"
            name="fullName"
            label={t('signup.name')}
            type="text"
            placeholder={user.name}
          />

          <InputField
            id="username"
            name="username"
            label={t('signup.username')}
            type="text"
            placeholder={user.display_name}
          />

          <InputField
            id="email"
            name="email"
            label={t('signup.email')}
            type="email"
            placeholder={user.email}
          />

          <InputField
            id="password"
            name="password"
            label={t('signup.password')}
            type="password"
            placeholder={t('signup.passwordPlace')}
          />

          <InputField
            id="confirmPassword"
            name="confirmPassword"
            label={t('signup.rePassword')}
            type="password"
            placeholder={t('signup.rePasswordPlace')}
          />

          {/* Submit */}
          <div className="mt-12 flex justify-center">
            <SubmitButton
              className="rounded-full bg-orange-700 hover:bg-orange-800"
              isLoading={loading}
              pendingText={t('editUser.submitPending')}
              defaultText={t('editUser.submit')}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
