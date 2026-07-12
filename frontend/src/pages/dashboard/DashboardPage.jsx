import { useQuery } from "@tanstack/react-query";

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
  "#4F46E5",
  "#06B6D4",
  "#22C55E",
  "#F59E0B",
];

function formatCurrency(value = 0) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function DashboardPage() {
  const user = getCurrentUser();
  const gym = getCurrentGym();

  const summaryQuery = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: getDashboardSummary,
  });

  const revenueQuery = useQuery({
    queryKey: ["revenue-summary"],
    queryFn: getRevenueSummary,
    enabled: user?.role === "owner",
  });

  const genderQuery = useQuery({
    queryKey: ["gender-distribution"],
    queryFn: getGenderDistribution,
  });

  const attendanceQuery = useQuery({
    queryKey: ["attendance-trend", 7],
    queryFn: () => getAttendanceTrend(7),
  });

  const recentMembersQuery = useQuery({
    queryKey: ["recent-members"],
    queryFn: getRecentMembers,
  });

  const expiringMembersQuery = useQuery({
    queryKey: ["expiring-members"],
    queryFn: getExpiringMembers,
  });

  if (summaryQuery.isLoading) {
    return <LoadingScreen />;
  }

  if (summaryQuery.isError) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 shadow-sm">
        <p className="font-semibold text-rose-600">
          Dashboard could not be loaded.
        </p>

        <p className="mt-2 text-sm text-slate-500">
          Check that Django is running and the dashboard API URLs are correct.
        </p>
      </div>
    );
  }

  const summary = summaryQuery.data || {};
  const revenue = revenueQuery.data || {};

  const genderData = Array.isArray(genderQuery.data)
    ? genderQuery.data
    : [];

  const attendanceData = Array.isArray(attendanceQuery.data)
    ? attendanceQuery.data
    : [];

  const recentMembers = Array.isArray(recentMembersQuery.data)
    ? recentMembersQuery.data
    : [];

  const expiringMembers = Array.isArray(expiringMembersQuery.data)
    ? expiringMembersQuery.data
    : [];

  return (
    <div className="mx-auto max-w-[1600px]">
      <motion.section
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end"
      >
        <div>
          <p className="text-sm font-semibold text-violet-600">
            Dashboard overview
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-slate-900 sm:text-4xl">
            Good day,{" "}
            {user?.first_name ||
              user?.username ||
              "Owner"}
            .
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Here is what is happening at{" "}
            {gym?.gym_name || "your gym"} today.
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-slate-500 shadow-sm">
          Access:{" "}
          <span className="font-semibold capitalize text-emerald-600">
            {gym?.access_status || "active"}
          </span>
        </div>
      </motion.section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard
          title="Total members"
          value={summary.total_members ?? 0}
          description="All registered members"
          icon={Users}
          accent="indigo"
          growth={12}
          delay={0}
        />

        <StatCard
          title="Active members"
          value={summary.active_members ?? 0}
          description="Valid membership"
          icon={UserCheck}
          accent="green"
          growth={8}
          delay={0.06}
        />

        <StatCard
          title="Expired members"
          value={summary.expired_members ?? 0}
          description="Need renewal"
          icon={UserX}
          accent="red"
          growth={3}
          trend="down"
          delay={0.12}
        />

        <StatCard
          title="Today's attendance"
          value={summary.today_attendance ?? 0}
          description="Checked in today"
          icon={Activity}
          accent="cyan"
          growth={5}
          delay={0.18}
        />

        <StatCard
          title="Expiring soon"
          value={summary.expiring_next_7_days ?? 0}
          description="Within next 7 days"
          icon={CalendarClock}
          accent="orange"
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
          accent="indigo"
          growth={10}
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
          className="rounded-[20px] border border-[#E5E7EB] bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.05)]"
        >
          <h2 className="text-lg font-semibold text-slate-900">
            Attendance trend
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Last seven days check-in activity
          </p>

          <div className="mt-5 h-80">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <AreaChart data={attendanceData}>
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
                    stopColor="#4F46E5"
                    stopOpacity={0.22}
                  />

                  <stop
                    offset="95%"
                    stopColor="#4F46E5"
                    stopOpacity={0}
                  />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E5E7EB"
                  vertical={false}
                />

                <XAxis
                  dataKey="day"
                  stroke="#94a3b8"
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  stroke="#94a3b8"
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />

                <Tooltip
                  contentStyle={{
                    background: "#ffffff",
                    border: "1px solid #ddd6fe",
                    borderRadius: 16,
                    color: "#1e1b4b",
                    boxShadow:
                      "0 18px 40px rgba(76,29,149,.14)",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="attendance"
                  stroke="#4F46E5"
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
          className="rounded-[20px] border border-[#E5E7EB] bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.05)]"
        >
          <h2 className="text-lg font-semibold text-slate-900">
            Member mix
          </h2>

          <p className="mt-1 text-sm text-slate-500">
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
                  {genderData.map((item, index) => (
                    <Cell
                      key={`${item.gender}-${index}`}
                      fill={
                        chartColors[
                          index % chartColors.length
                        ]
                      }
                    />
                  ))}
                </Pie>

                <Tooltip
                  contentStyle={{
                    background: "#ffffff",
                    border: "1px solid #ddd6fe",
                    borderRadius: 16,
                    color: "#1e1b4b",
                    boxShadow:
                      "0 18px 40px rgba(76,29,149,.14)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {genderData.map((item, index) => (
              <div
                key={item.gender}
                className="flex items-center gap-2 text-xs text-slate-500"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    background:
                      chartColors[
                        index % chartColors.length
                      ],
                  }}
                />

                {item.gender}: {item.members}
              </div>
            ))}
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
      className="rounded-[20px] border border-[#E5E7EB] bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.05)]"
    >
      <h2 className="text-lg font-semibold text-slate-900">
        {title}
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        {description}
      </p>

      <div className="mt-5 space-y-2">
        {members.length > 0 ? (
          members
            .slice(0, 5)
            .map((member, index) => (
              <motion.div
                key={member.id || index}
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
                    index * 0.05,
                }}
                className="flex items-center justify-between rounded-2xl border border-violet-100 bg-violet-50/40 px-4 py-3.5 transition hover:border-violet-200 hover:bg-violet-50"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {member.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {member.phone ||
                      member.plan}
                  </p>
                </div>

                {type === "expiring" ? (
                  <div className="rounded-xl bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-700">
                    {member.expiry_date}
                  </div>
                ) : (
                  <div className="text-right">
                    <p className="text-sm font-medium text-violet-600">
                      {member.plan}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {member.joining_date}
                    </p>
                  </div>
                )}
              </motion.div>
            ))
        ) : (
          <div className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/30 py-10 text-center text-sm text-slate-400">
            No records available.
          </div>
        )}
      </div>
    </motion.article>
  );
}

export default DashboardPage;