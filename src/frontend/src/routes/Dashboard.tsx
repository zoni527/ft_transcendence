import { useEffect, useState } from 'react';
import DataField from '../components/DataField';
import NavButton from '../components/NavButton';
import { getUser } from '../api';
import type { User } from '../types/types';
import { cardBase, buttonBase } from '../styles/styles';

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loading = !user && !error;

  useEffect(() => {
    getUser()
      .then(setUser)
      .catch((err: unknown) => {
        if (err instanceof Error) setError(err.message);
        else setError('Failed to load user');
      });
  }, []);

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (loading) {
    return <p>Loading user...</p>;
  }

  if (!user) {
    return <p>User not found</p>;
  }

  return (
    <div className={`${cardBase} mt-8 p-8 wrap-anywhere`}>
      {/* Header */}
      <h1 className="mb-6 text-2xl font-semibold text-amber-900">
        Welcome, {user.name}!
      </h1>

      {/* User Info Fields */}
      <div className="mt-6 space-y-16">
        <div className="flex gap-8">
          {/* Left */}
          <div className="flex-1 space-y-2">
            <DataField label="Username" value={user.display_name} />
            <DataField label="Email" value={user.email} />
          </div>

          {/* Right */}
          <div className="flex-1 space-y-2">
            <DataField label="ID" value={user.id} />
          </div>
        </div>

        {/* Bottom */}
        <div className="w-full space-y-2">
          <DataField label="Created at" value={user.created_at} />
          <DataField label="Updated at" value={user.updated_at} />
          <DataField label="Roles" value={user.roles.join(', ')} />
        </div>
        <NavButton path="/create" className={`${buttonBase}`}>
          Create Recipe
        </NavButton>
      </div>
    </div>
  );
};

export default Dashboard;
