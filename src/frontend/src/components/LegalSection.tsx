interface LegalSectionProps {
  title: string;
  text: string;
}

const LegalSection = ({ title, text }: LegalSectionProps) => {
  return (
    <section className="border-t border-stone-300 pt-6 first:border-t-0 first:pt-0">
      <h2
        style={{
          fontFamily: 'Newsreader',
        }}
        className="text-text-primary text-lg font-semibold md:text-2xl"
      >
        {title}
      </h2>

      <div className="text-text-secondary mt-3 space-y-3 text-sm leading-relaxed md:text-lg">
        {text.split('\n').map((line, i) => (
          <p
            style={{
              fontFamily: 'Newsreader',
            }}
            key={i}
          >
            {line}
          </p>
        ))}
      </div>
    </section>
  );
};

export default LegalSection;
