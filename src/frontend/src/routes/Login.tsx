import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import InputField from '../components/InputField';
import { cardBase, buttonBase } from '../styles/styles';

const Login = () => {
  const [error, setError] = useState('');
  //   const navigate = useNavigate();

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

    const email = getStringValue('email');
    const password = getStringValue('password');

    if (!email || !password) {
      setError('All fields are required.');
      return;
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
        <button type="submit" className={`${buttonBase}`}>
          Continue
        </button>
      </form>
    </div>
  );
};

export default Login;
