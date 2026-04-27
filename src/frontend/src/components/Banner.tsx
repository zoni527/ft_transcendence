import LangButton from './LangButton';

const Banner = () => {
  return (
    <div className="relative h-80 w-full bg-[url('/assets/banner.jpg')] bg-cover bg-center">
      {/* Tint */}
      <div className="pointer-events-none absolute inset-0 bg-amber-700/40" />

      {/* Top Bar */}
      <div className="relative z-20 flex justify-end gap-2 p-4">
        <LangButton lang="en" label="EN" />
        <LangButton lang="fi" label="FI" />
        <LangButton lang="cz" label="CZ" />
      </div>

      {/* Center Overlay */}
      <div className="absolute inset-0 z-10 flex items-center justify-center text-center text-amber-950">
        <h1
          style={{
            fontFamily: 'Dancing Script, cursive',
            textShadow: '2px 2px 4px rgba(255, 255, 255, 1)',
          }}
          className="text-8xl font-bold"
        >
          Honey I Cooked It!
        </h1>
      </div>
    </div>
  );
};

export default Banner;
