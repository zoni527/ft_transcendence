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

      // POST /api/users/login (user login)
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
          void navigate('/dashboard');
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

        {/* Submit Button */}
        <div className="mt-12 flex justify-center">
          <SubmitButton
            className="rounded-full bg-orange-700 hover:bg-orange-800"
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
