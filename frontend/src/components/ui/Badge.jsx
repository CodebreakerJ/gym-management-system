function Badge({
  children,
  variant = "neutral",
  dot = false,
  className = "",
}) {
  const variants = {
    neutral:
      "border border-slate-200 bg-slate-50 text-slate-600",

    primary:
      "border border-indigo-100 bg-indigo-50 text-[#4F46E5]",

    success:
      "border border-green-100 bg-green-50 text-[#22C55E]",

    warning:
      "border border-amber-100 bg-amber-50 text-[#F59E0B]",

    danger:
      "border border-red-100 bg-red-50 text-[#EF4444]",

    info:
      "border border-cyan-100 bg-cyan-50 text-[#06B6D4]",
  };

  const dots = {
    neutral: "bg-slate-400",

    primary: "bg-[#4F46E5]",

    success: "bg-[#22C55E]",

    warning: "bg-[#F59E0B]",

    danger: "bg-[#EF4444]",

    info: "bg-[#06B6D4]",
  };

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-2
        rounded-xl
        px-3
        py-1.5
        text-xs
        font-semibold
        tracking-wide
        transition-all
        duration-200
        ${variants[variant] || variants.neutral}
        ${className}
      `}
    >
      {dot && (
        <span
          className={`
            h-2
            w-2
            rounded-full
            ${dots[variant] || dots.neutral}
          `}
        />
      )}

      {children}
    </span>
  );
}

export default Badge;