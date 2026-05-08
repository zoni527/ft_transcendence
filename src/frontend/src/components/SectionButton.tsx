type SectionButtonProps<T extends string> = {
  label: string;
  section: T;
  activeSection: T;
  setActiveSection: React.Dispatch<React.SetStateAction<T>>;
};

const SectionButton = <T extends string>({
  label,
  section,
  activeSection,
  setActiveSection,
}: SectionButtonProps<T>) => {
  const isActive = activeSection === section;

  return (
    <button
      onClick={() => setActiveSection(section)}
      className={`text-2xl font-bold transition-colors hover:cursor-pointer ${
        isActive ? 'text-[#C04D31]' : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {label}
    </button>
  );
};

export default SectionButton;
