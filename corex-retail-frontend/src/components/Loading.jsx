import React from "react";
import logo from "../../public/Website_Logo.png";

const LoadingSpinner = () => {
  return (
    // <div className="flex items-center justify-center h-full w-full">
    //   <img
    //     src={logo}
    //     alt="Loading..."
    //     className="h-16 w-16 animate-spin-slow"
    //   />
    // </div>

    <div className="flex items-center justify-center w-full h-full p-10">
      <div className="relative w-16 h-16">
        <div className="absolute w-full h-full border-4 border-t-transparent border-blue-500 rounded-full animate-spin" />
        <div className="absolute inset-2 border-4 border-b-transparent border-blue-300 rounded-full animate-spin-slower" />
        <div className="absolute inset-4 border-2 border-l-transparent border-blue-200 rounded-full animate-spin-reverse" />
      </div>
    </div>
  );
};

export default LoadingSpinner;
