import StatusBox from '../components/StatusBox';
import { useTranslation } from 'react-i18next';

const NotFound = () => {
  const { t } = useTranslation();

  return (
    <StatusBox message={t('error.pageNotFound')} className="text-red-600" />
  );
};

export default NotFound;
