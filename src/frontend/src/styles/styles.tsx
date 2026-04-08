// Primary text color: text-amber-900
// Primary text color (emphasized): text-amber-950

// Secondary text color: text-gray-700

export const cardBase = `
  rounded-lg
  bg-white
  shadow-[0px_0px_5px_0px_rgba(0,0,0,0.2)]
`;

export const buttonBase = `
  w-full
  rounded-lg
  bg-amber-600
  px-4
  py-2
  font-semibold
  text-white
  text-center
  shadow-[0px_0px_5px_0px_rgba(0,0,0,0.2)]
  hover:cursor-pointer
  hover:bg-amber-700
`;

export const navLeftBase = `
  text-amber-900
  hover:cursor-pointer
  hover:text-amber-950
  hover:underline
`;

export const inputFieldBase = `
  block
  w-full
  border
  border-gray-300
  px-4
  py-2
  focus:ring-2
  focus:ring-amber-500
  focus:outline-none
`;

export const cardHighlight = `
  transition-all
  duration-300
  hover:-translate-y-2
  hover:cursor-pointer
  hover:shadow-[0px_0px_10px_0px_rgba(0,0,0,0.4)]
`;
