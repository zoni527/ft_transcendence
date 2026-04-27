import { useState } from 'react';
import LangButton from './LangButton';
import { useTranslation } from 'react-i18next';

const LangDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { i18n } = useTranslation(); //
  const [selectedLang, setSelectedLang] = useState(i18n.language);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Function to change the language and update the selectedLang state
  const handleLangChange = (lang: string) => {
    void i18n.changeLanguage(lang);
    setSelectedLang(lang);
    setIsOpen(false);
  };

  return (
    <div className="relative z-20">
      <button
        onClick={toggleDropdown}
        className={`text-md flex items-center gap-2 rounded-md px-4 py-2 font-bold text-orange-700`}
      >
        <span>{selectedLang.toUpperCase()}</span>{' '}
        {/* Show the selected language */}
        <svg
          className="h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-16 border bg-white shadow-lg">
          <div className="flex flex-col">
            <LangButton label="EN" onClick={() => handleLangChange('en')} />
            <LangButton label="FI" onClick={() => handleLangChange('fi')} />
            <LangButton label="CS" onClick={() => handleLangChange('cs')} />
          </div>
        </div>
      )}
    </div>
  );
};

export default LangDropdown;
