import { cardBase, inputFieldBase } from '../styles/styles';

interface InputFieldProps {
  id: string;
  label: string;
  type?: string;
  name: string;
  placeholder: string;
}

const InputField = ({
  id,
  label,
  type = 'text',
  name,
  placeholder = '',
}: InputFieldProps) => {
  return (
    <div>
      <label htmlFor={id} className="text-md block font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        type={type}
        name={name}
        placeholder={placeholder}
        className={`${cardBase} ${inputFieldBase}`}
      />
    </div>
  );
};

export default InputField;
