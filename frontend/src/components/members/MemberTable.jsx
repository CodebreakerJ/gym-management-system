import {
  Pencil,
  RefreshCw,
  Trash2,
} from "lucide-react";

import { motion } from "motion/react";

function MemberTable({
  members,
  onEdit,
  onRenew,
  onDelete,
  deletingMemberId,
  isDeleting,
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b border-violet-100 bg-gradient-to-r from-violet-50/80 via-white to-fuchsia-50/60">
            <tr>
              <TableHeading>
                Member
              </TableHeading>

              <TableHeading>
                Phone
              </TableHeading>

              <TableHeading>
                Plan
              </TableHeading>

              <TableHeading>
                Joining
              </TableHeading>

              <TableHeading>
                Expiry
              </TableHeading>

              <TableHeading>
                Status
              </TableHeading>

              <TableHeading align="right">
                Actions
              </TableHeading>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {members.map(
              (member, index) => (
                <motion.tr
                  key={member.id}
                  initial={{
                    opacity: 0,
                    y: 8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay:
                      Math.min(
                        index * 0.025,
                        0.3
                      ),
                  }}
                  className="group transition hover:bg-violet-50/40"
                >
                  <td className="px-5 py-4">
                    <div className="flex min-w-56 items-center gap-3">
                      <MemberAvatar
                        member={member}
                      />

                      <div>
                        <p className="font-semibold text-slate-900">
                          {member.name}
                        </p>

                        <p className="mt-1 max-w-48 truncate text-xs text-slate-400">
                          {member.email ||
                            "No email provided"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <TableCell>
                    {member.phone || "—"}
                  </TableCell>

                  <TableCell>
                    <span className="inline-flex rounded-xl bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
                      {member.plan_name ||
                        member.plan ||
                        "No plan"}
                    </span>
                  </TableCell>

                  <TableCell>
                    {member.joining_date || "—"}
                  </TableCell>

                  <TableCell>
                    {member.expiry_date || "—"}
                  </TableCell>

                  <TableCell>
                    <StatusBadge
                      member={member}
                    />
                  </TableCell>

                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <ActionButton
                        title="Edit member"
                        onClick={() =>
                          onEdit(member)
                        }
                      >
                        <Pencil size={16} />
                      </ActionButton>

                      <ActionButton
                        title="Renew membership"
                        type="renew"
                        onClick={() =>
                          onRenew(member)
                        }
                      >
                        <RefreshCw size={16} />
                      </ActionButton>

                      <ActionButton
                        title="Delete member"
                        type="delete"
                        disabled={
                          isDeleting &&
                          deletingMemberId ===
                            member.id
                        }
                        onClick={() =>
                          onDelete(member)
                        }
                      >
                        <Trash2 size={16} />
                      </ActionButton>
                    </div>
                  </td>
                </motion.tr>
              )
            )}

            {members.length === 0 && (
              <tr>
                <td
                  colSpan="7"
                  className="px-5 py-16 text-center"
                >
                  <div className="mx-auto max-w-sm">
                    <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-violet-50 text-violet-500">
                      <span className="text-2xl">
                        👥
                      </span>
                    </div>

                    <p className="mt-4 font-semibold text-slate-900">
                      No members found
                    </p>

                    <p className="mt-2 text-sm text-slate-500">
                      Try changing your search or
                      add a new gym member.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MemberAvatar({ member }) {
  const photo =
    member.photo_url ||
    member.photo;

  if (photo) {
    return (
      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-2xl border border-violet-100 bg-violet-50 shadow-sm">
        <img
          src={photo}
          alt={member.name}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  const initial =
    member.name
      ?.trim()
      .charAt(0)
      .toUpperCase() || "M";

  return (
    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white shadow-md shadow-violet-500/20">
      {initial}
    </div>
  );
}

function TableHeading({
  children,
  align = "left",
}) {
  return (
    <th
      className={`whitespace-nowrap px-5 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 ${
        align === "right"
          ? "text-right"
          : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function TableCell({ children }) {
  return (
    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
      {children}
    </td>
  );
}

function StatusBadge({ member }) {
  let status =
    member.membership_status;

  if (!status) {
    status = member.is_active
      ? "active"
      : "expired";
  }

  const styles = {
    active:
      "border-emerald-100 bg-emerald-50 text-emerald-700",

    expiring_soon:
      "border-amber-100 bg-amber-50 text-amber-700",

    expired:
      "border-rose-100 bg-rose-50 text-rose-700",

    inactive:
      "border-slate-200 bg-slate-100 text-slate-600",
  };

  const labels = {
    active: "Active",
    expiring_soon: "Expiring soon",
    expired: "Expired",
    inactive: "Inactive",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold ${
        styles[status] ||
        styles.inactive
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "active"
            ? "bg-emerald-500"
            : status ===
                "expiring_soon"
              ? "bg-amber-500"
              : status === "expired"
                ? "bg-rose-500"
                : "bg-slate-400"
        }`}
      />

      {labels[status] || "Inactive"}
    </span>
  );
}

function ActionButton({
  children,
  onClick,
  title,
  type = "default",
  disabled = false,
}) {
  const styles = {
    default:
      "border-slate-200 bg-white text-slate-500 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-600",

    renew:
      "border-cyan-100 bg-cyan-50/50 text-cyan-600 hover:border-cyan-200 hover:bg-cyan-50",

    delete:
      "border-rose-100 bg-rose-50/50 text-rose-500 hover:border-rose-200 hover:bg-rose-50",
  };

  return (
    <motion.button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      whileHover={
        disabled
          ? undefined
          : {
              y: -2,
              scale: 1.04,
            }
      }
      whileTap={
        disabled
          ? undefined
          : {
              scale: 0.95,
            }
      }
      className={`rounded-xl border p-2.5 shadow-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${
        styles[type]
      }`}
    >
      {children}
    </motion.button>
  );
}

export default MemberTable;