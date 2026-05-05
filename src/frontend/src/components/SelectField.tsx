import { cardBase, inputFieldBase, inputLabelText } from '../styles/styles';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  id: string;
  name: string;
  label: string;
  options: SelectOption[];
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const SelectField = ({
  id,
  name,
  label,
  options,
  placeholder = '...',
  value,
  onChange,
}: SelectFieldProps) => {
  return (
    <div>
      <label htmlFor={id} className={inputLabelText}>
        {label}
      </label>

      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className={`${cardBase} ${inputFieldBase}`}
      >
        <option value="" disabled>
          {placeholder}
        </option>

        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectField;
