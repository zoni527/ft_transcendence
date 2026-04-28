import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { z } from 'zod';
import FormHeader from '../components/FormHeader';
import InputField from '../components/InputField';
import SubmitButton from '../components/SubmitButton';
import { postSignup } from '../api';
import { getStringValue } from '../utils/utils';
import { cardBase } from '../styles/styles';

// Validation schema
const signupSchema = (t: TFunction) =>
  z
    .object({
      fullName: z.string().min(1, t('signupValidation.nameRequired')),
      username: z.string().min(1, t('signupValidation.usernameRequired')),
      email: z
        .string()
        .min(1, t('signupValidation.emailRequired'))
        .email(t('signupValidation.invalidEmail')),
      password: z.string().min(8, t('signupValidation.passwordLen')),
      confirmPassword: z.string().min(1, t('loginValidation.passwordConfirm')),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('loginValidation.passwordMatch'),
      path: ['confirmPassword'],
    });

const Signup = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    setError('');

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
      setError(result.error.issues[0]?.message || t('error.input'));
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
        .then(() => {
          void navigate('/dashboard');
        })
        .catch((err: unknown) => {
          if (err instanceof Error) setError(err.message);
          else setError(t('error.genericError'));
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
        {/* Full Name */}
        <InputField
          id="fullName"
          name="fullName"
          label={t('signup.name')}
          type="text"
          placeholder={t('signup.namePlace')}
        />

        {/* Username */}
        <InputField
          id="username"
          name="username"
          label={t('signup.username')}
          type="text"
          placeholder={t('signup.usernamePlace')}
        />

        {/* Email */}
        <InputField
          id="email"
          name="email"
          label={t('signup.email')}
          type="email"
          placeholder={t('signup.emailPlace')}
        />

        {/* Password */}
        <InputField
          id="password"
          name="password"
          label={t('signup.password')}
          type="password"
          placeholder={t('signup.passwordPlace')}
        />

        {/* Confirm Password */}
        <InputField
          id="confirmPassword"
          name="confirmPassword"
          label={t('signup.rePassword')}
          type="password"
          placeholder={t('signup.rePasswordPlace')}
        />

        {/* Errors & Warnings */}
        <p className="text-md min-h-5 text-center text-red-500">
          {error || '\u00A0'}
        </p>

        {/* Submit Button */}
        <div className="flex justify-center">
          <SubmitButton
            isLoading={loading}
            pendingText={t('signup.submitPending')}
            defaultText={t('signup.submit')}
          />
        </div>
      </form>
    </div>
  );
};

export default Signup;
