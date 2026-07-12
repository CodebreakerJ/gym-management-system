import { motion } from "motion/react";

function SettingsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <p className="text-sm font-medium text-violet-300">
        GymFlow
      </p>

      <h1 className="mt-2 text-3xl font-semibold text-white">
        Settings
      </h1>

      <p className="mt-2 text-zinc-500">
        Update gym profile, business hours and preferences.
      </p>
    </motion.div>
  );
}

export default SettingsPage;