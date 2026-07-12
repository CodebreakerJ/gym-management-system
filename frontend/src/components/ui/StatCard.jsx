import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";

const accentStyles = {
  violet:
    "from-violet-500/25 to-fuchsia-500/5 text-violet-300 ring-violet-400/20",

  cyan:
    "from-cyan-500/25 to-blue-500/5 text-cyan-300 ring-cyan-400/20",

  emerald:
    "from-emerald-500/25 to-teal-500/5 text-emerald-300 ring-emerald-400/20",

  amber:
    "from-amber-500/25 to-orange-500/5 text-amber-300 ring-amber-400/20",

  rose:
    "from-rose-500/25 to-red-500/5 text-rose-300 ring-rose-400/20",
};

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  accent = "violet",
  delay = 0,
}) {
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
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{
        y: -5,
        scale: 1.012,
      }}
      className="glass-panel relative overflow-hidden rounded-3xl p-5 shadow-2xl shadow-black/10"
    >
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/[0.025] blur-xl" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-400">
            {title}
          </p>

          <h3 className="mt-3 text-3xl font-semibold tracking-tight text-white">
            {value}
          </h3>

          <p className="mt-2 text-xs text-zinc-500">
            {description}
          </p>
        </div>

        <div
          className={`rounded-2xl bg-gradient-to-br p-3 ring-1 ${
            accentStyles[accent]
          }`}
        >
          <Icon size={22} />
        </div>
      </div>

      <div className="relative mt-5 flex items-center gap-1 text-xs text-zinc-500">
        View details
        <ArrowUpRight size={13} />
      </div>
    </motion.article>
  );
}

export default StatCard;