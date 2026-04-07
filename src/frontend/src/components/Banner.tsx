const Banner = () => {
  return (
    <div className="relative h-80 w-full bg-[url('/assets/banner.jpg')] bg-cover bg-center">
      {/* Background Tint */}
      <div className="absolute inset-0 bg-amber-700/40" />

      {/* Text Box */}
      <div className="relative z-10 flex h-full items-center justify-center text-center text-amber-950">
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
