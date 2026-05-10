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
          {/* className={`absolute top-8 right-8 h-4 w-4 rounded-full border-2 border-slate-950 ${
              userData.is_online ? 'bg-green-500' : 'bg-red-500'
            }`}
            title={userData.is_online ? 'Online' : 'Offline'} */}
          <div
            className={`h-4 w-4 rounded-full border-2 border-slate-950 bg-green-500`}
            title={'Online'}
          />
        </div>
      </div>
    </>
  );
};

export default FriendField;
