import {
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { motion } from "motion/react";

const accentStyles = {
  indigo: {
    icon: "bg-indigo-50 text-[#4F46E5] border-indigo-100",
    glow: "from-indigo-500/10 to-transparent",
  },

  cyan: {
    icon: "bg-cyan-50 text-[#06B6D4] border-cyan-100",
    glow: "from-cyan-500/10 to-transparent",
  },

  green: {
    icon: "bg-green-50 text-[#22C55E] border-green-100",
    glow: "from-green-500/10 to-transparent",
  },

  orange: {
    icon: "bg-orange-50 text-[#F59E0B] border-orange-100",
    glow: "from-orange-500/10 to-transparent",
  },

  red: {
    icon: "bg-red-50 text-[#EF4444] border-red-100",
    glow: "from-red-500/10 to-transparent",
  },
};

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  accent = "indigo",
  delay = 0,
  growth,
  trend = "up",
}) {
  const colors =
    accentStyles[accent] ||
    accentStyles.indigo;

  const TrendIcon =
    trend === "down"
      ? TrendingDown
      : TrendingUp;

  return (
    <motion.article
      initial={{
        opacity: 0,
        y: 18,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay,
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{
        y: -4,
      }}
      className="group relative overflow-hidden rounded-[20px] border border-[#E5E7EB] bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.05)] transition-shadow hover:shadow-[0_20px_45px_rgba(15,23,42,0.09)]"
    >
      <div
        className={`pointer-events-none absolute right-0 top-0 h-28 w-28 bg-gradient-to-bl ${colors.glow}`}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#64748B]">
            {title}
          </p>

          <h3 className="mt-3 font-['Manrope'] text-3xl font-bold tracking-tight text-[#111827]">
            {value}
          </h3>

          <p className="mt-2 text-xs leading-5 text-[#94A3B8]">
            {description}
          </p>
        </div>

        <motion.div
          whileHover={{
            rotate: 5,
            scale: 1.04,
          }}
          className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl border ${colors.icon}`}
        >
          <Icon size={21} />
        </motion.div>
      </div>

      <div className="relative mt-6 flex items-center justify-between">
        {growth !== undefined ? (
          <div
            className={`flex items-center gap-1.5 text-xs font-semibold ${
              trend === "down"
                ? "text-[#EF4444]"
                : "text-[#22C55E]"
            }`}
          >
            <TrendIcon size={14} />

            {growth}%
          </div>
        ) : (
          <span className="text-xs text-[#94A3B8]">
            Updated today
          </span>
        )}

        <button
          type="button"
          className="flex items-center gap-1 text-xs font-medium text-[#64748B] transition group-hover:text-[#4F46E5]"
        >
          View details
          <ArrowUpRight size={13} />
        </button>
      </div>
    </motion.article>
  );
}

export default StatCard;