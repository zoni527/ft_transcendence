import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { z } from 'zod';
import FormHeader from '../components/FormHeader';
import InputField from '../components/InputField';
import SubmitButton from '../components/SubmitButton';
import { postLogin } from '../api';
import { getStringValue } from '../utils/utils';
import { cardBase } from '../styles/styles';

// Validation schema
const loginSchema = (t: TFunction) =>
  z.object({
    email: z
      .string()
      .min(1, t('loginValidation.emailRequired'))
      .email(t('loginValidation.invalidEmail')),
    password: z.string().min(8, t('loginValidation.passwordLen')),
  });

const Login = () => {
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
    const schema = loginSchema(t);

    const result = schema.safeParse({
      email: getStringValue(formData, 'email'),
      password: getStringValue(formData, 'password'),
    });

    if (!result.success) {
      setError(result.error.issues[0]?.message || t('error.input'));
    } else {
      setLoading(true);

      // POST /api/users/login (user login)
      postLogin(
        {
          email: result.data.email,
          password: result.data.password,
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
        />

        {/* Password */}
        <InputField
          id="password"
          name="password"
          label={t('login.password')}
          type="password"
          placeholder={t('login.passwordPlace')}
        />

        {/* Errors & Warnings */}
        <p className="text-md min-h-5 text-center text-red-500">
          {error || '\u00A0'}
        </p>

        {/* Submit Button */}
        <div className="flex justify-center">
          <SubmitButton
            isLoading={loading}
            pendingText={t('login.submitPending')}
            defaultText={t('login.submit')}
          />
        </div>
      </form>
    </div>
  );
};

export default Login;
