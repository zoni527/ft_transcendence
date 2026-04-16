import { cardBase, inputFieldBase, inputLabelText } from '../styles/styles';

interface InputFieldProps {
  id: string;
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
}

const InputField = ({
  id,
  name,
  label,
  type = 'text',
  placeholder = '...',
}: InputFieldProps) => {
  return (
    <div>
      <label htmlFor={id} className={`${inputLabelText}`}>
        {label}
      </label>

      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        className={`${cardBase} ${inputFieldBase}`}
      />
    </div>
  );
};

export default InputField;
