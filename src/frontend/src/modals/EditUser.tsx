import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { z } from 'zod';
import FormHeader from '../components/FormHeader';
import InputField from '../components/InputField';
import RolesCheckboxes from '../components/RolesCheckboxes';
import SubmitButton from '../components/SubmitButton';
import {
  putUpdateUser,
  getCloudinarySignatureAvatar,
  uploadImageToCloudinary,
} from '../api';
import { useAuth } from '../utils/AuthContext';
import { useNotification } from '../utils/NotifContext';
import { validateImageFile } from '../utils/utils';
import type { UpdateUserPayload } from '../api';
import type { User } from '../types/types';
import { cardBase, uploadButtonBase } from '../styles/styles';

type EditUserModalProps = {
  user: User;
  onClose: () => void;
  onSave: (updatedUser: User) => void;
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

const EditUserModal = ({ user, onClose, onSave }: EditUserModalProps) => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const { login, user: authUser, hasRole } = useAuth();
  const [roles, setRoles] = useState<string[] | null>(user.roles ?? null);

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

      const payload: UpdateUserPayload = {
        email: result.data.email,
        password: result.data.password === '' ? null : result.data.password,
        name: result.data.fullName,
        display_name: result.data.username,
        avatar_url,
      };

      if (hasRole(['admin']) && !isSelf && roles !== null) {
        payload.roles = roles;
      }

      const updatedUser = await putUpdateUser(payload, id, t);

      if (authUser?.id === updatedUser.id) {
        login(updatedUser);
      }

      onSave(updatedUser);

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

  const isSelf = authUser?.id === user.id;

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
            placeholder={t('signup.namePlace')}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
          />

          <InputField
            id="username"
            name="username"
            label={t('signup.username')}
            type="text"
            placeholder={t('signup.usernamePlace')}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />

          {hasRole(['admin']) && !isSelf && (
            <RolesCheckboxes roles={roles} onChange={setRoles} />
          )}

          <InputField
            id="email"
            name="email"
            label={t('signup.email')}
            type="email"
            placeholder={t('signup.emailPlace')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />

          {isSelf && (
            <InputField
              id="password"
              name="password"
              label={t('signup.password')}
              type="password"
              placeholder={t('signup.passwordPlace')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          )}

          {isSelf && (
            <InputField
              id="confirmPassword"
              name="confirmPassword"
              label={t('signup.rePassword')}
              type="password"
              placeholder={t('signup.rePasswordPlace')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          )}

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
                  const file = e.target.files?.[0] ?? null;

                  try {
                    const validFile = validateImageFile(file, t, {
                      maxSizeMB: 5,
                    });
                    setFileName(validFile?.name ?? '');
                    setImageFile(validFile);
                  } catch (err: unknown) {
                    const message =
                      err instanceof Error
                        ? err.message
                        : t('error.genericError');
                    showNotification(message, 'error');
                    setFileName('');
                    setImageFile(null);
                  }
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
              className="rounded-full border-3 border-orange-700 hover:border-orange-800"
              isLoading={loading}
              defaultText={t('editUser.submit')}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
