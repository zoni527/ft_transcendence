import { langButtonBase } from '../styles/styles';

type Props = {
  label: string;
  onClick: () => void;
};

const LangButton = ({ label, onClick }: Props) => {
  return (
    <button onClick={onClick} className={langButtonBase}>
      {label}
    </button>
  );
};

export default LangButton;
