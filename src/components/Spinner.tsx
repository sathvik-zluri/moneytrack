const Spinner = () => {
  return (
    <div
      className="relative flex justify-center items-center"
      data-testid="loading-toggle"
    >
      {/* Outer spinner */}
      <div className="animate-spin w-16 h-16 border-4 border-t-blue-500 border-b-green-500 border-l-transparent border-r-transparent rounded-full"></div>

      {/* Center content */}
      <div className="absolute flex flex-col items-center justify-center">
        {/* Tracking icon */}
        <svg
          xmlns="https://img.icons8.com/stickers/50/order-on-the-way.png"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="w-6 h-6 text-gray-700"
        >
          <path
            d="M2 12l2-2m0 0l4-4m-4 4h14a2 2 0 012 2m-2 2l-2 2m2-2l2-2"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {/* Currency symbol */}
        <span className="text-xl font-bold text-green-700">₹</span>
      </div>
    </div>
  );
};

export default Spinner;
