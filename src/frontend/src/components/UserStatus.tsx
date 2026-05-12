type UserStatusProps = {
  isOnline: boolean;
  className?: string;
};

const UserStatus = ({ isOnline, className = '' }: UserStatusProps) => {
  return (
    <div
      className={`h-4 w-4 rounded-full border-2 border-slate-950 ${
        isOnline ? 'bg-green-500' : 'bg-red-500'
      } ${className}`}
      title={isOnline ? 'Online' : 'Offline'}
    />
  );
};

export default UserStatus;
