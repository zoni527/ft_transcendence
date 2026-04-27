import { useTranslation } from 'react-i18next';
import { langButtonBase } from '../styles/styles';

type Props = {
  lang: string;
  label: string;
};

const LangButton = ({ lang, label }: Props) => {
  const { i18n } = useTranslation();

  const changeLang = () => {
    void i18n.changeLanguage(lang);
  };

  return (
    <button onClick={changeLang} className={`${langButtonBase}`}>
      {label}
    </button>
  );
};

export default LangButton;
