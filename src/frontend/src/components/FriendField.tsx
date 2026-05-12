import UserStatus from './UserStatus';
import type { User } from '../types/types';

interface FriendFieldProps {
  user: User;
}

const FriendField = ({ user }: FriendFieldProps) => {
  return (
    <>
      <div className="flex items-center justify-between border-b border-gray-300 pb-4">
        {/* User name */}
        <div className="flex-1 text-xl font-semibold text-gray-700">
          {user.name}
        </div>

        <div className="flex flex-col items-center gap-2 p-2 md:flex-row md:gap-3">
          {/* Buttons */}

          {/* Online/Offline Indicator */}
          <UserStatus isOnline={user.is_online} />
        </div>
      </div>
    </>
  );
};

export default FriendField;
