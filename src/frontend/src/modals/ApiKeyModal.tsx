import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import FormHeader from '../components/FormHeader';
import { cardBase } from '../styles/styles';

interface ApiKeyModalProps {
  apiKey: string;
  onClose: () => void;
}

const ApiKeyModal = ({ apiKey, onClose }: ApiKeyModalProps) => {
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation();

  // Handle copy
  const handleCopy = async () => {
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);

    setTimeout(() => setCopied(false), 1500);
  };

  // Disable background scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal content */}
      <div className={`${cardBase} relative z-10 w-full max-w-xl p-8`}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:cursor-pointer hover:text-black"
        >
          ✕
        </button>

        <FormHeader title={t('dashboard.dev')} />
        <div className="flex flex-col gap-4">
          {/* Warning */}
          <div className="w-full rounded-lg p-4 text-lg text-red-500">
            {t('dashboard.devWarning')}
          </div>

          {/* API Key */}
          <div className="w-full rounded-lg bg-gray-100 p-4 font-mono text-sm break-all text-gray-800">
            {apiKey}
          </div>

          {/* Copy button */}
          <button
            onClick={() => void handleCopy()}
            className="text-md mt-12 justify-center rounded-lg border-2 border-gray-500 bg-white px-2 py-1 text-gray-500 hover:cursor-pointer hover:border-orange-800 hover:text-gray-700"
          >
            {copied
              ? (t('common.copied') ?? 'Copied!')
              : (t('common.copy') ?? 'Copy to clipboard')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
