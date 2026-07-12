import {
  Bell,
  CalendarCheck,
  ChartNoAxesCombined,
  Dumbbell,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

import { motion } from "motion/react";
import { NavLink } from "react-router-dom";

import {
  getCurrentGym,
} from "../../utils/authStorage";

const navigationItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Members",
    path: "/members",
    icon: Users,
  },
  {
    label: "Attendance",
    path: "/attendance",
    icon: CalendarCheck,
  },
  {
    label: "Membership Plans",
    path: "/plans",
    icon: Dumbbell,
  },
  {
    label: "Reports",
    path: "/reports",
    icon: ChartNoAxesCombined,
  },
  {
    label: "Notifications",
    path: "/notifications",
    icon: Bell,
  },
  {
    label: "Staff",
    path: "/staff",
    icon: ShieldCheck,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

function Sidebar({
  isOpen,
  onClose,
}) {
  const gym = getCurrentGym();

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-slate-950/35 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/5 bg-[#111827] shadow-2xl shadow-slate-950/20 transition-transform duration-300 ease-out lg:translate-x-0 ${
          isOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/5 px-6">
          <NavLink
            to="/dashboard"
            onClick={onClose}
            className="flex items-center gap-3"
          >
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#4F46E5] to-[#06B6D4] shadow-lg shadow-indigo-950/30">
              <Dumbbell
                className="text-white"
                size={23}
              />
            </div>

            <div>
              <p className="text-lg font-bold tracking-tight text-white">
                GymFlow
              </p>

              <p className="max-w-40 truncate text-xs text-slate-400">
                {gym?.gym_name ||
                  "Management Suite"}
              </p>
            </div>
          </NavLink>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
          {navigationItems.map(
            ({
              label,
              path,
              icon: Icon,
            }, index) => (
              <motion.div
                key={path}
                initial={{
                  opacity: 0,
                  x: -12,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  delay: 0.04 * index,
                }}
              >
                <NavLink
                  to={path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white shadow-lg shadow-indigo-950/20"
                        : "text-slate-400 hover:bg-[#1F2937] hover:text-white"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.span
                          layoutId="active-navigation"
                          className="absolute left-0 h-7 w-1 rounded-r-full bg-[#06B6D4]"
                        />
                      )}

                      <Icon
                        size={19}
                        className="transition-transform group-hover:scale-110"
                      />

                      {label}
                    </>
                  )}
                </NavLink>
              </motion.div>
            )
          )}
        </nav>

        <div className="m-4 rounded-3xl border border-white/10 bg-[#1F2937] p-4 shadow-inner shadow-black/10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Software access
          </p>

          <p className="mt-2 text-sm font-semibold text-white">
            {gym?.access_status === "active"
              ? "Active access"
              : "Check access"}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Expires{" "}
            {gym?.access_expiry_date ||
              "not configured"}
          </p>

          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-700">
            <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-[#4F46E5] to-[#06B6D4]" />
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;