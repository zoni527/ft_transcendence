import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { z } from 'zod';
import FormHeader from '../components/FormHeader';
import InputField from '../components/InputField';
import SubmitButton from '../components/SubmitButton';
import {
  putUpdateMe,
  getCloudinarySignatureAvatar,
  uploadImageToCloudinary,
} from '../api';
import { useAuth } from '../utils/AuthContext';
import { useNotification } from '../utils/NotifContext';
import { getStringValue } from '../utils/utils';
import type { User } from '../types/types';
import { cardBase, uploadButtonBase } from '../styles/styles';

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
  const { login } = useAuth();
  const [fileName, setFileName] = useState('');

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
    void handleSubmitAsync(e);
  };

  const handleSubmitAsync = async (
    e: React.SyntheticEvent<HTMLFormElement>,
  ) => {
    if (loading) return;

    setLoading(true);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);

      const schema = editUserSchema(t);

      const result = schema.safeParse({
        fullName: getStringValue(formData, 'fullName'),
        username: getStringValue(formData, 'username'),
        email: getStringValue(formData, 'email'),
        password: getStringValue(formData, 'password'),
        confirmPassword: getStringValue(formData, 'confirmPassword'),
      });

      if (!result.success) {
        throw new Error(result.error.issues[0]?.message || t('error.input'));
      }

      const image = formData.get('image');

      let avatar_url = user.avatar_url;

      if (image instanceof File && image.size > 0) {
        const signature = await getCloudinarySignatureAvatar(t);
        avatar_url = await uploadImageToCloudinary(image, signature, t);
      }

      const updatedUser = await putUpdateMe(
        {
          email: result.data.email,
          password: result.data.password,
          name: result.data.fullName,
          display_name: result.data.username,
          avatar_url,
        },
        t,
      );

      login(updatedUser);

      showNotification(t('notification.updateUserSuccess'), 'success');

      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : t('error.genericError');

      showNotification(message, 'error');
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

          {/* Image Upload */}
          <div className="mt-12 flex items-center gap-3">
            <label className={uploadButtonBase}>
              📁 {t('editUser.uploadAvatar')}
              <input
                type="file"
                name="image"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setFileName(file ? file.name : '');
                }}
              />
            </label>

            <span className="text-sm text-gray-600">
              {fileName || t('common.noFile')}
            </span>
          </div>

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
