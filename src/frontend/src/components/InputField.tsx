import { cardBase, inputFieldBase, inputLabelText } from '../styles/styles';

interface InputFieldProps {
  id: string;
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputField = ({
  id,
  name,
  label,
  type = 'text',
  placeholder = '...',
  value,
  onChange,
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
        {...(isControlled ? { value, onChange } : {})}
      />
    </div>
  );
};

export default InputField;
