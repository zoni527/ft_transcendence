const InfoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 text-gray-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    {/* Circle */}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 22a10 10 0 100-20 10 10 0 000 20z"
    />
    {/* "i" line */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4" />
    {/* Dot */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8h.01" />
  </svg>
);

export default InfoIcon;
