import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { z } from 'zod';
import FormHeader from '../components/FormHeader';
import InputField from '../components/InputField';
import SubmitButton from '../components/SubmitButton';
import { getMe, postLogin } from '../api';
import { useAuth } from '../utils/AuthContext';
import { useNotification } from '../utils/NotifContext.ts';
import { getStringValue, hasControlChars } from '../utils/utils';
import { cardBase } from '../styles/styles';

// Validation schema
const loginSchema = (t: TFunction) =>
  z.object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(5, t('signupValidation.invalidEmail'))
      .max(254, t('signupValidation.invalidEmail'))
      .email(t('signupValidation.invalidEmail')),

    password: z
      .string()
      .min(8, t('signupValidation.passwordLen'))
      .max(72, t('signupValidation.passwordTooLong'))
      .refine((val) => !hasControlChars(val), {
        message: t('signupValidation.passwordControlChars'),
      }),
  });

const Login = () => {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { login } = useAuth();

  // Normal login
  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Input validation
    const schema = loginSchema(t);

    const result = schema.safeParse({
      email: getStringValue(formData, 'email'),
      password: getStringValue(formData, 'password'),
    });

    if (!result.success) {
      showNotification(
        result.error.issues[0]?.message || t('error.input'),
        'error',
      );
    } else {
      setLoading(true);

      // POST /api/auth/login (user login)
      postLogin(
        {
          email: result.data.email,
          password: result.data.password,
        },
        t,
      )
        .then(async () => {
          const user = await getMe(t);

          login(user);

          showNotification(t('notification.loginSuccess'), 'success');
          void navigate('/');
        })
        .catch((err: unknown) => {
          const message =
            err instanceof Error ? err.message : t('error.genericError');

          showNotification(message, 'error');
        })
        .finally(() => setLoading(false));
    }
  };

  // Google auth
  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google/login';
  };

  return (
    <div className={`${cardBase} mx-auto mt-8 max-w-sm p-8`}>
      {/* Header */}
      <FormHeader title={t('login.header')} />

      {/* Input Fields */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email */}
        <InputField
          id="email"
          name="email"
          label={t('login.email')}
          type="email"
          placeholder={t('login.emailPlace')}
          autoComplete="email"
        />

        {/* Password */}
        <InputField
          id="password"
          name="password"
          label={t('login.password')}
          type="password"
          placeholder={t('login.passwordPlace')}
          autoComplete="current-password"
        />

        {/* Submit Button */}
        <div className="mt-12 flex justify-center">
          <SubmitButton
            className="rounded-full border-3 border-orange-700 hover:border-orange-800"
            isLoading={loading}
            defaultText={t('login.submit')}
          />
        </div>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <hr className="grow border-t border-gray-300" />
          <span className="mx-4 font-medium text-gray-500">
            {t('login.or')}
          </span>
          <hr className="grow border-t border-gray-300" />
        </div>

        {/* Google Button */}
        <div className="mt-4 flex justify-center">
          <SubmitButton
            type="button"
            onClick={handleGoogleLogin}
            isLoading={false}
            defaultText={t('login.google')}
            className="rounded-full border-3 border-orange-700 hover:border-orange-800"
          />
        </div>
      </form>
    </div>
  );
};

export default Login;
