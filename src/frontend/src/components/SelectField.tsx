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
}

const SelectField = ({
  id,
  name,
  label,
  options,
  placeholder = '...',
}: SelectFieldProps) => {
  return (
    <div>
      <label htmlFor={id} className={`${inputLabelText}`}>
        {label}
      </label>

      <select
        id={id}
        name={name}
        defaultValue=""
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
