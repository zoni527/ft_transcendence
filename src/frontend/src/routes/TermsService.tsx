import { useTranslation } from 'react-i18next';
import FormHeader from '../components/FormHeader';
import LegalSection from '../components/LegalSection';
import { cardBase } from '../styles/styles';

const sections = Array.from({ length: 11 }, (_, i) => i + 1);

const TermsService = () => {
  const { t } = useTranslation();

  return (
    <div className={`${cardBase} mt-8 p-6 md:p-8`}>
      {/* Header */}
      <FormHeader title={t('termsService.header')} />

      <div className="bg-surface-bright mt-10 rounded-xl border border-stone-300 p-6 md:p-10">
        {/* Intro */}
        <div className="flex justify-center py-6 md:py-10">
          <h1
            style={{ fontFamily: 'Newsreader' }}
            className="text-text-secondary max-w-2xl text-center text-lg leading-relaxed md:text-2xl"
          >
            {t('termsService.terms_intro')}
          </h1>
        </div>

        {/* Sections */}
        <div className="mt-10 space-y-12">
          {sections.map((num) => (
            <LegalSection
              key={num}
              title={t(`termsService.section${num}_title`)}
              text={t(`termsService.section${num}_text`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TermsService;
