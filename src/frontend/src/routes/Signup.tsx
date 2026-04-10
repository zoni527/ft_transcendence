import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postSignup } from '../api';
import InputField from '../components/InputField';
import { cardBase, buttonBase } from '../styles/styles';

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

    const username = getStringValue('username');
    const email = getStringValue('email');
    const password = getStringValue('password');
    const confirmPassword = getStringValue('confirmPassword');

    // Basic input validation
    if (!username || !email || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    // POST Signup API call
    postSignup({ username, email, password })
      .then(() => {
        void navigate('/dashboard');
      })
      .catch((err: unknown) => {
        if (err instanceof Error) setError(err.message);
        else setError('Something went wrong. Please try again.');
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className={`${cardBase} mx-auto mt-8 max-w-sm p-8`}>
      {/* Header */}
      <h1 className="mb-6 text-center text-2xl font-semibold text-amber-900">
        Sign up
      </h1>

      {/* Input Fields */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Username */}
        <InputField
          id="username"
          name="username"
          label="Username"
          type="text"
          placeholder="Enter your username"
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
