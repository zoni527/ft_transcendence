import InfoIcon from './InfoIcon';
import type { User } from '../types/types';

interface AdminUserFieldProps {
  user: User;
}

const AdminUserField = ({ user }: AdminUserFieldProps) => {
  return (
    <div className="flex items-center justify-between border-b border-gray-300 pb-4">
      <div className="flex-1 text-xl text-gray-700">{user.name}</div>
      <button onClick={() => {}} className="rounded p-2" title={'blee'}>
        <InfoIcon />
      </button>
    </div>
  );
};

export default AdminUserField;
