import { useTranslation } from 'react-i18next';

const imgUrl: string =
  'https://media.hellofresh.com/q_100,w_3840,f_auto,c_limit,fl_auto/hellofresh_website/recipe-developers/assets/recipe_dev_hero_redesign_header.jpg';

const Banner = () => {
  const { t } = useTranslation();

  return (
    <div
      className="relative h-96 w-full bg-cover bg-center"
      style={{ backgroundImage: `url(${imgUrl})` }}
    >
      {/* Tint */}
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/10 via-black/30 to-black/50" />

      {/* Center Overlay */}
      <div className="absolute inset-0 z-10 flex items-center justify-center text-center text-white">
        <h1
          style={{
            fontFamily: 'Dancing Script, cursive',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 1)',
          }}
          className="text-8xl font-bold"
        >
          {t('common.bannerTitle')}
        </h1>
      </div>
    </div>
  );
};

export default Banner;
