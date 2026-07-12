import { motion } from "motion/react";

function LoadingScreen({
  message = "Loading dashboard...",
}) {
  return (
    <div className="flex min-h-[55vh] items-center justify-center">
      <div className="text-center">
        <div className="relative mx-auto h-16 w-16">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-violet-500/20 border-t-violet-400"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          <motion.div
            className="absolute inset-4 rounded-full bg-violet-500/20"
            animate={{
              scale: [0.7, 1, 0.7],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
            }}
          />
        </div>

        <p className="mt-5 text-sm text-zinc-500">
          {message}
        </p>
      </div>
    </div>
  );
}

export default LoadingScreen;