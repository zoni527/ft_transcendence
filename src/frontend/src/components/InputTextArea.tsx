import { cardBase, inputFieldBase, inputLabelText } from '../styles/styles';

interface InputTextAreaProps {
  id: string;
  name: string;
  label: string;
  rows?: number;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const InputTextArea = ({
  id,
  name,
  label,
  rows = 4,
  placeholder = '...',
  value,
  onChange,
}: InputTextAreaProps) => {
  const isControlled = value !== undefined;

  return (
    <div>
      <label htmlFor={id} className={inputLabelText}>
        {label}
      </label>

      <textarea
        id={id}
        name={name}
        rows={rows}
        placeholder={placeholder}
        className={`${cardBase} ${inputFieldBase} resize-none`}
        {...(isControlled ? { value, onChange } : {})}
      />
    </div>
  );
};

export default InputTextArea;
