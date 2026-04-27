import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import InputField from '../components/InputField';
import SubmitButton from '../components/SubmitButton';
import { postSignup } from '../api';
import { getStringValue } from '../utils/utils';
import type { LoginSignupResponse } from '../types/types';
import { cardBase } from '../styles/styles';

// Validation schema
const signupSchema = z
  .object({
    fullName: z.string().min(1, 'Full name is required'),
    username: z.string().min(1, 'Username / alias is required'),
    email: z
      .string()
      .min(1, { message: 'Email is required' })
      .email({ message: 'Invalid email' }),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const Signup = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Input validation
    const result = signupSchema.safeParse({
      fullName: getStringValue(formData, 'fullName'),
      username: getStringValue(formData, 'username'),
      email: getStringValue(formData, 'email'),
      password: getStringValue(formData, 'password'),
      confirmPassword: getStringValue(formData, 'confirmPassword'),
    });

    if (!result.success) {
      setError(result.error.issues[0]?.message || 'Invalid input');
    } else {
      setLoading(true);

      // POST /api/users (create a new user)
      postSignup({
        email: result.data.email,
        password: result.data.password,
        name: result.data.fullName,
        display_name: result.data.username,
      })
        .then((response: LoginSignupResponse) => {
          if (response.authenticated) void navigate('/dashboard');
          else void navigate('/login');
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
        Sign up
      </h1>

      {/* Input Fields */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Full Name */}
        <InputField
          id="fullName"
          name="fullName"
          label="Full Name"
          type="text"
          placeholder="Enter your full name"
        />

        {/* Username */}
        <InputField
          id="username"
          name="username"
          label="Username / Alias"
          type="text"
          placeholder="Enter your username / alias"
        />

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

        {/* Confirm Password */}
        <InputField
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm Password"
          type="password"
          placeholder="Re-enter your password"
        />

        {/* Errors & Warnings */}
        <p className="text-md min-h-5 text-center text-red-500">
          {error || '\u00A0'}
        </p>

        {/* Submit Button */}
        <div className="flex justify-center">
          <SubmitButton
            isLoading={loading}
            pendingText="Signing up"
            defaultText="Continue"
          />
        </div>
      </form>
    </div>
  );
};

export default Signup;
