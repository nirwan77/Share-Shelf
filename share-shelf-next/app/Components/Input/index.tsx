"use client";
import { forwardRef, useState } from "react";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";

interface FormInputProps {
  type?: string;
  placeholder?: string;
  error?: string;
  // RHF props
  name?: string;
  onChange?: (...args: any) => void;
  onBlur?: (...args: any) => void;
  value?: string;
  ref?: React.Ref<HTMLInputElement>;
}

const Input = forwardRef<HTMLInputElement, FormInputProps>(
  ({ type = "text", placeholder, error, ...rest }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";

    return (
      <div className="text-start">
        <div className="relative w-full">
          <input
            type={isPassword && showPassword ? "text" : type}
            placeholder={placeholder}
            ref={ref}
            className={`w-full rounded-xl border bg-white/[0.04] px-4 py-3 pr-11 text-white placeholder:text-zinc-500 outline-none transition-all duration-200 focus:ring-4
            ${
              error
                ? "border-red-500/70 focus:border-red-500 focus:ring-red-500/15"
                : "border-white/10 focus:border-[#ff7a00]/70 focus:bg-white/[0.06] focus:ring-[#ff7a00]/20"
            }
          `}
            {...rest}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-[#ffb36d]"
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
        {error && <p className="mt-1.5 text-sm text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
