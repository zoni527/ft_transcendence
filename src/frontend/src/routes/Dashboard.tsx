import { cardBase } from '../styles/styles';

const Dashboard = () => {
  const user = {
    email: 'user@example.com',
    displayName: 'Hardcoded User',
    id: '123456',
    followers: ['(id: xxx / shown as Johnny)', '(id: xxx / shown as Lily)'],
    following: ['(id: xxx / shown as Grandma)', '(id: xxx / shown as Anton)'],
    recipe_favourite: ['(id: xxx / shown as Spaghetti)'],
  };

  return (
    <div className={`${cardBase} mt-8 p-8 wrap-anywhere`}>
      {/* Header */}
      <h1 className="mb-12 text-2xl font-semibold text-amber-900">
        Welcome, {user.displayName}!
      </h1>

      <div className="space-y-12">
        {/* User Info */}
        <div className="space-y-4">
          <p className="text-lg">
            <strong>Email:</strong> {user.email}
          </p>
          <p className="text-lg">
            <strong>Display Name:</strong> {user.displayName}
          </p>
          <p className="text-lg">
            <strong>User ID:</strong> {user.id}
          </p>
        </div>

        <div className="space-y-4">
          {/* Followers */}
          <p className="text-lg">
            <strong>Followers:</strong> {user.followers.join(', ')}
          </p>

          {/* Following */}
          <p className="text-lg">
            <strong>Following:</strong> {user.following.join(', ')}
          </p>
        </div>

        <div>
          {/* Favourite Recipes */}
          <p className="text-lg">
            <strong>Favourite Recipes: </strong>
            {user.recipe_favourite.join(', ')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
