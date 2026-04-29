import { useTranslation } from 'react-i18next';
import FormHeader from '../components/FormHeader';
import { cardBase } from '../styles/styles';

const TermsService = () => {
  const { t } = useTranslation();

  return (
    <div className={`${cardBase} mt-8 p-8 wrap-anywhere`}>
      {/* Header */}
      <FormHeader title={t('termsService.header')} />
    </div>
  );
};

export default TermsService;
