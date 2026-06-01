import { cardBase, inputFieldBase, inputLabelText } from '../styles/styles';

interface InputFieldProps {
  id: string;
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
}

const InputField = ({
  id,
  name,
  label,
  type = 'text',
  placeholder = '...',
  value,
  onChange,
  autoComplete,
}: InputFieldProps) => {
  const isControlled = value !== undefined;

  return (
    <div>
      <label htmlFor={id} className={inputLabelText}>
        {label}
      </label>

      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        className={`${cardBase} ${inputFieldBase}`}
        autoComplete={autoComplete}
        {...(isControlled ? { value, onChange } : {})}
      />
    </div>
  );
};

export default InputField;
