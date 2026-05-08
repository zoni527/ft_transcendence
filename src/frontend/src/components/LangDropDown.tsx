import { useState, useEffect, useRef } from 'react';
import LangButton from './LangButton';
import { useTranslation } from 'react-i18next';
import { navLeftBase } from '../styles/styles';

const LangDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { i18n } = useTranslation();
  const selectedLang = i18n.resolvedLanguage ?? i18n.language;

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Function to change the language and update the selectedLang state
  const handleLangChange = (lang: string) => {
    void i18n.changeLanguage(lang);
    setIsOpen(false);
  };

  // Close the dropdown if the click is outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);

    // Clean up the event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative z-20" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className={`${navLeftBase} text-md flex items-center gap-2 rounded-md px-4 py-2 font-bold`}
      >
        <span>{selectedLang.toUpperCase()}</span>{' '}
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
        <div className="absolute left-1/2 mt-2 w-16 -translate-x-1/2 border bg-white shadow-lg">
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
