import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import InputField from '../components/InputField';
import SubmitButton from '../components/SubmitButton';
import { postLogin } from '../api';
import { getStringValue } from '../utils/utils';
import { cardBase } from '../styles/styles';

// Validation schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Invalid email' }),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const Login = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Input validation
    const result = loginSchema.safeParse({
      email: getStringValue(formData, 'email'),
      password: getStringValue(formData, 'password'),
    });

    if (!result.success) {
      setError(result.error.issues[0]?.message || 'Invalid input');
    } else {
      setLoading(true);

      // POST /api/users/login (user login)
      postLogin({
        email: result.data.email,
        password: result.data.password,
      })
        .then(() => {
          void navigate('/dashboard');
        })
        .catch((err: unknown) => {
          if (err instanceof Error) setError(err.message);
          else setError('Something went wrong. Please try again.');
        })
        .finally(() => setLoading(false));
    }
  };

  return (
    <div className={`${cardBase} mx-auto mt-8 max-w-sm p-8`}>
      {/* Header */}
      <h1 className="mb-6 text-center text-2xl font-semibold text-amber-900">
        Log in
      </h1>

      {/* Input Fields */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email */}
        <InputField
          id="email"
          name="email"
          label="Email"
          type="email"
          placeholder="Enter your email"
        />

        {/* Password */}
        <InputField
          id="password"
          name="password"
          label="Password"
          type="password"
          placeholder="Enter your password"
        />

        {/* Errors & Warnings */}
        <p className="text-md min-h-5 text-center text-red-500">
          {error || '\u00A0'}
        </p>

        {/* Submit Button */}
        <div className="flex justify-center">
          <SubmitButton
            isLoading={loading}
            pendingText="Logging in"
            defaultText="Continue"
          />
        </div>
      </form>
    </div>
  );
};

export default Login;
