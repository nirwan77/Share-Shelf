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
            className={`w-full border rounded-sm px-3 py-2 focus:outline-none focus:ring-1 pr-10
            ${
              error
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-400 focus:ring-black"
            }
          `}
            {...rest}
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
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
