type Option = {
  label: string;
  value: string;
};

type FilterGroupProps = {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  onResetPage?: () => void;
};

const FilterGroup = ({
  label,
  value,
  options,
  onChange,
  onResetPage,
}: FilterGroupProps) => {
  const handleClick = (val: string) => {
    onChange(val);
    onResetPage?.();
  };

  return (
    <div className="mt-12">
      <label className="mb-2 block font-semibold">{label}</label>

      <div className="flex flex-col gap-1">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleClick(opt.value)}
            className={`text-md w-full rounded-lg px-4 py-2 text-left transition hover:cursor-pointer ${
              value === opt.value
                ? 'bg-orange-800/10 font-bold text-[#C04D31]'
                : 'text-gray-700'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterGroup;
