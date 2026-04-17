import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postSignup } from '../api';
import InputField from '../components/InputField';
import { cardBase, buttonBase } from '../styles/styles';
import { z } from 'zod';

// Validation schema
const signupSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    displayName: z.string().min(1, 'Display name is required'),
    email: z
      .string()
      .min(1, { message: 'Email is required' })
      .email({ message: 'Invalid email' }),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
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

    // Helper to safely get string values
    function getStringValue(name: string): string {
      const value = formData.get(name);
      if (typeof value === 'string') return value.trim();
      return '';
    }

    // Basic input validation
    const result = signupSchema.safeParse({
      name: getStringValue('name'),
      displayName: getStringValue('displayName'),
      email: getStringValue('email'),
      password: getStringValue('password'),
      confirmPassword: getStringValue('confirmPassword'),
    });

    if (!result.success) {
      setError(result.error.issues[0]?.message || 'Invalid input');
    } else {
      setLoading(true);

      // POST Signup API call
      postSignup({
        email: result.data.email,
        password: result.data.password,
        name: result.data.name,
        display_name: result.data.displayName,
      })
        .then(() => {
          void navigate('/dashboard');
        })
        .catch((err: unknown) => {
          if (err instanceof Error) setError(err.message);
          else setError('Something went wrong');
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
        {/* Name */}
        <InputField
          id="name"
          name="name"
          label="Name"
          type="text"
          placeholder="Enter your name"
        />

        {/* Display Name */}
        <InputField
          id="displayName"
          name="displayName"
          label="Display Name"
          type="text"
          placeholder="Enter your display name"
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
        <button type="submit" className={buttonBase} disabled={loading}>
          {loading && !error ? 'Signing up...' : 'Continue'}
        </button>
      </form>
    </div>
  );
};

export default Signup;
