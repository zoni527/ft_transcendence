import NavButton from './NavButton';
import { cardBase, buttonBase, navLeftBase } from '../styles/styles';

const Navbar = () => {
  return (
    <nav
      className={`${cardBase} mt-2 flex items-center justify-between px-6 py-4`}
    >
      {/* Left Side */}
      <div className="flex gap-6 text-xl font-semibold">
        <NavButton path="/" className={`${navLeftBase}`}>
          Recipes
        </NavButton>
        <NavButton path="/dashboard" className={`${navLeftBase}`}>
          Dashboard
        </NavButton>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        <NavButton path="/signup" className={`${buttonBase}`}>
          Sign up
        </NavButton>
        <NavButton path="/login" className={`${buttonBase}`}>
          Log in
        </NavButton>
      </div>
    </nav>
  );
};

export default Navbar;
