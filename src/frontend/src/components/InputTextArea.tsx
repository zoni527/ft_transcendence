import { cardBase, inputFieldBase, inputLabelText } from '../styles/styles';

interface InputTextAreaProps {
  id: string;
  name: string;
  label: string;
  rows?: number;
  placeholder?: string;
}

const InputTextArea = ({
  id,
  name,
  label,
  rows = 4,
  placeholder = '...',
}: InputTextAreaProps) => {
  return (
    <div>
      <label htmlFor={id} className={`${inputLabelText}`}>
        {label}
      </label>

      <textarea
        id={id}
        name={name}
        rows={rows}
        placeholder={placeholder}
        className={`${cardBase} ${inputFieldBase} resize-none`}
      />
    </div>
  );
};

export default InputTextArea;
