import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { z } from 'zod';
import FormHeader from '../components/FormHeader';
import InputField from '../components/InputField';
import SubmitButton from '../components/SubmitButton';
import {
  putUpdateUser,
  getCloudinarySignatureAvatar,
  uploadImageToCloudinary,
} from '../api';
import { useAuth } from '../utils/AuthContext';
import { useNotification } from '../utils/NotifContext';
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
      password: z
        .string()
        .refine(
          (val) => val === '' || val.length >= 8,
          t('signupValidation.passwordLen'),
        ),

      confirmPassword: z.string(),
    })
    .refine(
      (data) => {
        // no password change
        if (data.password === '') return true;

        return data.password === data.confirmPassword;
      },
      {
        message: t('signupValidation.passwordMatch'),
        path: ['confirmPassword'],
      },
    );

const EditUserModal = ({ user, onClose }: EditUserModalProps) => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  // Controlled input states
  const [fullName, setFullName] = useState(user.name);
  const [username, setUsername] = useState(user.display_name);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fileName, setFileName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

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
    void handleSubmitAsync();
  };

  const handleSubmitAsync = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const schema = editUserSchema(t);

      const result = schema.safeParse({
        fullName,
        username,
        email,
        password,
        confirmPassword,
      });

      if (!result.success) {
        throw new Error(result.error.issues[0]?.message || t('error.input'));
      }

      let avatar_url = user.avatar_url;

      if (imageFile) {
        const signature = await getCloudinarySignatureAvatar(t);
        avatar_url = await uploadImageToCloudinary(imageFile, signature, t);
      }

      const id = user.id;

      const updatedUser = await putUpdateUser(
        {
          email: result.data.email,
          password: result.data.password == '' ? null : result.data.password,
          name: result.data.fullName,
          display_name: result.data.username,
          avatar_url,
        },
        id,
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
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <InputField
            id="username"
            name="username"
            label={t('signup.username')}
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <InputField
            id="email"
            name="email"
            label={t('signup.email')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <InputField
            id="password"
            name="password"
            label={t('signup.password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <InputField
            id="confirmPassword"
            name="confirmPassword"
            label={t('signup.rePassword')}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
                  const file = e.target.files?.[0] || null;
                  setFileName(file ? file.name : '');
                  setImageFile(file);
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
