import {
  useQuery,
} from "@tanstack/react-query";

import {
  Activity,
  CalendarClock,
  IndianRupee,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";

import { motion } from "motion/react";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import LoadingScreen from "../../components/ui/LoadingScreen";
import StatCard from "../../components/ui/StatCard";

import {
  getAttendanceTrend,
  getDashboardSummary,
  getExpiringMembers,
  getGenderDistribution,
  getRecentMembers,
  getRevenueSummary,
} from "../../services/dashboardService";

import {
  getCurrentGym,
  getCurrentUser,
} from "../../utils/authStorage";

const chartColors = [
  "#8b5cf6",
  "#22d3ee",
  "#34d399",
  "#fb7185",
];

function formatCurrency(value = 0) {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }
  ).format(Number(value || 0));
}

function DashboardPage() {
  const user = getCurrentUser();
  const gym = getCurrentGym();

  const summaryQuery = useQuery({
    queryKey: [
      "dashboard-summary",
    ],
    queryFn: getDashboardSummary,
  });

  const revenueQuery = useQuery({
    queryKey: [
      "revenue-summary",
    ],
    queryFn: getRevenueSummary,
    enabled:
      user?.role === "owner",
  });

  const genderQuery = useQuery({
    queryKey: [
      "gender-distribution",
    ],
    queryFn: getGenderDistribution,
  });

  const attendanceQuery = useQuery({
    queryKey: [
      "attendance-trend",
      7,
    ],
    queryFn: () =>
      getAttendanceTrend(7),
  });

  const recentMembersQuery =
    useQuery({
      queryKey: [
        "recent-members",
      ],
      queryFn: getRecentMembers,
    });

  const expiringMembersQuery =
    useQuery({
      queryKey: [
        "expiring-members",
      ],
      queryFn: getExpiringMembers,
    });

  if (
    summaryQuery.isLoading
  ) {
    return <LoadingScreen />;
  }

  if (
    summaryQuery.isError
  ) {
    return (
      <div className="glass-panel rounded-3xl border border-rose-400/20 p-8">
        <p className="font-medium text-rose-300">
          Dashboard could not be loaded.
        </p>

        <p className="mt-2 text-sm text-zinc-500">
          Check that Django is running and
          the dashboard API URLs are correct.
        </p>
      </div>
    );
  }

  const summary =
    summaryQuery.data || {};

  const revenue =
    revenueQuery.data || {};

  const genderData =
    Array.isArray(
      genderQuery.data
    )
      ? genderQuery.data
      : [];

  const attendanceData =
    Array.isArray(
      attendanceQuery.data
    )
      ? attendanceQuery.data
      : [];

  const recentMembers =
    Array.isArray(
      recentMembersQuery.data
    )
      ? recentMembersQuery.data
      : [];

  const expiringMembers =
    Array.isArray(
      expiringMembersQuery.data
    )
      ? expiringMembersQuery.data
      : [];

  return (
    <div className="mx-auto max-w-[1600px]">
      <motion.section
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end"
      >
        <div>
          <p className="text-sm font-medium text-violet-300">
            Dashboard overview
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
            Good day,{" "}
            {user?.first_name ||
              user?.username ||
              "Owner"}.
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Here is what is happening at{" "}
            {gym?.gym_name ||
              "your gym"}{" "}
            today.
          </p>
        </div>

        <div className="glass-panel rounded-2xl px-4 py-3 text-sm text-zinc-400">
          Access:{" "}
          <span className="font-medium capitalize text-emerald-300">
            {gym?.access_status ||
              "active"}
          </span>
        </div>
      </motion.section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard
          title="Total members"
          value={
            summary.total_members ??
            0
          }
          description="All registered members"
          icon={Users}
          accent="violet"
          delay={0}
        />

        <StatCard
          title="Active members"
          value={
            summary.active_members ??
            0
          }
          description="Valid membership"
          icon={UserCheck}
          accent="emerald"
          delay={0.06}
        />

        <StatCard
          title="Expired members"
          value={
            summary.expired_members ??
            0
          }
          description="Need renewal"
          icon={UserX}
          accent="rose"
          delay={0.12}
        />

        <StatCard
          title="Today's attendance"
          value={
            summary.today_attendance ??
            0
          }
          description="Checked in today"
          icon={Activity}
          accent="cyan"
          delay={0.18}
        />

        <StatCard
          title="Expiring soon"
          value={
            summary.expiring_next_7_days ??
            0
          }
          description="Within next 7 days"
          icon={CalendarClock}
          accent="amber"
          delay={0.24}
        />

        <StatCard
          title="Monthly revenue"
          value={
            user?.role === "owner"
              ? formatCurrency(
                  revenue.monthly_revenue
                )
              : "Restricted"
          }
          description={
            user?.role === "owner"
              ? `${
                  revenue.renewals_this_month ||
                  0
                } renewals`
              : "Owner access only"
          }
          icon={IndianRupee}
          accent="violet"
          delay={0.3}
        />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_.8fr]">
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
            delay: 0.32,
          }}
          className="glass-panel rounded-3xl p-5 sm:p-6"
        >
          <h2 className="text-lg font-semibold text-white">
            Attendance trend
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Last seven days check-in
            activity
          </p>

          <div className="mt-5 h-80">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <AreaChart
                data={attendanceData}
              >
                <defs>
                  <linearGradient
                    id="attendanceGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#8b5cf6"
                      stopOpacity={0.45}
                    />

                    <stop
                      offset="95%"
                      stopColor="#8b5cf6"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#27272a"
                  vertical={false}
                />

                <XAxis
                  dataKey="day"
                  stroke="#71717a"
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  stroke="#71717a"
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />

                <Tooltip
                  contentStyle={{
                    background:
                      "#18181b",
                    border:
                      "1px solid rgba(255,255,255,.1)",
                    borderRadius: 16,
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="attendance"
                  stroke="#a78bfa"
                  strokeWidth={3}
                  fill="url(#attendanceGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.article>

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
            delay: 0.38,
          }}
          className="glass-panel rounded-3xl p-5 sm:p-6"
        >
          <h2 className="text-lg font-semibold text-white">
            Member mix
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Gender distribution
          </p>

          <div className="h-64">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>
                <Pie
                  data={genderData}
                  dataKey="members"
                  nameKey="gender"
                  innerRadius={62}
                  outerRadius={90}
                  paddingAngle={4}
                >
                  {genderData.map(
                    (
                      item,
                      index
                    ) => (
                      <Cell
                        key={`${item.gender}-${index}`}
                        fill={
                          chartColors[
                            index %
                              chartColors.length
                          ]
                        }
                      />
                    )
                  )}
                </Pie>

                <Tooltip
                  contentStyle={{
                    background:
                      "#18181b",
                    border:
                      "1px solid rgba(255,255,255,.1)",
                    borderRadius: 16,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {genderData.map(
              (
                item,
                index
              ) => (
                <div
                  key={item.gender}
                  className="flex items-center gap-2 text-xs text-zinc-400"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      background:
                        chartColors[
                          index %
                            chartColors.length
                        ],
                    }}
                  />

                  {item.gender}:{" "}
                  {item.members}
                </div>
              )
            )}
          </div>
        </motion.article>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <MemberListCard
          title="Recent members"
          description="Latest members joining your gym"
          members={recentMembers}
          type="recent"
        />

        <MemberListCard
          title="Expiring soon"
          description="Memberships needing attention"
          members={expiringMembers}
          type="expiring"
        />
      </section>
    </div>
  );
}

function MemberListCard({
  title,
  description,
  members,
  type,
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
        delay: 0.44,
      }}
      className="glass-panel rounded-3xl p-5 sm:p-6"
    >
      <h2 className="text-lg font-semibold text-white">
        {title}
      </h2>

      <p className="mt-1 text-sm text-zinc-500">
        {description}
      </p>

      <div className="mt-5 space-y-2">
        {members.length > 0 ? (
          members
            .slice(0, 5)
            .map(
              (
                member,
                index
              ) => (
                <motion.div
                  key={
                    member.id ||
                    index
                  }
                  initial={{
                    opacity: 0,
                    x: -10,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    delay:
                      0.5 +
                      index *
                        0.05,
                  }}
                  className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.025] px-4 py-3.5 transition hover:border-white/10 hover:bg-white/[0.05]"
                >
                  <div>
                    <p className="font-medium text-white">
                      {member.name}
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                      {member.phone ||
                        member.plan}
                    </p>
                  </div>

                  {type ===
                  "expiring" ? (
                    <div className="rounded-xl bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-300">
                      {
                        member.expiry_date
                      }
                    </div>
                  ) : (
                    <div className="text-right">
                      <p className="text-sm text-violet-300">
                        {
                          member.plan
                        }
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        {
                          member.joining_date
                        }
                      </p>
                    </div>
                  )}
                </motion.div>
              )
            )
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 py-10 text-center text-sm text-zinc-600">
            No records available.
          </div>
        )}
      </div>
    </motion.article>
  );
}

export default DashboardPage;