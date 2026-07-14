import { motion } from "motion/react";

const buttonVariants = {
  primary:
    "bg-[#4F46E5] text-white shadow-sm shadow-indigo-500/20 hover:bg-[#4338CA] hover:shadow-md hover:shadow-indigo-500/20",

  gradient:
    "bg-gradient-to-r from-[#4F46E5] to-[#06B6D4] text-white shadow-sm shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/25",

  secondary:
    "bg-[#111827] text-white shadow-sm hover:bg-[#1F2937]",

  outline:
    "border border-[#E5E7EB] bg-white text-[#374151] shadow-sm hover:border-indigo-200 hover:bg-indigo-50 hover:text-[#4F46E5]",

  ghost:
    "bg-transparent text-[#64748B] hover:bg-slate-100 hover:text-[#111827]",

  danger:
    "bg-red-50 text-[#EF4444] hover:bg-red-100",

  success:
    "bg-green-50 text-[#22C55E] hover:bg-green-100",

  warning:
    "bg-amber-50 text-[#F59E0B] hover:bg-amber-100",
};

const buttonSizes = {
  sm: "h-9 rounded-xl px-3 text-xs",
  md: "h-11 rounded-2xl px-4 text-sm",
  lg: "h-13 rounded-2xl px-5 text-sm",
  icon: "h-11 w-11 rounded-2xl p-0",
};

function Button({
  children,
  className = "",
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  type = "button",
  onClick,
  ...props
}) {
  const variantClass =
    buttonVariants[variant] ||
    buttonVariants.primary;

  const sizeClass =
    buttonSizes[size] ||
    buttonSizes.md;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={
        disabled || loading
          ? undefined
          : {
              y: -2,
            }
      }
      whileTap={
        disabled || loading
          ? undefined
          : {
              scale: 0.97,
            }
      }
      className={`
        inline-flex
        items-center
        justify-center
        gap-2
        font-medium
        tracking-[0.2px]
        transition-all
        focus:outline-none
        focus:ring-4
        focus:ring-indigo-100
        disabled:cursor-not-allowed
        disabled:opacity-50
        ${variantClass}
        ${sizeClass}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        LeftIcon && <LeftIcon size={17} />
      )}

      {children}

      {!loading && RightIcon && (
        <RightIcon size={17} />
      )}
    </motion.button>
  );
}

export default Button;