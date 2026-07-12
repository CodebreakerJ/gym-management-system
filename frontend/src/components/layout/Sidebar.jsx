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

import {
  NavLink,
} from "react-router-dom";

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
          className="fixed inset-0 z-30 bg-black/65 backdrop-blur-sm lg:hidden"
        />
      )}

      <motion.aside
        initial={false}
        animate={{
          x: isOpen ? 0 : "-100%",
        }}
        transition={{
          type: "spring",
          stiffness: 320,
          damping: 34,
        }}
        className="glass-panel fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/10 lg:translate-x-0"
      >
        <div className="flex h-20 items-center justify-between px-6">
          <NavLink
            to="/dashboard"
            onClick={onClose}
            className="flex items-center gap-3"
          >
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 shadow-lg shadow-violet-500/25">
              <Dumbbell
                className="text-white"
                size={23}
              />
            </div>

            <div>
              <p className="text-lg font-bold tracking-tight text-white">
                GymFlow
              </p>

              <p className="max-w-40 truncate text-xs text-zinc-500">
                {gym?.gym_name ||
                  "Management Suite"}
              </p>
            </div>
          </NavLink>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-zinc-400 transition hover:bg-white/5 hover:text-white lg:hidden"
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
                  className={({
                    isActive,
                  }) =>
                    `group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-white/10 text-white shadow-inner shadow-white/5"
                        : "text-zinc-400 hover:bg-white/5 hover:text-white"
                    }`
                  }
                >
                  {({
                    isActive,
                  }) => (
                    <>
                      {isActive && (
                        <motion.span
                          layoutId="active-navigation"
                          className="absolute left-0 h-7 w-1 rounded-r-full bg-gradient-to-b from-violet-400 to-cyan-400"
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

        <div className="m-4 rounded-3xl border border-violet-400/15 bg-gradient-to-br from-violet-500/15 to-cyan-500/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
            Software access
          </p>

          <p className="mt-2 text-sm text-white">
            {gym?.access_status === "active"
              ? "Active access"
              : "Check access"}
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            Expires{" "}
            {gym?.access_expiry_date ||
              "not configured"}
          </p>
        </div>
      </motion.aside>
    </>
  );
}

export default Sidebar;