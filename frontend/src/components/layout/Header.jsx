import {
  Bell,
  ChevronDown,
  Command,
  LogOut,
  Menu,
  Plus,
  Search,
} from "lucide-react";

import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

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

  const userName =
    user?.first_name ||
    user?.username ||
    "Gym Owner";

  const userInitial = userName
    .charAt(0)
    .toUpperCase();

  async function handleLogout() {
    await logoutUser();

    navigate("/login", {
      replace: true,
    });
  }

  function handleQuickAdd() {
    navigate("/members");
  }

  return (
    <header className="sticky top-0 z-20 border-b border-[#E5E7EB] bg-white/85 px-4 py-3 shadow-[0_4px_20px_rgba(15,23,42,0.04)] backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4">
        {/* Left side */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation"
            className="grid h-11 w-11 place-items-center rounded-2xl border border-[#E5E7EB] bg-white text-[#64748B] shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-[#4F46E5] lg:hidden"
          >
            <Menu size={21} />
          </button>

          {/* Global search */}
          <motion.div
            whileHover={{
              y: -1,
            }}
            className="hidden w-full max-w-xl md:block"
          >
            <div className="group relative overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm transition-all duration-200 focus-within:border-[#4F46E5] focus-within:shadow-[0_8px_30px_rgba(79,70,229,0.10)] focus-within:ring-4 focus-within:ring-indigo-100">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#4F46E5] text-white shadow-md shadow-indigo-500/20">
                  <Search size={16} />
                </div>
              </div>

              <input
                type="search"
                placeholder="Search members, plans, attendance..."
                className="h-14 w-full bg-transparent pl-14 pr-24 text-sm font-medium text-[#111827] outline-none placeholder:font-normal placeholder:text-[#94A3B8]"
              />

              <div className="absolute inset-y-0 right-3 flex items-center">
                <span className="hidden items-center gap-1 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-2.5 py-1.5 text-[11px] font-semibold text-[#64748B] sm:flex">
                  <Command size={12} />
                  K
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right side */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <motion.button
            type="button"
            onClick={handleQuickAdd}
            whileHover={{
              y: -2,
              scale: 1.01,
            }}
            whileTap={{
              scale: 0.97,
            }}
            className="hidden items-center gap-2 rounded-2xl bg-gradient-to-r from-[#4F46E5] to-[#06B6D4] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:shadow-xl hover:shadow-indigo-500/25 lg:flex"
          >
            <Plus size={17} />
            Quick add
          </motion.button>

          <motion.button
            type="button"
            whileHover={{
              y: -2,
            }}
            whileTap={{
              scale: 0.95,
            }}
            aria-label="Notifications"
            className="relative grid h-12 w-12 place-items-center rounded-2xl border border-[#E5E7EB] bg-white text-[#4F46E5] shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50"
          >
            <Bell size={19} />

            {notificationCount > 0 && (
              <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full border-2 border-white bg-[#EF4444] px-1 text-[10px] font-bold text-white">
                {Math.min(
                  notificationCount,
                  99
                )}
              </span>
            )}
          </motion.button>

          <div className="hidden items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white py-2 pl-2 pr-3 shadow-sm transition hover:border-indigo-200 hover:shadow-md sm:flex">
            <div className="relative">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#4F46E5] to-[#06B6D4] font-bold text-white shadow-md shadow-indigo-500/20">
                {userInitial}
              </div>

              <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#22C55E]" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <p className="max-w-28 truncate text-sm font-semibold text-[#111827]">
                  {userName}
                </p>

                <ChevronDown
                  size={14}
                  className="text-[#94A3B8]"
                />
              </div>

              <p className="max-w-36 truncate text-xs capitalize text-[#64748B]">
                {user?.role || "owner"}
                {" · "}
                {gym?.gym_name || "Gym"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title="Logout"
            aria-label="Logout"
            className="grid h-11 w-11 place-items-center rounded-2xl text-[#94A3B8] transition hover:bg-red-50 hover:text-[#EF4444]"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;