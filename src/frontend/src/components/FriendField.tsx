import SubmitButton from './SubmitButton';
import UserStatus from './UserStatus';
import type { FriendshipListItem, AcceptedFriend } from '../types/types';

export interface FriendAction {
  label: string;
  onClick: (id: string) => void | Promise<void>;
  variant?: 'primary' | 'danger';
}

interface FriendFieldProps {
  user: FriendshipListItem | AcceptedFriend;
  subsection: string;
  actions: FriendAction[];
  isLoading: boolean;
  onClick?: () => void;
}

const FriendField = ({
  user,
  subsection,
  actions,
  onClick,
  isLoading,
}: FriendFieldProps) => {
  return (
    <div
      className="flex items-center justify-between border-b border-gray-300 pt-4 pb-4 pl-2 hover:cursor-pointer hover:bg-gray-100"
      onClick={onClick}
    >
      {/* Left side */}
      <div className="flex min-w-0 flex-col gap-2 md:flex-row md:items-center md:gap-6">
        <div className="w-38 shrink-0 truncate text-xl font-semibold text-gray-700 sm:w-60">
          {user.name}
        </div>

        <div className="w-38 shrink-0 truncate text-xl font-semibold text-gray-700 sm:w-60">
          {user.display_name}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col items-center gap-2 p-2 md:flex-row md:gap-3">
        {subsection === 'accepted' && 'is_online' in user && (
          <UserStatus isOnline={user.is_online} />
        )}

        {actions.map((action) => (
          <SubmitButton
            key={action.label}
            className="w-full rounded-xl border-2 border-slate-600 hover:border-slate-950 md:w-auto"
            isLoading={isLoading}
            defaultText={action.label}
            onClick={(e) => {
              e.stopPropagation();
              void action.onClick(user.id);
            }}
            type="button"
          />
        ))}
      </div>
    </div>
  );
};

export default FriendField;
