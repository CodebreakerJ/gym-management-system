import { motion } from "motion/react";

function Card({
  children,
  className = "",
  hover = false,
  padding = "default",
}) {
  const paddingMap = {
    none: "",
    small: "p-4",
    default: "p-6",
    large: "p-8",
  };

  return (
    <motion.div
      whileHover={
        hover
          ? {
              y: -4,
            }
          : {}
      }
      transition={{
        duration: 0.2,
      }}
      className={`
        rounded-[20px]
        border
        border-[#E5E7EB]
        bg-white
        shadow-[0_12px_35px_rgba(15,23,42,0.05)]
        ${paddingMap[padding]}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}

function CardHeader({
  title,
  description,
  action,
}) {
  return (
    <div className="mb-6 flex items-start justify-between">
      <div>
        <h2 className="text-xl font-bold text-[#111827]">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm text-[#64748B]">
            {description}
          </p>
        )}
      </div>

      {action}
    </div>
  );
}

function CardContent({
  children,
}) {
  return <div>{children}</div>;
}

Card.Header = CardHeader;
Card.Content = CardContent;

export default Card;