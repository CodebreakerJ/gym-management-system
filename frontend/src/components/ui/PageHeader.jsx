import { motion } from "motion/react";

function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className = "",
}) {
  return (
    <motion.header
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.35,
      }}
      className={`mb-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end ${className}`}
    >
      <div>
        {eyebrow && (
          <p className="text-sm font-medium text-[#4F46E5]">
            {eyebrow}
          </p>
        )}

        <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-[#111827] sm:text-4xl">
          {title}
        </h1>

        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#64748B]">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap gap-3">
          {actions}
        </div>
      )}
    </motion.header>
  );
}

export default PageHeader;