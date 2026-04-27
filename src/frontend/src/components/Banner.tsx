import LangButton from './LangButton';

const Banner = () => {
  return (
    <div className="relative h-100 w-full bg-[url('/assets/banner.jpg')] bg-cover bg-center">
      {/* Tint */}
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/50 via-black/30 to-black/70" />

      {/* Top Bar */}
      <div className="relative z-20 flex justify-end gap-2 p-4">
        <LangButton lang="en" label="EN" />
        <LangButton lang="fi" label="FI" />
        <LangButton lang="cs" label="CZ" />
      </div>

      {/* Center Overlay */}
      <div className="absolute inset-0 z-10 flex items-center justify-center text-center text-white">
        <h1
          style={{
            fontFamily: 'Dancing Script, cursive',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 1)',
          }}
          className="text-8xl font-bold"
        >
          Recipes worth rising for!
        </h1>
      </div>
    </div>
  );
};

export default Banner;
