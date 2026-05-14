import { useState } from 'react';
import SubmitButton from './SubmitButton';
import UserStatus from './UserStatus';
import type { User } from '../types/types';

interface FriendFieldProps {
  user: User;
  subsection: string;
  onDelete: (id: string) => void;
  onUpdate: (user: User) => void;
  onClick?: () => void;
}

const FriendField = ({
  user,
  subsection,
  onDelete,
  onUpdate,
  onClick,
}: FriendFieldProps) => {
  const [loading, setLoading] = useState(false);

  return (
    <div
      className="flex items-center justify-between border-b border-gray-300 pt-4 pb-4 pl-2 hover:cursor-pointer hover:bg-gray-100"
      onClick={onClick}
    >
      {/* Left side */}
      <div className="flex min-w-0 flex-col gap-2 md:flex-row md:items-center md:gap-6">
        {/* Name */}
        <div className="w-38 shrink-0 truncate text-xl font-semibold text-gray-700 sm:w-60">
          {user.name}
        </div>

        {/* Username */}
        <div className="w-38 shrink-0 truncate text-xl font-semibold text-gray-700 sm:w-60">
          {user.display_name}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col items-center gap-2 p-2 md:flex-row md:gap-3">
        {subsection === 'accepted' && <UserStatus isOnline={user.is_online} />}
        <SubmitButton
          className="w-full rounded-xl border-2 border-slate-600 hover:border-slate-950 md:w-auto"
          isLoading={loading}
          defaultText="Delete"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(user.id);
          }}
          type="button"
        />
      </div>
    </div>
  );
};

export default FriendField;
