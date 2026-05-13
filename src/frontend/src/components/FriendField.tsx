import { useState } from 'react';
import SubmitButton from './SubmitButton';
import type { User } from '../types/types';

interface FriendFieldProps {
  user: User;
  onDelete: (id: string) => void;
  onUpdate: (user: User) => void;
}

const FriendField = ({ user, onDelete, onUpdate }: FriendFieldProps) => {
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex items-center justify-between border-b border-gray-300 pb-4">
      {/* Left side */}
      <div className="flex min-w-0 flex-col gap-2 md:flex-row md:items-center md:gap-6">
        <div className="w-60 shrink-0 truncate text-xl font-semibold text-gray-700">
          {user.name}
        </div>

        <div className="w-60 shrink-0 truncate text-xl font-semibold text-gray-700">
          {user.display_name}
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 p-2 md:flex-row md:gap-3">
        <div className="flex flex-col gap-2 p-2 md:flex-row md:gap-3">
          <SubmitButton
            className="w-full rounded-xl border-2 border-slate-600 hover:border-slate-950 md:w-auto"
            isLoading={loading}
            defaultText="Delete"
            onClick={() => onDelete(user.id)}
            type="button"
          />
        </div>
      </div>
    </div>
  );
};

export default FriendField;
