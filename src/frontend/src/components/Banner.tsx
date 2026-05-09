import { useTranslation } from 'react-i18next';

const imgUrl: string =
  'https://res.cloudinary.com/dhuk7trpf/image/upload/v1777481532/ypcjju1if4bcgsumx0vu.webp';

const Banner = () => {
  const { t } = useTranslation();

  return (
    <div
      className="relative h-32 w-full bg-cover bg-center sm:h-64 md:h-80 lg:h-96"
      style={{ backgroundImage: `url(${imgUrl})` }}
    >
      {/* Tint */}
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-orange-800/10 via-orange-800/20 to-orange-800/30" />

      {/* Center Overlay */}
      <div className="absolute inset-0 z-10 flex items-center justify-center px-4 text-center text-white">
        <h1
          style={{
            fontFamily: 'Dancing Script, cursive',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 1)',
          }}
          className="max-w-full text-4xl leading-tight font-bold wrap-break-word sm:text-5xl md:text-6xl lg:text-8xl"
        >
          {t('common.bannerTitle')}
        </h1>
      </div>
    </div>
  );
};

export default Banner;
