import { Link } from "react-router-dom";

const Header = () => {
  return (
    <nav className="bg-opacity-90 bg-[#6f4e37] shadow-md">
      <div className="container mx-auto flex items-center justify-between p-4">
        {/* Toggle Button for Mobile */}
        <button
          className="lg:hidden focus:outline-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarTogglerDemo01"
          aria-controls="navbarTogglerDemo01"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="block w-8 h-1 bg-white mb-1"></span>
          <span className="block w-8 h-1 bg-white mb-1"></span>
          <span className="block w-8 h-1 bg-white"></span>
        </button>

        {/* Header Title */}
        <div className="flex-grow text-center">
          <Link
            to="/"
            className="text-white text-3xl font-bold tracking-wide uppercase hover:opacity-80"
          >
            MoneyTrack
          </Link>
        </div>

        {/* Empty Spacer for Centering */}
        <div className="hidden lg:block" />
      </div>
    </nav>
  );
};

export default Header;
