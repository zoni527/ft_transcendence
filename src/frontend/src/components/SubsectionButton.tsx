type SubsectionButtonProps<T extends string> = {
  label: string;
  subsection: T;
  activeSubsection: T;
  setActiveSubsection: React.Dispatch<React.SetStateAction<T>>;
};

const SubsectionButton = <T extends string>({
  label,
  subsection,
  activeSubsection,
  setActiveSubsection,
}: SubsectionButtonProps<T>) => {
  const isActive = activeSubsection === subsection;

  return (
    <button
      onClick={() => setActiveSubsection(subsection)}
      className={`text-lg font-bold transition-colors hover:cursor-pointer ${
        isActive ? 'text-[#C04D31]' : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {label}
    </button>
  );
};

export default SubsectionButton;
