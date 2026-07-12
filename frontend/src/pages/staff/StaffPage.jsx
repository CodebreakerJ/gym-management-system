import { motion } from "motion/react";

function StaffPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <p className="text-sm font-medium text-violet-300">
        GymFlow
      </p>

      <h1 className="mt-2 text-3xl font-semibold text-white">
        Staff
      </h1>

      <p className="mt-2 text-zinc-500">
        Manage staff accounts, roles and access.
      </p>
    </motion.div>
  );
}

export default StaffPage;