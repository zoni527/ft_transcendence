import { useTranslation } from 'react-i18next';
import FormHeader from '../components/FormHeader';
import { cardBase } from '../styles/styles';

const TermsService = () => {
  const { t } = useTranslation();

  const accountItems = [
    t('termsService.account_items_0'),
    t('termsService.account_items_1'),
    t('termsService.account_items_2'),
    t('termsService.account_items_3'),
  ];

  const contentItems = [
    t('termsService.content_items_0'),
    t('termsService.content_items_1'),
    t('termsService.content_items_2'),
    t('termsService.content_items_3'),
  ];

  const acceptableItems = [
    t('termsService.acceptable_items_0'),
    t('termsService.acceptable_items_1'),
    t('termsService.acceptable_items_2'),
    t('termsService.acceptable_items_3'),
    t('termsService.acceptable_items_4'),
    t('termsService.acceptable_items_5'),
  ];

  return (
    <div className={`${cardBase} mt-8 p-8 wrap-anywhere`}>
      {/* Header */}
      <FormHeader title={t('termsService.header')} />

      <div className="bg-surface-bright p-stack-lg legal-content rounded-lg md:p-12">
        <p>{t('termsService.terms_intro')}</p>

        <h2>{t('termsService.acceptance_title')}</h2>
        <p>{t('termsService.acceptance_text')}</p>

        <h2>{t('termsService.eligibility_title')}</h2>
        <p>{t('termsService.eligibility_text')}</p>

        <h2>{t('termsService.account_title')}</h2>
        <ul>
          {accountItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

        <h2>{t('termsService.content_title')}</h2>
        <p>{t('termsService.content_text')}</p>
        <ul>
          {contentItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

        <h2>{t('termsService.acceptable_title')}</h2>
        <ul>
          {acceptableItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

        <h2>{t('termsService.ip_title')}</h2>
        <p>{t('termsService.ip_text')}</p>

        <h2>{t('termsService.termination_title')}</h2>
        <p>{t('termsService.termination_text')}</p>

        <h2>{t('termsService.disclaimers_title')}</h2>
        <p>{t('termsService.disclaimers_text')}</p>

        <h2>{t('termsService.liability_title')}</h2>
        <p>{t('termsService.liability_text')}</p>

        <h2>{t('termsService.changes_title')}</h2>
        <p>{t('termsService.changes_text')}</p>

        <h2>{t('termsService.law_title')}</h2>
        <p>{t('termsService.law_text')}</p>

        <h2>{t('termsService.contact_title')}</h2>
        <p>{t('termsService.contact_text')}</p>
      </div>
    </div>
  );
};

export default TermsService;
