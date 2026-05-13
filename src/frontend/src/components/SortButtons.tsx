type SortOption<T extends string> = {
  label: string;
  value: T;
};

type SortButtonsProps<T extends string> = {
  options: SortOption<T>[];
  sortBy: T;
  setSortBy: React.Dispatch<React.SetStateAction<T>>;
};

const SortButtons = <T extends string>({
  options,
  sortBy,
  setSortBy,
}: SortButtonsProps<T>) => {
  return (
    <div className="mt-6 flex flex-col items-center pb-4 md:flex-row md:justify-between">
      <div className="flex min-w-0 flex-col items-center gap-2 md:flex-row md:items-center md:gap-6">
        {options.map((opt) => {
          const isActive = sortBy === opt.value;

          return (
            <div key={opt.value} className="w-full md:w-60">
              <button
                onClick={() => setSortBy(opt.value)}
                className={`w-full truncate text-center text-lg font-bold transition-colors hover:cursor-pointer md:text-left ${
                  isActive
                    ? 'text-[#C04D31]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {opt.label}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-3 md:mt-0" />
    </div>
  );
};

export default SortButtons;
