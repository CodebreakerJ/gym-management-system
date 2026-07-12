import {
  Bell,
  LogOut,
  Menu,
  Search,
} from "lucide-react";

import { motion } from "motion/react";

import {
  useNavigate,
} from "react-router-dom";

import {
  logoutUser,
} from "../../services/authService";

import {
  getCurrentGym,
  getCurrentUser,
} from "../../utils/authStorage";

function Header({
  onMenuClick,
  notificationCount = 0,
}) {
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

  const userInitial = (
    user?.first_name ||
    user?.username ||
    "G"
  )
    .charAt(0)
    .toUpperCase();

  return (
    <header className="glass-panel sticky top-0 z-20 flex h-20 items-center justify-between border-b border-white/10 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-xl p-2 text-zinc-300 transition hover:bg-white/5 lg:hidden"
        >
          <Menu size={22} />
        </button>

        <div className="hidden items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-2.5 md:flex">
          <Search
            size={17}
            className="text-zinc-500"
          />

          <input
            type="search"
            className="w-56 bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
            placeholder="Search members, plans..."
          />

          <kbd className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-zinc-500">
            Ctrl K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <motion.button
          type="button"
          whileTap={{
            scale: 0.9,
          }}
          className="relative rounded-2xl border border-white/10 bg-white/[0.035] p-3 text-zinc-300 transition hover:bg-white/[0.07]"
        >
          <Bell size={19} />

          {notificationCount > 0 && (
            <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-violet-500 px-1 text-[10px] font-bold text-white">
              {Math.min(
                notificationCount,
                99
              )}
            </span>
          )}
        </motion.button>

        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-white">
            {user?.first_name ||
              user?.username ||
              "Gym owner"}
          </p>

          <p className="text-xs capitalize text-zinc-500">
            {user?.role || "owner"}
            {" · "}
            {gym?.gym_name || "Gym"}
          </p>
        </div>

        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-violet-500/80 to-cyan-400/80 font-bold text-white shadow-lg shadow-violet-500/20">
          {userInitial}
        </div>

        <button
          type="button"
          onClick={handleLogout}
          title="Logout"
          className="rounded-xl p-2 text-zinc-500 transition hover:bg-rose-500/10 hover:text-rose-300"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}

export default Header;