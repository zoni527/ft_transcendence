import { useNavigate } from 'react-router-dom';
import InputField from '../components/InputField';
import { cardBase, buttonBase } from '../styles/styles';

const Login = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    void navigate('/dashboard'); // This will have a proper authentication and fetch of the user detail from the backend
  };

  return (
    <div className={`${cardBase} mx-auto mt-8 max-w-sm p-8`}>
      {/* Header */}
      <h1 className="mb-6 text-center text-2xl font-semibold text-amber-900">
        Login
      </h1>

      {/* Input Fields */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <InputField
          id="email"
          name="email"
          label="Email"
          type="email"
          placeholder="Enter your email"
        />

        <InputField
          id="password"
          name="password"
          label="Password"
          type="password"
          placeholder="Enter your password"
        />

        {/* Submit Button */}
        <button type="submit" className={`${buttonBase} mt-6`}>
          Continue
        </button>
      </form>
    </div>
  );
};

export default Login;
