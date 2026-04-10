import { useState } from 'react';
import DetailField from '../components/DetailField';
import { cardBase } from '../styles/styles';

// This whole section up will get modified when we get user api endpoint
const Dashboard = () => {
  const user = {
    email: 'user@example.com',
    displayName: 'Hardcoded User',
    id: '123456',
    followers: ['(id: xxx / shown as Johnny)', '(id: xxx / shown as Lily)'],
    following: ['(id: xxx / shown as Grandma)', '(id: xxx / shown as Anton)'],
    recipe_favourite: ['(id: xxx / shown as Spaghetti)'],
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  //

  return (
    <div className={`${cardBase} mt-8 p-8 wrap-anywhere`}>
      {loading ? (
        <p className="justify-self-start">Loading user...</p>
      ) : error ? (
        <p className="justify-self-start text-red-500">{error}</p>
      ) : (
        <>
          {/* Header */}
          <h1 className="mb-6 text-2xl font-semibold text-amber-900">
            Welcome, {user.displayName}!
          </h1>

          {/* User Info Fields */}
          <div className="mt-6 space-y-16">
            <div className="flex gap-8">
              {/* Left */}
              <div className="flex-1 space-y-2">
                <DetailField label="Username" value={user.displayName} />
                <DetailField label="Email" value={user.email} />
              </div>

              {/* Right */}
              <div className="flex-1 space-y-2">
                <DetailField label="ID" value={user.id} />
              </div>
            </div>

            {/* Bottom */}
            <div className="w-full space-y-2">
              <DetailField
                label="Followers"
                value={user.followers.join(', ')}
              />
              <DetailField
                label="Following"
                value={user.following.join(', ')}
              />
              <DetailField
                label="Favourite Recipes"
                value={user.recipe_favourite.join(', ')}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
