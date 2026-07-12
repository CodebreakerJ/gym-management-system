import {
  LogOut,
  ShieldCheck,
} from "lucide-react";

import { motion } from "motion/react";

import { useNavigate } from "react-router-dom";

import { logoutUser } from "../../services/authService";

import {
  getCurrentGym,
  getCurrentUser,
} from "../../utils/authStorage";

function DashboardPage() {
  const navigate = useNavigate();

  const user = getCurrentUser();
  const gym = getCurrentGym();

  async function handleLogout() {
    await logoutUser();

    navigate(
      "/login",
      { replace: true }
    );
  }

  return (
    <div className="grid min-h-screen place-items-center bg-zinc-950 p-5">
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="glass-panel w-full max-w-2xl rounded-3xl p-8"
      >
        <p className="text-sm font-medium text-violet-300">
          Authentication successful
        </p>

        <h1 className="mt-3 text-4xl font-semibold text-white">
          Welcome,{" "}
          {user?.first_name ||
            user?.username ||
            "Gym owner"}
        </h1>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <InformationCard
            label="Gym"
            value={gym?.gym_name}
          />

          <InformationCard
            label="Role"
            value={user?.role}
          />

          <InformationCard
            label="Access status"
            value={gym?.access_status}
          />

          <InformationCard
            label="Expiry date"
            value={gym?.access_expiry_date}
          />
        </div>

        <div className="mt-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-emerald-300">
            <ShieldCheck size={18} />

            Protected dashboard route
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-2xl bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-300 transition hover:bg-rose-500/20"
          >
            <LogOut size={17} />

            Logout
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function InformationCard({
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
      <p className="text-xs uppercase tracking-wider text-zinc-600">
        {label}
      </p>

      <p className="mt-2 capitalize text-white">
        {value || "Not available"}
      </p>
    </div>
  );
}

export default DashboardPage;