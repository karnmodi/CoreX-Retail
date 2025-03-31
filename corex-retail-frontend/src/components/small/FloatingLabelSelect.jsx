import React from "react";
const FloatingLabelSelect = ({
  id,
  name,
  value,
  onChange,
  label,
  options,
  className = "",
  required = false,
  error = "",
}) => {
  return (
    <div className="relative mb-6">
      {" "}
      {/* Increased bottom margin to fit error message */}
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`peer w-full pl-4 pr-10 py-2 border bg-gray-100 rounded-2xl focus:outline-none focus:border-blue-500 transition-colors appearance-none bg-white ${
          error ? "border-red-500" : ""
        } ${className}`}
      >
        <option value="" disabled hidden></option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <label
        htmlFor={id}
        className="absolute left-1 -top-2 bg-white rounded-2xl px-1 text-gray-600 text-sm transition-all
                 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
                 peer-placeholder-shown:top-2 peer-focus:-top-2 peer-focus:text-gray-600
                 peer-focus:text-sm z-10"
      >
        {label}
      </label>
      {error && (
        <div className="flex items-center mt-1 bg-red-100 p-2 rounded">
          <svg
            className="w-4 h-4 text-red-500 mr-1"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-sm text-red-700 font-medium">{error}</p>
        </div>
      )}
    </div>
  );
};
export default FloatingLabelSelect;
