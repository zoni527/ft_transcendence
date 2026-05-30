import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { z } from 'zod';
import FormHeader from '../components/FormHeader';
import InputField from '../components/InputField';
import SubmitButton from '../components/SubmitButton';
import { getMe, postSignup } from '../api';
import { useAuth } from '../utils/AuthContext';
import { useNotification } from '../utils/NotifContext.ts';
import { getStringValue, hasControlChars } from '../utils/utils';
import { cardBase } from '../styles/styles';

// Validation schema
const fullNameRegex = /^(?=.{2,}$)(?!.*[ '-]{2})[\p{L}]+(?:[ '-][\p{L}]+)*$/u;
const usernameRegex =
  /^(?=.{3,15}$)(?!.*[_.-]{2})[A-Za-z0-9]+(?:[_.-][A-Za-z0-9]+)*$/;

const signupSchema = (t: TFunction) =>
  z
    .object({
      fullName: z
        .string()
        .trim()
        .min(2, t('signupValidation.invalidName'))
        .max(50, t('signupValidation.invalidName'))
        .refine((value) => fullNameRegex.test(value), {
          message: t('signupValidation.invalidName'),
        }),

      username: z
        .string()
        .trim()
        .min(3, t('signupValidation.invalidUsername'))
        .max(30, t('signupValidation.invalidUsername'))
        .refine((value) => usernameRegex.test(value), {
          message: t('signupValidation.invalidUsername'),
        }),

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

      confirmPassword: z.string().min(8, t('signupValidation.passwordConfirm')),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('signupValidation.passwordMatch'),
      path: ['confirmPassword'],
    });

const Signup = () => {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { login } = useAuth();

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Input validation
    const schema = signupSchema(t);

    const result = schema.safeParse({
      fullName: getStringValue(formData, 'fullName'),
      username: getStringValue(formData, 'username'),
      email: getStringValue(formData, 'email'),
      password: getStringValue(formData, 'password'),
      confirmPassword: getStringValue(formData, 'confirmPassword'),
    });

    if (!result.success) {
      showNotification(
        result.error.issues[0]?.message || t('error.input'),
        'error',
      );
    } else {
      setLoading(true);

      // POST /api/users (create a new user)
      postSignup(
        {
          email: result.data.email,
          password: result.data.password,
          name: result.data.fullName,
          display_name: result.data.username,
        },
        t,
      )
        .then(async () => {
          const user = await getMe(t);

          login(user);

          showNotification(t('notification.signupSuccess'), 'success');
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

  return (
    <div className={`${cardBase} mx-auto mt-8 max-w-sm p-8`}>
      {/* Header */}
      <FormHeader title={t('signup.header')} />

      {/* Input Fields */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Full name */}
        <InputField
          id="fullName"
          name="fullName"
          label={t('signup.name')}
          type="text"
          placeholder={t('signup.namePlace')}
          autoComplete="name"
        />

        {/* Username */}
        <InputField
          id="username"
          name="username"
          label={t('signup.username')}
          type="text"
          placeholder={t('signup.usernamePlace')}
          autoComplete="username"
        />

        {/* Email */}
        <InputField
          id="email"
          name="email"
          label={t('signup.email')}
          type="email"
          placeholder={t('signup.emailPlace')}
          autoComplete="email"
        />

        {/* Password */}
        <InputField
          id="password"
          name="password"
          label={t('signup.password')}
          type="password"
          placeholder={t('signup.passwordPlace')}
          autoComplete="new-password"
        />

        {/* Confirm Password */}
        <InputField
          id="confirmPassword"
          name="confirmPassword"
          label={t('signup.rePassword')}
          type="password"
          placeholder={t('signup.rePasswordPlace')}
          autoComplete="new-password"
        />

        {/* Submit Button */}
        <div className="mt-12 flex justify-center">
          <SubmitButton
            className="rounded-full border-3 border-orange-700 hover:border-orange-800"
            isLoading={loading}
            defaultText={t('signup.submit')}
          />
        </div>
      </form>
    </div>
  );
};

export default Signup;
