"use client";

import { useState } from "react";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";

interface FormInputProps {
  type?: string;
  name?: string;
  value?: string;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

export default function Input({
  type = "text",
  name,
  value,
  placeholder,
  onChange,
  required,
}: FormInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="relative">
      <input
        type={isPassword && showPassword ? "text" : type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full border border-gray-400 rounded-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black pr-10"
      />

      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <MdVisibilityOff size={20} />
          ) : (
            <MdVisibility size={20} />
          )}
        </button>
      )}
    </div>
  );
}
