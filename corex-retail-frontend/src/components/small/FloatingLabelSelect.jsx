import React from 'react';

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
    <div className="relative mb-4">
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`peer w-full pl-4 pr-10 py-2 border bg-gray-100 rounded-2xl focus:outline-none focus:border-blue-500 transition-colors appearance-none bg-white ${
          error ? 'border-red-500' : ''
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
      {/* Custom arrow icon */}
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default FloatingLabelSelect;